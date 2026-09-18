"""
Database Configuration
Configuración de conexión a MySQL usando SQLAlchemy
"""

from flask_sqlalchemy import SQLAlchemy
import os

# Inicializar SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    """
    Inicializa la base de datos con la aplicación Flask
    
    Args:
        app: Instancia de Flask
    """
    # Configurar URI de base de datos desde variable de entorno
    database_url = os.getenv('DATABASE_URL', 'mysql+pymysql://metalvision_user:password123@localhost:3306/metalvision_db')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = os.getenv('FLASK_ENV') == 'development'  # Log SQL en desarrollo
    
    # Pool de conexiones
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True
    }
    
    # Inicializar db con la app
    db.init_app(app)
    
    print(f"✓ Database configured: {database_url.split('@')[1] if '@' in database_url else 'local'}")

def get_db():
    """
    Obtiene la instancia de la base de datos
    
    Returns:
        SQLAlchemy: Instancia de db
    """
    return db
