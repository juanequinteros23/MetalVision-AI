"""
Custom Decorators
Decoradores personalizados para autorización y validación
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt

def role_required(required_role):
    """
    Decorador para verificar que el usuario tenga el rol requerido
    
    Args:
        required_role: Rol requerido ('user' o 'admin')
        
    Usage:
        @role_required('admin')
        def admin_only_endpoint():
            pass
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            claims = get_jwt()
            user_role = claims.get('role', 'user')
            
            if user_role != required_role:
                return jsonify({
                    'error': 'Insufficient permissions',
                    'message': f'This endpoint requires {required_role} role'
                }), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def admin_required(fn):
    """
    Decorador simplificado para endpoints que requieren rol admin
    
    Usage:
        @admin_required
        def admin_endpoint():
            pass
    """
    return role_required('admin')(fn)
