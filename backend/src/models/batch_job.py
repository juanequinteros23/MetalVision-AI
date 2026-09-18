"""
BatchJob Model
Modelo para rastrear trabajos de procesamiento batch
"""

from datetime import datetime
from src.config.database import db

class BatchJob(db.Model):
    """
    Modelo de Trabajo Batch
    
    Attributes:
        id: ID único del trabajo
        user_id: ID del usuario que creó el trabajo
        total_images: Total de imágenes a procesar
        processed_images: Imágenes procesadas hasta el momento
        status: Estado del trabajo ('pending', 'processing', 'completed', 'failed')
        created_at: Fecha de creación
        completed_at: Fecha de finalización
    """
    __tablename__ = 'batch_jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    total_images = db.Column(db.Integer, nullable=False)
    processed_images = db.Column(db.Integer, default=0, nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    completed_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<BatchJob {self.id}: {self.status} ({self.processed_images}/{self.total_images})>'
    
    def to_dict(self):
        """
        Convierte el trabajo batch a diccionario
        
        Returns:
            dict: Representación del trabajo
        """
        progress = (self.processed_images / self.total_images * 100) if self.total_images > 0 else 0
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_images': self.total_images,
            'processed_images': self.processed_images,
            'status': self.status,
            'progress': round(progress, 2),
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    def update_progress(self, processed):
        """
        Actualiza el progreso del trabajo
        
        Args:
            processed: Número de imágenes procesadas
        """
        self.processed_images = processed
        
        # Actualizar estado si está completo
        if processed >= self.total_images and self.status == 'processing':
            self.status = 'completed'
            self.completed_at = datetime.utcnow()
    
    def mark_as_failed(self):
        """Marca el trabajo como fallido"""
        self.status = 'failed'
        self.completed_at = datetime.utcnow()
    
    @property
    def is_completed(self):
        """Verifica si el trabajo está completado"""
        return self.status in ['completed', 'failed']
