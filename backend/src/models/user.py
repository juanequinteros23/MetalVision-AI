"""
User Model
Modelo de usuario para autenticación y autorización
"""

from datetime import datetime
from src.config.database import db

class User(db.Model):
    """
    Modelo de Usuario
    
    Attributes:
        id: ID único del usuario
        username: Nombre de usuario (único)
        email: Email del usuario (único)
        password_hash: Hash bcrypt de la contraseña
        role: Rol del usuario ('user' o 'admin')
        is_active: Si el usuario está activo
        created_at: Fecha de creación
        predictions: Relación con predicciones del usuario
    """
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)  # 'user' o 'admin'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    predictions = db.relationship('Prediction', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    batch_jobs = db.relationship('BatchJob', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self, include_sensitive=False):
        """
        Convierte el usuario a diccionario
        
        Args:
            include_sensitive: Si incluir información sensible
            
        Returns:
            dict: Representación del usuario
        """
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }
        
        if include_sensitive:
            data['password_hash'] = self.password_hash
            
        return data
    
    def is_admin(self):
        """Verifica si el usuario es administrador"""
        return self.role == 'admin'
