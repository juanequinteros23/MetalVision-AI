"""
Prediction Model
Modelo para almacenar predicciones de imágenes
"""

from datetime import datetime
from src.config.database import db

class Prediction(db.Model):
    """
    Modelo de Predicción
    
    Attributes:
        id: ID único de la predicción
        user_id: ID del usuario que realizó la predicción
        image_path: Ruta local de la imagen
        image_url: URL de la imagen en S3 (opcional)
        heatmap_url: URL del heatmap Grad-CAM en S3 (opcional)
        predicted_class: Clase predicha por el modelo
        confidence: Confianza de la predicción (0-1)
        model_used: Modelo utilizado (efficientnet, resnet50, vgg16, ensemble)
        batch_id: ID del batch si es predicción por lotes (opcional)
        created_at: Fecha de creación
    """
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    image_path = db.Column(db.String(500), nullable=False)
    image_url = db.Column(db.String(500))
    heatmap_url = db.Column(db.String(500))
    predicted_class = db.Column(db.String(50), nullable=False, index=True)
    confidence = db.Column(db.Float, nullable=False)
    model_used = db.Column(db.String(50), default='ensemble')
    batch_id = db.Column(db.String(50), index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def __repr__(self):
        return f'<Prediction {self.id}: {self.predicted_class} ({self.confidence:.2f})>'
    
    def to_dict(self):
        """
        Convierte la predicción a diccionario
        
        Returns:
            dict: Representación de la predicción
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'image_path': self.image_path,
            'image_url': self.image_url,
            'heatmap_url': self.heatmap_url,
            'predicted_class': self.predicted_class,
            'confidence': round(self.confidence, 4),
            'model_used': self.model_used,
            'batch_id': self.batch_id,
            'created_at': self.created_at.isoformat()
        }
    
    @staticmethod
    def get_class_display_name(class_name):
        """
        Obtiene el nombre display de una clase
        
        Args:
            class_name: Nombre interno de la clase
            
        Returns:
            str: Nombre para mostrar
        """
        display_names = {
            'pitting_corrosion': 'Pitting Corrosion',
            'surface_inclusions': 'Surface Inclusions',
            'cracks_scratches': 'Cracks & Scratches',
            'flawless_prime': 'Flawless Prime'
        }
        return display_names.get(class_name, class_name)
