"""
Authentication Router
Endpoints para registro, login, refresh y logout
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)

from src.services.db_service import (
    create_user,
    get_user_by_username,
    get_user_by_email,
    get_user_by_id,
    verify_password
)
from src.models.token_blacklist import TokenBlacklist

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Registro de nuevo usuario
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - email
            - password
          properties:
            username:
              type: string
              example: "john_doe"
              description: Nombre de usuario único
            email:
              type: string
              example: "john@example.com"
              description: Email único
            password:
              type: string
              example: "securepassword123"
              description: Contraseña (mínimo 6 caracteres)
    responses:
      201:
        description: Usuario creado exitosamente
        schema:
          type: object
          properties:
            message:
              type: string
              example: "User created successfully"
            user_id:
              type: integer
              example: 1
      400:
        description: Datos faltantes o inválidos
      409:
        description: Usuario o email ya existe
    """
    data = request.get_json()
    
    # Validar campos requeridos
    if not all(k in data for k in ['username', 'email', 'password']):
        return jsonify({
            'error': 'Missing required fields',
            'required': ['username', 'email', 'password']
        }), 400
    
    username = data['username'].strip()
    email = data['email'].strip().lower()
    password = data['password']
    
    # Validaciones básicas
    if len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    # Verificar si el usuario ya existe
    if get_user_by_username(username):
        return jsonify({'error': 'Username already exists'}), 409
    
    if get_user_by_email(email):
        return jsonify({'error': 'Email already exists'}), 409
    
    try:
        # Crear usuario
        user = create_user(username, email, password)
        
        return jsonify({
            'message': 'User created successfully',
            'user_id': user.id,
            'username': user.username
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login de usuario
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              example: "john_doe"
            password:
              type: string
              example: "securepassword123"
    responses:
      200:
        description: Login exitoso
        schema:
          type: object
          properties:
            access_token:
              type: string
              description: JWT access token (válido 15 min)
            refresh_token:
              type: string
              description: JWT refresh token (válido 30 días)
            user:
              type: object
              properties:
                id:
                  type: integer
                username:
                  type: string
                role:
                  type: string
      401:
        description: Credenciales inválidas
      403:
        description: Usuario desactivado
    """
    data = request.get_json()
    
    if not data or not all(k in data for k in ['username', 'password']):
        return jsonify({'error': 'Missing username or password'}), 400
    
    username = data['username']
    password = data['password']
    
    # Buscar usuario
    user = get_user_by_username(username)
    
    # Verificar usuario y contraseña
    if not user or not verify_password(user, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Verificar si el usuario está activo
    if not user.is_active:
        return jsonify({'error': 'User account is disabled'}), 403
    
    # Crear tokens JWT
    additional_claims = {'role': user.role}
    access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Renovar access token usando refresh token
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Nuevo access token generado
        schema:
          type: object
          properties:
            access_token:
              type: string
      401:
        description: Refresh token inválido o expirado
    """
    try:
        # Obtener identidad del refresh token
        identity = get_jwt_identity()
        
        # Obtener usuario para incluir rol actualizado
        user = get_user_by_id(identity)
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 401
        
        # Crear nuevo access token
        additional_claims = {'role': user.role}
        access_token = create_access_token(identity=identity, additional_claims=additional_claims)
        
        return jsonify({'access_token': access_token}), 200
        
    except Exception as e:
        return jsonify({'error': f'Token refresh failed: {str(e)}'}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout de usuario (invalida el token)
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Logout exitoso
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Successfully logged out"
      401:
        description: Token inválido
    """
    try:
        # Obtener JWT ID del token actual
        jti = get_jwt()['jti']
        
        # Agregar token a la lista negra
        TokenBlacklist.add_token_to_blacklist(jti)
        
        return jsonify({'message': 'Successfully logged out'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Logout failed: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Obtener información del usuario actual
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Información del usuario
        schema:
          type: object
          properties:
            id:
              type: integer
            username:
              type: string
            email:
              type: string
            role:
              type: string
            is_active:
              type: boolean
            created_at:
              type: string
      401:
        description: No autenticado
      404:
        description: Usuario no encontrado
    """
    try:
        user_id = int(get_jwt_identity())
        user = get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get user info: {str(e)}'}), 500
