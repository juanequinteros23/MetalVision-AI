"""
Database Service
Funciones CRUD para interactuar con la base de datos
"""

from datetime import datetime, timedelta
from sqlalchemy import func
import bcrypt

from src.config.database import db
from src.models.user import User
from src.models.prediction import Prediction
from src.models.batch_job import BatchJob
from src.models.token_blacklist import TokenBlacklist

# ============================================================================
# USER CRUD OPERATIONS
# ============================================================================

def create_user(username, email, password, role='user'):
    """
    Crea un nuevo usuario
    
    Args:
        username: Nombre de usuario
        email: Email del usuario
        password: Contraseña en texto plano
        role: Rol del usuario ('user' o 'admin')
        
    Returns:
        User: Usuario creado
    """
    # Hash de contraseña
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    user = User(
        username=username,
        email=email,
        password_hash=password_hash.decode('utf-8'),
        role=role
    )
    
    db.session.add(user)
    db.session.commit()
    
    return user

def get_user_by_id(user_id):
    """Obtiene usuario por ID"""
    return User.query.get(user_id)

def get_user_by_username(username):
    """Obtiene usuario por username"""
    return User.query.filter_by(username=username).first()

def get_user_by_email(email):
    """Obtiene usuario por email"""
    return User.query.filter_by(email=email).first()

def get_all_users(limit=50, offset=0):
    """
    Obtiene lista de todos los usuarios con paginación
    
    Args:
        limit: Número máximo de usuarios
        offset: Desplazamiento para paginación
        
    Returns:
        tuple: (lista de usuarios, total)
    """
    total = User.query.count()
    users = User.query.order_by(User.created_at.desc()).limit(limit).offset(offset).all()
    
    return users, total

def update_user(user_id, updates):
    """
    Actualiza un usuario
    
    Args:
        user_id: ID del usuario
        updates: Dict con campos a actualizar
        
    Returns:
        User: Usuario actualizado o None si no existe
    """
    user = User.query.get(user_id)
    if not user:
        return None
    
    # Actualizar campos permitidos
    if 'role' in updates and updates['role'] in ['user', 'admin']:
        user.role = updates['role']
    
    if 'is_active' in updates:
        user.is_active = bool(updates['is_active'])
    
    if 'email' in updates:
        user.email = updates['email']
    
    db.session.commit()
    return user

def delete_user(user_id):
    """
    Desactiva un usuario (soft delete)
    
    Args:
        user_id: ID del usuario
        
    Returns:
        bool: True si se desactivó correctamente
    """
    user = User.query.get(user_id)
    if user:
        user.is_active = False
        db.session.commit()
        return True
    return False

def verify_password(user, password):
    """
    Verifica la contraseña de un usuario
    
    Args:
        user: Instancia de User
        password: Contraseña en texto plano
        
    Returns:
        bool: True si la contraseña es correcta
    """
    return bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8'))

# ============================================================================
# PREDICTION CRUD OPERATIONS
# ============================================================================

def create_prediction(user_id, image_url, heatmap_url, predicted_class, confidence, model_version='v1.0'):
    """
    Crea una nueva predicción
    
    Args:
        user_id: ID del usuario
        image_url: URL de la imagen en S3
        heatmap_url: URL del heatmap en S3
        predicted_class: Clase predicha
        confidence: Confianza de la predicción
        model_version: Versión del modelo
        
    Returns:
        Prediction: Predicción creada
    """
    prediction = Prediction(
        user_id=user_id,
        image_url=image_url,
        heatmap_url=heatmap_url,
        predicted_class=predicted_class,
        confidence=confidence,
        model_version=model_version
    )
    
    db.session.add(prediction)
    db.session.commit()
    
    return prediction

def get_prediction_by_id(prediction_id, user_id):
    """
    Obtiene una predicción por ID (solo del usuario)
    
    Args:
        prediction_id: ID de la predicción
        user_id: ID del usuario
        
    Returns:
        Prediction: Predicción o None
    """
    return Prediction.query.filter_by(id=prediction_id, user_id=user_id).first()

def get_predictions_by_user(user_id, limit=50, offset=0, filters=None):
    """
    Obtiene predicciones de un usuario con filtros opcionales
    
    Args:
        user_id: ID del usuario
        limit: Límite de resultados
        offset: Desplazamiento
        filters: Dict con filtros opcionales
        
    Returns:
        tuple: (lista de predicciones, total)
    """
    query = Prediction.query.filter_by(user_id=user_id)
    
    # Aplicar filtros
    if filters:
        if 'class' in filters and filters['class']:
            query = query.filter(Prediction.predicted_class.in_(filters['class']))
        
        if 'min_confidence' in filters:
            query = query.filter(Prediction.confidence >= filters['min_confidence'])
        
        if 'date_from' in filters:
            query = query.filter(Prediction.created_at >= filters['date_from'])
        
        if 'date_to' in filters:
            query = query.filter(Prediction.created_at <= filters['date_to'])
        
        if 'search' in filters:
            query = query.filter(Prediction.image_url.contains(filters['search']))
    
    total = query.count()
    predictions = query.order_by(Prediction.created_at.desc()).limit(limit).offset(offset).all()
    
    return predictions, total

def delete_prediction(prediction_id, user_id):
    """
    Elimina una predicción
    
    Args:
        prediction_id: ID de la predicción
        user_id: ID del usuario
        
    Returns:
        bool: True si se eliminó correctamente
    """
    prediction = Prediction.query.filter_by(id=prediction_id, user_id=user_id).first()
    if prediction:
        db.session.delete(prediction)
        db.session.commit()
        return True
    return False

def get_user_stats(user_id, days=30):
    """
    Obtiene estadísticas de predicciones del usuario
    
    Args:
        user_id: ID del usuario
        days: Días hacia atrás para estadísticas temporales
        
    Returns:
        dict: Estadísticas del usuario
    """
    date_threshold = datetime.utcnow() - timedelta(days=days)
    
    # Total de predicciones
    total = Prediction.query.filter_by(user_id=user_id).count()
    
    # Distribución por clase
    class_dist = db.session.query(
        Prediction.predicted_class,
        func.count(Prediction.id)
    ).filter_by(user_id=user_id).group_by(Prediction.predicted_class).all()
    
    # Predicciones por fecha
    predictions_by_date = db.session.query(
        func.date(Prediction.created_at).label('date'),
        func.count(Prediction.id).label('count')
    ).filter(
        Prediction.user_id == user_id,
        Prediction.created_at >= date_threshold
    ).group_by(func.date(Prediction.created_at)).all()
    
    # Confianza promedio
    avg_confidence = db.session.query(
        func.avg(Prediction.confidence)
    ).filter_by(user_id=user_id).scalar()
    
    return {
        'total_predictions': total,
        'class_distribution': {cls: count for cls, count in class_dist},
        'predictions_by_date': [{'date': str(date), 'count': count} for date, count in predictions_by_date],
        'avg_confidence': float(avg_confidence) if avg_confidence else 0.0
    }

# ============================================================================
# BATCH JOB CRUD OPERATIONS
# ============================================================================

def create_batch_job(user_id, total_images):
    """
    Crea un trabajo batch
    
    Args:
        user_id: ID del usuario
        total_images: Total de imágenes a procesar
        
    Returns:
        BatchJob: Trabajo creado
    """
    job = BatchJob(
        user_id=user_id,
        total_images=total_images
    )
    
    db.session.add(job)
    db.session.commit()
    
    return job

def get_batch_job(job_id):
    """Obtiene un trabajo batch por ID"""
    return BatchJob.query.get(job_id)

def update_batch_job(job_id, processed=None, status=None):
    """
    Actualiza el progreso de un trabajo batch
    
    Args:
        job_id: ID del trabajo
        processed: Número de imágenes procesadas
        status: Nuevo estado
        
    Returns:
        BatchJob: Trabajo actualizado
    """
    job = BatchJob.query.get(job_id)
    if not job:
        return None
    
    if processed is not None:
        job.update_progress(processed)
    
    if status:
        job.status = status
        if status in ['completed', 'failed']:
            job.completed_at = datetime.utcnow()
    
    db.session.commit()
    return job

# ============================================================================
# ADMIN STATISTICS
# ============================================================================

def get_system_stats():
    """
    Obtiene estadísticas globales del sistema (admin)
    
    Returns:
        dict: Estadísticas del sistema
    """
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    total_predictions = Prediction.query.count()
    
    # Distribución global de clases
    class_dist = db.session.query(
        Prediction.predicted_class,
        func.count(Prediction.id)
    ).group_by(Prediction.predicted_class).all()
    
    # Top 5 usuarios más activos
    top_users = db.session.query(
        User.username,
        func.count(Prediction.id).label('prediction_count')
    ).join(Prediction).group_by(User.id).order_by(
        func.count(Prediction.id).desc()
    ).limit(5).all()
    
    return {
        'total_users': total_users,
        'active_users': active_users,
        'total_predictions': total_predictions,
        'class_distribution': {cls: count for cls, count in class_dist},
        'top_users': [{'username': username, 'predictions': count} for username, count in top_users]
    }


class DBService:
    """Database service class for better organization"""
    
    def add_prediction(self, prediction):
        """Add a prediction to database"""
        db.session.add(prediction)
        db.session.commit()
        return prediction
    
    def get_user_predictions(self, user_id, limit=50, offset=0):
        """Get predictions for a user with pagination"""
        return Prediction.query.filter_by(user_id=user_id).order_by(
            Prediction.created_at.desc()
        ).limit(limit).offset(offset).all()
    
    def count_user_predictions(self, user_id):
        """Count total predictions for a user"""
        return Prediction.query.filter_by(user_id=user_id).count()
    
    def get_prediction_by_id(self, prediction_id):
        """Get a prediction by ID"""
        return Prediction.query.get(prediction_id)
    
    def get_prediction_stats(self, user_id):
        """Get prediction statistics for a user"""
        predictions = Prediction.query.filter_by(user_id=user_id).all()
        
        if not predictions:
            return {
                'total_predictions': 0,
                'by_class': {},
                'by_model': {},
                'avg_confidence': 0.0
            }
        
        # Count by class
        by_class = {}
        for pred in predictions:
            by_class[pred.predicted_class] = by_class.get(pred.predicted_class, 0) + 1
        
        # Count by model
        by_model = {}
        for pred in predictions:
            by_model[pred.model_used] = by_model.get(pred.model_used, 0) + 1
        
        # Average confidence
        avg_confidence = sum(p.confidence for p in predictions) / len(predictions)
        
        return {
            'total_predictions': len(predictions),
            'by_class': by_class,
            'by_model': by_model,
            'avg_confidence': round(avg_confidence, 4)
        }
