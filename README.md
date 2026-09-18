# MetalVision AI

## Sistema Inteligente de Detección y Clasificación de Defectos en Superficies Metálicas

Sistema completo de clasificación de defectos en superficies metálicas usando Deep Learning, desarrollado como parte de la Actividad 3-1: Aplicaciones en la Nube y Servicios Especializados en Ciencia de Datos.

### 🎯 Objetivo

Implementar un sistema completo que resuelve la detección y clasificación de defectos en superficies metálicas utilizando:
- **Machine Learning**: Ensemble de modelos (EfficientNet + ResNet + VGG) con accuracy ≥95%
- **Backend API**: Flask con autenticación JWT, almacenamiento en MySQL y AWS S3
- **Frontend Web**: React con dashboard interactivo, análisis batch y generación de reportes PDF
- **Deployment**: Containerización con Docker y despliegue en AWS (ECS, RDS, S3)

### 📊 Categorías de Clasificación

El sistema clasifica defectos en 4 categorías:

1. **Pitting Corrosion** (`pitting_corrosion`): Corrosión localizada y picaduras
2. **Surface Inclusions** (`surface_inclusions`): Contaminantes e inclusiones superficiales
3. **Cracks & Scratches** (`cracks_scratches`): Fisuras, grietas y rayaduras severas
4. **Flawless Prime** (`flawless_prime`): Material óptimo sin defectos

### 🛠️ Stack Tecnológico

**Machine Learning:**
- TensorFlow/Keras
- scikit-learn
- OpenCV
- Pillow

**Backend:**
- Flask 3.0
- Flask-JWT-Extended (autenticación)
- Flask-SQLAlchemy (ORM)
- MySQL 8.0
- Celery + Redis (procesamiento asíncrono)
- boto3 (AWS SDK)
- Gunicorn (WSGI server)
- Flasgger (documentación API)

**Frontend:**
- React 19
- Vite (build tool)
- React Router (navegación)
- Axios (HTTP client)
- Recharts (visualización)
- jsPDF (generación de reportes)

**Infrastructure:**
- Docker + Docker Compose
- AWS ECR (Container Registry)
- AWS ECS/EC2 (compute)
- AWS RDS MySQL (database)
- AWS S3 (object storage)
- AWS CloudWatch (monitoring)

### 📁 Estructura del Proyecto

```
Ciencia de Datos/
├── backend/               # Backend Flask API
│   ├── src/
│   │   ├── config/       # Configuraciones (DB, JWT, Celery)
│   │   ├── models/       # Modelos SQLAlchemy
│   │   ├── routers/      # Blueprints de rutas
│   │   ├── services/     # Lógica de negocio
│   │   ├── tasks/        # Tareas de Celery
│   │   └── utils/        # Utilidades
│   ├── app.py            # Aplicación Flask principal
│   ├── requirements.txt  # Dependencias Python
│   └── Dockerfile        # Dockerfile del backend
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── contexts/     # Contextos de React
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── services/     # Servicios API
│   │   └── utils/        # Utilidades
│   ├── package.json      # Dependencias Node.js
│   └── Dockerfile        # Dockerfile del frontend
├── notebooks/            # Jupyter notebooks para entrenamiento
│   ├── 01_dataset_preparation.ipynb
│   ├── 02_eda_and_augmentation.ipynb
│   ├── 03_model_efficientnet.ipynb
│   ├── 04_model_resnet.ipynb
│   ├── 05_model_vgg_ensemble.ipynb
│   └── 06_gradcam_visualization.ipynb
├── ml_models/            # Modelos ML entrenados (.h5)
├── data/                 # Datasets
│   ├── raw/             # Datos originales
│   └── processed/       # Datos procesados (train/val/test)
├── docs/                 # Documentación
│   ├── diagrams/        # Diagramas de arquitectura
│   └── MODEL_DOCUMENTATION.md
├── scripts/              # Scripts de utilidad
└── docker-compose.yml    # Orquestación de servicios
```

### 🚀 Instalación y Configuración

#### Prerrequisitos

- Python 3.10+
- Node.js 18+
- Docker y Docker Compose
- MySQL 8.0 (o usar Docker)
- AWS CLI (para deployment)

#### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd "Ciencia de Datos"
```

#### 2. Configuración del Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales
```

#### 3. Configuración del Frontend

```bash
cd client

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env si es necesario
```

#### 4. Iniciar Servicios con Docker Compose

Desde la raíz del proyecto:

```bash
# Iniciar MySQL y Redis
docker-compose up -d

# Verificar que los servicios estén corriendo
docker-compose ps
```

#### 5. Inicializar Base de Datos

```bash
cd backend

# Ejecutar migraciones (cuando estén implementadas)
python -c "from app import app; from src.utils.init_db import create_tables; create_tables(app)"
```

#### 6. Ejecutar la Aplicación

**Backend:**
```bash
cd backend
python app.py
# API disponible en: http://localhost:5000
# Documentación: http://localhost:5000/api/docs
```

**Frontend:**
```bash
cd client
npm run dev
# App disponible en: http://localhost:5173
```

### 📚 Dataset

El proyecto utiliza el **NEU Surface Defect Database**:
- Fuente: http://faculty.neu.edu.cn/yunhyan/NEU_surface_defect_database.html
- 1,800 imágenes en escala de grises (200×200 px)
- 6 tipos de defectos en acero laminado

**Instrucciones para descarga:**
1. Visitar el sitio web oficial
2. Descargar el dataset
3. Descomprimir en `data/raw/NEU/`
4. Ejecutar notebook `01_dataset_preparation.ipynb`

### 🔑 Credenciales por Defecto

**Usuario Admin:**
- Username: `admin`
- Password: `admin123`
- Role: `admin`

(⚠️ Cambiar en producción)

### 📖 Documentación de la API

Una vez iniciado el backend, la documentación interactiva de Swagger está disponible en:
- **Swagger UI**: http://localhost:5000/api/docs

### 🧪 Testing

```bash
# Backend tests (cuando estén implementados)
cd backend
pytest

# Frontend tests
cd client
npm test
```

### 🐳 Deployment con Docker

#### Build de imágenes

```bash
# Backend
docker build -t metalvision-backend ./backend

# Frontend
docker build -t metalvision-frontend ./client
```

#### Deployment en AWS

Ver documentación detallada en `docs/DEPLOYMENT.md` (próximamente)

### 📊 Métricas del Modelo

Los modelos entrenados alcanzan las siguientes métricas (objetivo):

| Modelo | Accuracy | Precision | Recall | F1-Score |
|--------|----------|-----------|--------|----------|
| EfficientNetB3 | ~92% | ~91% | ~90% | ~90% |
| ResNet50 | ~90% | ~89% | ~88% | ~89% |
| VGG16 | ~88% | ~87% | ~86% | ~86% |
| **Ensemble** | **≥95%** | **≥94%** | **≥93%** | **≥94%** |

Ver documentación completa en `docs/MODEL_DOCUMENTATION.md`

### 🤝 Contribuidores

- [Nombres de los integrantes del equipo]

### 📄 Licencia

Este proyecto fue desarrollado como parte de la evaluación académica de la Universidad Americana (UAM) - Curso de Aplicaciones en la Nube y Servicios Especializados en Ciencia de Datos.

### 📞 Soporte

Para preguntas o problemas:
- Crear un issue en el repositorio
- Contactar a: [email del equipo]

---

**Desarrollado con ❤️ para la detección de defectos en superficies metálicas**
