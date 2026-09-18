"""
Database Initialization
Script para inicializar la base de datos y crear usuario admin por defecto
"""

import bcrypt
from src.config.database import db
from src.models.user import User
from src.models.prediction import Prediction
from src.models.batch_job import BatchJob
from src.models.token_blacklist import TokenBlacklist

def create_tables(app):
    """
    Crea todas las tablas en la base de datos
    
    Args:
        app: Instancia de Flask
    """
    with app.app_context():
        print("🔧 Creando tablas de base de datos...")
        
        # Crear todas las tablas
        db.create_all()
        print("✓ Tablas creadas exitosamente")
        
        # Crear usuario admin por defecto si no existe
        create_default_admin()
        
        print("✓ Base de datos inicializada correctamente")

def create_default_admin():
    """
    Crea el usuario administrador por defecto
    """
    # Verificar si ya existe un admin
    admin = User.query.filter_by(username='admin').first()
    
    if not admin:
        print("👤 Creando usuario administrador por defecto...")
        
        # Hash de la contraseña
        password = 'admin123'  # ⚠️ CAMBIAR EN PRODUCCIÓN
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Crear usuario admin
        admin = User(
            username='admin',
            email='admin@metalvision.ai',
            password_hash=password_hash.decode('utf-8'),
            role='admin',
            is_active=True
        )
        
        db.session.add(admin)
        db.session.commit()
        
        print(f"✓ Usuario admin creado:")
        print(f"  Username: admin")
        print(f"  Password: {password}")
        print(f"  ⚠️  IMPORTANTE: Cambiar la contraseña en producción!")
    else:
        print("✓ Usuario admin ya existe")

def drop_all_tables(app):
    """
    Elimina todas las tablas (⚠️ usar con precaución)
    
    Args:
        app: Instancia de Flask
    """
    with app.app_context():
        print("⚠️  Eliminando todas las tablas...")
        db.drop_all()
        print("✓ Tablas eliminadas")

def reset_database(app):
    """
    Reinicia la base de datos (elimina y recrea todo)
    
    Args:
        app: Instancia de Flask
    """
    drop_all_tables(app)
    create_tables(app)
