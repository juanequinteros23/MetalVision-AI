"""
Predictions API Router
"""
from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from pathlib import Path
from datetime import datetime
import uuid

from PIL import Image

from ..services.ml_service import get_ml_service
from ..services.db_service import DBService
from ..models.prediction import Prediction
from ..utils.decorators import role_required

predictions_bp = Blueprint('predictions', __name__, url_prefix='/api/predictions')

# Configuration
UPLOAD_FOLDER = Path(__file__).resolve().parent.parent.parent.parent / 'uploads'
UPLOAD_FOLDER.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'webp', 'tiff', 'tif', 'gif', 'jfif'}

# Initialize services
ml_service = get_ml_service()
db_service = DBService()


def is_valid_image(file_stream):
    """Verify if stream contains valid image data decodable by PIL"""
    try:
        pos = file_stream.tell()
        with Image.open(file_stream) as img:
            fmt = (img.format or 'JPEG').lower()
            img.verify()
        file_stream.seek(pos)
        return True, fmt
    except Exception:
        try:
            file_stream.seek(0)
            with Image.open(file_stream) as img:
                fmt = (img.format or 'JPEG').lower()
            file_stream.seek(0)
            return True, fmt
        except Exception:
            return False, None


@predictions_bp.route('/predict', methods=['POST'])
@jwt_required()
def predict_single():
    """
    Make prediction on a single image (accepts any image format, resolution, and name)
    """
    try:
        user_id = get_jwt_identity()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó ningún archivo de imagen'}), 400
        
        file = request.files['file']
        
        if not file or file.filename == '':
            return jsonify({'error': 'Archivo de imagen no seleccionado o nombre vacío'}), 400
        
        # Verify image stream with PIL
        valid, detected_fmt = is_valid_image(file.stream)
        if not valid:
            return jsonify({
                'error': 'El archivo seleccionado no es una imagen válida o está dañado. Formatos aceptados: JPG, PNG, BMP, WEBP, TIFF, GIF y cualquier captura fotográfica.'
            }), 400
        
        model_name = request.form.get('model', 'ensemble')
        
        # Generate safe filename and guarantee an image extension
        raw_name = secure_filename(file.filename)
        if not raw_name:
            raw_name = f"sample_{uuid.uuid4().hex[:8]}"
        
        if '.' not in raw_name:
            ext = f".{detected_fmt}" if detected_fmt in ['jpeg', 'jpg', 'png', 'bmp', 'webp', 'tiff', 'tif', 'gif'] else ".jpg"
            raw_name = f"{raw_name}{ext}"
        
        unique_filename = f"{uuid.uuid4()}_{raw_name}"
        file_path = UPLOAD_FOLDER / unique_filename
        file.save(str(file_path))
        
        # Make prediction
        prediction_result = ml_service.predict_single(str(file_path), model_name)
        
        # Save prediction to database
        prediction = Prediction(
            user_id=int(user_id),
            image_path=str(file_path),
            predicted_class=prediction_result['predicted_class'],
            confidence=prediction_result['confidence'],
            model_used=model_name
        )
        db_service.add_prediction(prediction)
        
        return jsonify({
            'success': True,
            'prediction_id': prediction.id,
            'predicted_class': prediction_result['predicted_class'],
            'confidence': prediction_result['confidence'],
            'probabilities': prediction_result['probabilities'],
            'model_used': model_name,
            'timestamp': prediction.created_at.isoformat(),
            'image_url': f"/api/predictions/images/{unique_filename}"
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@predictions_bp.route('/images/<path:filename>', methods=['GET'])
def get_uploaded_image(filename):
    """Serve uploaded inspection image for UI and PDF generation"""
    try:
        return send_from_directory(str(UPLOAD_FOLDER), filename)
    except Exception:
        return jsonify({'error': 'Image not found'}), 404


@predictions_bp.route('/batch', methods=['POST'])
@jwt_required()
def predict_batch():
    """
    Make predictions on multiple images
    """
    try:
        user_id = get_jwt_identity()
        
        if 'files' not in request.files:
            return jsonify({'error': 'No se enviaron archivos'}), 400
        
        files = request.files.getlist('files')
        
        if not files:
            return jsonify({'error': 'Lista de archivos vacía'}), 400
        
        model_name = request.form.get('model', 'ensemble')
        
        results = []
        saved_paths = []
        
        for file in files:
            if not file or file.filename == '':
                continue
            
            valid, detected_fmt = is_valid_image(file.stream)
            if not valid:
                results.append({
                    'filename': file.filename or 'desconocido',
                    'error': 'Formato no compatible o archivo dañado'
                })
                continue
            
            raw_name = secure_filename(file.filename) or f"sample_{uuid.uuid4().hex[:8]}"
            if '.' not in raw_name:
                ext = f".{detected_fmt}" if detected_fmt in ['jpeg', 'jpg', 'png', 'bmp', 'webp', 'tiff', 'tif', 'gif'] else ".jpg"
                raw_name = f"{raw_name}{ext}"
            
            unique_filename = f"{uuid.uuid4()}_{raw_name}"
            file_path = UPLOAD_FOLDER / unique_filename
            file.save(str(file_path))
            saved_paths.append(str(file_path))
        
        # Make batch prediction
        predictions = ml_service.predict_batch(saved_paths, model_name)
        
        # Save predictions to database
        batch_id = str(uuid.uuid4())
        for pred in predictions:
            if pred.get('success'):
                prediction = Prediction(
                    user_id=user_id,
                    image_path=pred['image_path'],
                    predicted_class=pred['predicted_class'],
                    confidence=pred['confidence'],
                    model_used=model_name,
                    batch_id=batch_id
                )
                db_service.add_prediction(prediction)
                results.append({
                    'prediction_id': prediction.id,
                    'filename': Path(pred['image_path']).name,
                    'predicted_class': pred['predicted_class'],
                    'confidence': pred['confidence'],
                    'probabilities': pred['probabilities']
                })
            else:
                results.append({
                    'filename': Path(pred['image_path']).name,
                    'error': pred.get('error', 'Unknown error')
                })
        
        return jsonify({
            'success': True,
            'batch_id': batch_id,
            'total_images': len(files),
            'predictions': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@predictions_bp.route('/history', methods=['GET'])
@jwt_required()
def get_prediction_history():
    """
    Get prediction history for current user
    
    Query params:
        - limit: Max number of predictions to return (default: 50)
        - offset: Offset for pagination (default: 0)
    
    Response:
        {
            "success": true,
            "total": 100,
            "predictions": [...]
        }
    """
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        predictions = db_service.get_user_predictions(user_id, limit, offset)
        total = db_service.count_user_predictions(user_id)
        
        results = []
        for pred in predictions:
            image_name = Path(pred.image_path).name if pred.image_path else None
            results.append({
                'id': pred.id,
                'predicted_class': pred.predicted_class,
                'confidence': pred.confidence,
                'model_used': pred.model_used,
                'batch_id': pred.batch_id,
                'created_at': pred.created_at.isoformat(),
                'image_url': f"/api/predictions/images/{image_name}" if image_name else None
            })
        
        return jsonify({
            'success': True,
            'total': total,
            'limit': limit,
            'offset': offset,
            'predictions': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@predictions_bp.route('/<prediction_id>', methods=['GET'])
@jwt_required()
def get_prediction(prediction_id):
    """
    Get details of a specific prediction
    """
    try:
        user_id = get_jwt_identity()
        
        prediction = db_service.get_prediction_by_id(prediction_id)
        
        if not prediction:
            return jsonify({'error': 'Prediction not found'}), 404
        
        # Check ownership
        if str(prediction.user_id) != str(user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        image_name = Path(prediction.image_path).name if prediction.image_path else None
        return jsonify({
            'success': True,
            'prediction': {
                'id': prediction.id,
                'predicted_class': prediction.predicted_class,
                'confidence': prediction.confidence,
                'model_used': prediction.model_used,
                'batch_id': prediction.batch_id,
                'created_at': prediction.created_at.isoformat(),
                'image_url': f"/api/predictions/images/{image_name}" if image_name else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@predictions_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_prediction_stats():
    """
    Get prediction statistics for current user
    
    Response:
        {
            "success": true,
            "stats": {
                "total_predictions": 100,
                "by_class": {...},
                "by_model": {...},
                "avg_confidence": 0.95
            }
        }
    """
    try:
        user_id = get_jwt_identity()
        
        stats = db_service.get_prediction_stats(user_id)
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@predictions_bp.route('/models/info', methods=['GET'])
def get_models_info():
    """
    Get information about available models
    
    Response:
        {
            "models_loaded": ["efficientnet", "resnet50", "vgg16"],
            "classes": [...],
            "image_size": [224, 224]
        }
    """
    try:
        info = ml_service.get_model_info()
        return jsonify(info), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
