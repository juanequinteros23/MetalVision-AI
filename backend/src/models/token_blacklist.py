"""
TokenBlacklist Model
Modelo para almacenar tokens JWT invalidados (logout)
"""

from datetime import datetime
from src.config.database import db

class TokenBlacklist(db.Model):
    """
    Modelo de Lista Negra de Tokens
    
    Attributes:
        id: ID único
        jti: JWT ID (identificador único del token)
        created_at: Fecha de invalidación
    """
    __tablename__ = 'token_blacklist'
    
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(120), unique=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f'<TokenBlacklist {self.jti}>'
    
    @staticmethod
    def is_token_revoked(jti):
        """
        Verifica si un token ha sido revocado
        
        Args:
            jti: JWT ID a verificar
            
        Returns:
            bool: True si el token está revocado
        """
        token = TokenBlacklist.query.filter_by(jti=jti).first()
        return token is not None
    
    @staticmethod
    def add_token_to_blacklist(jti):
        """
        Agrega un token a la lista negra
        
        Args:
            jti: JWT ID del token a invalidar
            
        Returns:
            TokenBlacklist: Token añadido
        """
        token = TokenBlacklist(jti=jti)
        db.session.add(token)
        db.session.commit()
        return token
