"""
MetalVision AI - Backend API
Sistema de Detección y Clasificación de Defectos en Superficies Metálicas
"""

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Agregar el directorio src al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # Allow up to 100 MB per upload

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize Database
from src.config.database import init_db
from src.utils.init_db import create_tables

print("🔧 Initializing database...")
init_db(app)

# Create tables if they don't exist
create_tables(app)

# Initialize JWT
from src.config.jwt_config import init_jwt
init_jwt(app)

# Register Blueprints
from src.routers.auth import auth_bp
from src.routers.predictions import predictions_bp

app.register_blueprint(auth_bp)
app.register_blueprint(predictions_bp)

print("✓ Blueprints registered:")
print("  - /api/auth (Authentication)")
print("  - /api/predictions (ML Predictions)")

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    ---
    tags:
      - Health
    responses:
      200:
        description: API is healthy
        schema:
          type: object
          properties:
            status:
              type: string
              example: "healthy"
            service:
              type: string
              example: "MetalVision AI API"
            version:
              type: string
              example: "1.0.0"
    """
    return jsonify({
        'status': 'healthy',
        'service': 'MetalVision AI API',
        'version': '1.0.0'
    }), 200

# Root endpoint
@app.route('/', methods=['GET'])
def root():
    """
    Root endpoint
    ---
    tags:
      - Info
    responses:
      200:
        description: API information
        schema:
          type: object
          properties:
            message:
              type: string
            version:
              type: string
            docs:
              type: string
    """
    return jsonify({
        'message': 'MetalVision AI API',
        'version': '1.0.0',
        'description': 'Sistema de Detección y Clasificación de Defectos en Superficies Metálicas',
        'docs': '/api/docs',
        'health': '/api/health',
        'endpoints': {
            'auth': {
                'register': 'POST /api/auth/register',
                'login': 'POST /api/auth/login',
                'refresh': 'POST /api/auth/refresh',
                'logout': 'POST /api/auth/logout',
                'me': 'GET /api/auth/me'
            }
        }
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested endpoint does not exist'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred'
    }), 500

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({
        'error': 'Method Not Allowed',
        'message': 'This method is not allowed for the requested endpoint'
    }), 405

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    
    print("\n" + "="*70)
    print("🚀 MetalVision AI API")
    print("="*70)
    print(f"🌐 Server: http://{host}:{port}")
    print(f"📚 API Docs: http://{host}:{port}/api/docs (coming soon)")
    print(f"💚 Health Check: http://{host}:{port}/api/health")
    print(f"🔐 Auth Endpoints: http://{host}:{port}/api/auth/*")
    print("="*70)
    print(f"⚙️  Environment: {os.getenv('FLASK_ENV', 'production')}")
    print(f"🐛 Debug Mode: {debug}")
    print("="*70 + "\n")
    
    app.run(host=host, port=port, debug=debug)
