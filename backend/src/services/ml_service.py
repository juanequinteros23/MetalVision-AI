"""
ML Service - Model loading and prediction
"""
import os
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple
import tensorflow as tf
from tensorflow import keras
from PIL import Image, ImageOps
import json

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODELS_DIR = BASE_DIR / 'ml_models'

# Model paths
EFFICIENTNET_PATH = MODELS_DIR / 'efficientnet' / 'efficientnet_best.keras'
RESNET_PATH = MODELS_DIR / 'resnet50' / 'resnet50_best.keras'
VGG_PATH = MODELS_DIR / 'vgg16' / 'vgg16_best.keras'

# Class indices path
CLASS_INDICES_PATH = MODELS_DIR / 'efficientnet' / 'class_indices.json'

# Image configuration
IMG_SIZE = (224, 224)


class MLService:
    """Service for ML model operations"""
    
    def __init__(self):
        self.models = {}
        self.class_names = []
        self.class_indices = {}
        self._load_models()
        self._load_class_indices()
    
    def _load_models(self):
        """Load all available models"""
        print("Loading ML models...")
        
        # Load EfficientNetB3
        if EFFICIENTNET_PATH.exists():
            try:
                self.models['efficientnet'] = keras.models.load_model(EFFICIENTNET_PATH)
                print("✓ EfficientNetB3 loaded")
            except Exception as e:
                print(f"✗ Failed to load EfficientNetB3: {e}")
        
        # Load ResNet50
        if RESNET_PATH.exists():
            try:
                self.models['resnet50'] = keras.models.load_model(RESNET_PATH)
                print("✓ ResNet50 loaded")
            except Exception as e:
                print(f"✗ Failed to load ResNet50: {e}")
        
        # Load VGG16
        if VGG_PATH.exists():
            try:
                self.models['vgg16'] = keras.models.load_model(VGG_PATH)
                print("✓ VGG16 loaded")
            except Exception as e:
                print(f"✗ Failed to load VGG16: {e}")
        
        if not self.models:
            print("⚠️ No models loaded!")
        else:
            print(f"✓ Total models loaded: {len(self.models)}")
    
    def _load_class_indices(self):
        """Load class indices mapping"""
        if CLASS_INDICES_PATH.exists():
            with open(CLASS_INDICES_PATH, 'r') as f:
                self.class_indices = json.load(f)
                # Invert mapping: {index: class_name}
                self.class_names = {v: k for k, v in self.class_indices.items()}
                print(f"✓ Class indices loaded: {list(self.class_indices.keys())}")
        else:
            print("⚠️ Class indices file not found!")
            # Fallback
            self.class_indices = {
                'cracks_scratches': 0,
                'flawless_prime': 1,
                'pitting_corrosion': 2,
                'surface_inclusions': 3
            }
            self.class_names = {v: k for k, v in self.class_indices.items()}
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess image for prediction (polyvalent: accepts any format, size, orientation, and color mode)
        
        Args:
            image_path: Path to image file
            
        Returns:
            Preprocessed image array (1, 224, 224, 3) in [0, 255] float32
        """
        # Load image with PIL
        with Image.open(image_path) as img:
            # Auto-orient based on smartphone/camera EXIF tags
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass
            
            # Universal color conversion: RGBA, Grayscale, CMYK, Palette, 1-bit, float -> RGB
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Universal resizing: handles any resolution (50x50 up to 8K+) with high-quality resampling
            resample_filter = getattr(Image, 'Resampling', Image).LANCZOS
            img = img.resize(IMG_SIZE, resample_filter)
            
            # Convert to float32 array in [0, 255] (models embed internal preprocessing/rescaling)
            img_array = np.array(img, dtype=np.float32)
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    def predict_single(self, image_path: str, model_name: str = 'ensemble') -> Dict:
        """
        Make prediction on a single image
        
        Args:
            image_path: Path to image file
            model_name: Model to use ('efficientnet', 'resnet50', 'vgg16', 'ensemble')
            
        Returns:
            Dictionary with prediction results
        """
        # Preprocess image
        img_array = self.preprocess_image(image_path)
        
        # Get prediction
        if model_name == 'ensemble':
            predictions = self._predict_ensemble(img_array)
        elif model_name in self.models:
            predictions = self.models[model_name].predict(img_array, verbose=0)[0]
        else:
            raise ValueError(f"Model '{model_name}' not available")
        
        # Get predicted class
        predicted_class_idx = int(np.argmax(predictions))
        predicted_class_name = self.class_names[predicted_class_idx]
        confidence = float(predictions[predicted_class_idx])
        
        # Get all probabilities
        probabilities = {
            self.class_names[i]: float(predictions[i])
            for i in range(len(predictions))
        }
        
        return {
            'predicted_class': predicted_class_name,
            'confidence': confidence,
            'probabilities': probabilities,
            'model_used': model_name
        }
    
    def _predict_ensemble(self, img_array: np.ndarray) -> np.ndarray:
        """
        Make ensemble prediction (average of all models)
        
        Args:
            img_array: Preprocessed image array
            
        Returns:
            Averaged predictions
        """
        if not self.models:
            raise RuntimeError("No models loaded for ensemble prediction")
        
        predictions = []
        for model_name, model in self.models.items():
            pred = model.predict(img_array, verbose=0)
            predictions.append(pred)
        
        # Average predictions
        ensemble_pred = np.mean(predictions, axis=0)[0]
        
        return ensemble_pred
    
    def predict_batch(self, image_paths: List[str], model_name: str = 'ensemble') -> List[Dict]:
        """
        Make predictions on multiple images
        
        Args:
            image_paths: List of image file paths
            model_name: Model to use
            
        Returns:
            List of prediction results
        """
        results = []
        for image_path in image_paths:
            try:
                result = self.predict_single(image_path, model_name)
                result['image_path'] = image_path
                result['success'] = True
                results.append(result)
            except Exception as e:
                results.append({
                    'image_path': image_path,
                    'success': False,
                    'error': str(e)
                })
        
        return results
    
    def get_model_info(self) -> Dict:
        """
        Get information about loaded models
        
        Returns:
            Dictionary with model information
        """
        return {
            'models_loaded': list(self.models.keys()),
            'num_models': len(self.models),
            'classes': list(self.class_indices.keys()),
            'num_classes': len(self.class_indices),
            'image_size': IMG_SIZE
        }


# Singleton instance
_ml_service_instance = None


def get_ml_service() -> MLService:
    """
    Get MLService singleton instance
    
    Returns:
        MLService instance
    """
    global _ml_service_instance
    if _ml_service_instance is None:
        _ml_service_instance = MLService()
    return _ml_service_instance
