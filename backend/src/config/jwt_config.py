"""
JWT Configuration
Configuración de Flask-JWT-Extended para autenticación
"""

from flask_jwt_extended import JWTManager
from datetime import timedelta
import os

from src.models.token_blacklist import TokenBlacklist

jwt = JWTManager()

def init_jwt(app):
    """
    Inicializa JWT con la aplicación Flask
    
    Args:
        app: Instancia de Flask
    """
    # Configuración de JWT
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    
    # Inicializar JWT
    jwt.init_app(app)
    
    # Callback para verificar si el token está en la lista negra
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        return TokenBlacklist.is_token_revoked(jti)
    
    print("✓ JWT configured")
    
    return jwt
