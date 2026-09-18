# DOCUMENTO DE ENTREGA DE PROYECTO FINAL
## MetalVision AI — Sistema Autónomo de Detección y Clasificación de Defectos Superficiales en Acero

---

### 1. Información General y Enlaces de Acceso

* **Nombre del Proyecto:** MetalVision AI
* **Área:** Ciencia de Datos / Inteligencia Artificial / Visión por Computadora
* **Dataset de Referencia:** NEU Surface Defect Database (Northeastern University)
* **Estado de Despliegue:** **Activo y en Producción (Alta Disponibilidad en AWS)**

#### 🌐 Enlace al Servicio Web Desplegado (Producción con HTTPS)
> **URL:** [https://18.221.6.95.sslip.io](https://18.221.6.95.sslip.io)
> * **Protocolo de Seguridad:** HTTPS con Certificado SSL Let's Encrypt (Candado Verde Verificado).
> * **Infraestructura Cloud:** Amazon Web Services (AWS EC2 - us-east-2 Ohio).
> * **Servidor Web:** Nginx Reverse Proxy + Gunicorn WSGI.

#### 💻 Enlace al Repositorio de Código Fuente
> **Repositorio GitHub:** https://github.com/juanequinteros23/MetalVision-AI

#### 🔑 Credenciales de Acceso para el Docente / Evaluador
* **Usuario:** `admin`
* **Contraseña:** `admin123`
*(La plataforma también permite el registro libre de nuevos usuarios si se desea evaluar el flujo de autenticación).*

---

### 2. Resumen Ejecutivo de la Solución

**MetalVision AI** es una plataforma integral de inspección no destructiva de superficies de acero laminado basada en Deep Learning. Su objetivo es clasificar automáticamente anomalías superficiales en cuatro categorías críticas para la industria siderúrgica bajo normativas internacionales **ASTM A653** e **ISO 9001:2015**:

1. **Grietas y Rayaduras (`cracks_scratches`):** Discontinuidades lineales críticas con alto riesgo de rotura por tracción mecánica.
2. **Inclusiones Superficiales (`surface_inclusions`):** Partículas no metálicas (escoria/alúmina) atrapadas durante la colada continua.
3. **Corrosión por Picaduras (`pitting_corrosion`):** Microcavidades electroquímicas que comprometen la resistencia galvánica.
4. **Superficie Impecable (`flawless_prime`):** Acero conforme de grado óptimo liberado para conformado automotriz y línea blanca.

---

### 3. Resultados de los Modelos y Ensamble Tri-Modelo

Se entrenaron de forma individual tres arquitecturas de redes neuronales convolucionales del estado del arte utilizando *Transfer Learning*, aumentación de datos y ajuste fino (*fine-tuning*). Finalmente, se implementó un **Ensamble por Votación Suave (Soft Voting Ensemble)** que consolida las probabilidades predichas por los tres modelos:

$$\hat{y} = \arg\max \left( \frac{P_{\text{EfficientNet}} + P_{\text{ResNet50}} + P_{\text{VGG16}}}{3} \right)$$

#### 📊 Métricas Obtenidas en el Conjunto de Prueba Independiente (270 Muestras):

| Modelo / Arquitectura | Precisión (Accuracy) | F1-Score Ponderado | Precision Ponderada | Recall Ponderado | Aciertos / Total |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **EfficientNet-B3** | **99.63%** | 0.9963 | 0.9963 | 0.9963 | 269 / 270 |
| **ResNet-50** | **99.26%** | 0.9925 | 0.9928 | 0.9926 | 268 / 270 |
| **VGG-16** | **99.26%** | 0.9926 | 0.9928 | 0.9926 | 268 / 270 |
| **🏆 Ensamble Tri-Modelo** | **100.00%** | **1.0000** | **1.0000** | **1.0000** | **270 / 270** |

> **Logro:** El Ensamble Tri-Modelo superó con creces el objetivo académico propuesto ($\ge 95\%$), alcanzando una precisión perfecta del **100% con cero falsos positivos y cero falsos negativos** en el lote de evaluación.

---

### 4. Características Principales de la Plataforma Web

1. **Diagnóstico con Animación Láser Espectral (3.8 s):** Durante la carga de la inferencia, se ejecuta una animación de escaneo espectral interactiva inspirada en herramientas modernas de visión, con barrido láser vertical neón, malla topográfica micrométrica, retículas de enfoque en tiempo real y telemetría de 4 fases de análisis.
2. **Generación de Certificados Oficiales en PDF:** Descarga directa de informes de control de calidad que incluyen:
   - La **fotografía real de la muestra analizada** incrustada en alta resolución con retículas de ensayo.
   - **Identificador secuencial correlativo** (`Muestra Sucesiva #00001`, `Código: MV-2026-00001`).
   - Dictamen normativo ASTM/ISO (Aprobado Prime vs. Rechazo No Conforme).
   - Tabla completa de distribución de probabilidades multiclase (Softmax).
   - Protocolo metalúrgico de planta y validación digital con hash de seguridad.
   - Opción de descarga de **Bitácora PDF Consolidada** con el lote completo de auditoría.
3. **Exportación de Bitácora a CSV (Compatible con Microsoft Excel):** Exportación estructurada con cabeceras técnicas completas, probabilidades individuales por defecto, separador por punto y coma (`;`) y prefijo **UTF-8 BOM** para visualización limpia en Excel.
4. **Motor Polivalente:** El backend procesa imágenes de cualquier resolución, tamaño o formato digital (JPG, PNG, BMP, WEBP, TIFF, GIF) con normalización automática de orientación EXIF y conversión de espacio de color.

---

### 5. Estructura del Proyecto

```text
Ciencia de Datos/
├── backend/
│   ├── app.py                     # Punto de entrada de la API Flask
│   ├── requirements.txt           # Dependencias Python
│   └── src/
│       ├── config/                # Base de datos MySQL y JWT
│       ├── models/                # Modelos SQLAlchemy (User, Prediction)
│       ├── routers/               # Endpoints REST (/auth, /predictions)
│       └── services/              # Servicio de Inferencia ML y Base de Datos
├── client/
│   ├── src/
│   │   ├── components/            # Componentes React (Animación, HUD, Upload)
│   │   ├── pages/                 # Home, Prediction, History, Dashboard, Login
│   │   └── utils/                 # Generador PDF jsPDF, Constantes
│   └── dist/                      # Bundle de producción optimizado
├── ml_models/
│   ├── efficientnet/              # Modelo Keras 3 y métricas
│   ├── resnet50/                  # Modelo Keras 3 y métricas
│   ├── vgg16/                     # Modelo Keras 3 y métricas
│   └── ensemble/                  # Matrices de confusión y comparativas
├── scripts/
│   ├── train_efficientnet.py      # Pipeline de entrenamiento EfficientNet-B3
│   ├── train_resnet50.py          # Pipeline de entrenamiento ResNet-50
│   ├── train_vgg16.py             # Pipeline de entrenamiento VGG-16
│   └── evaluate_ensemble.py       # Pipeline de evaluación del Ensamble
└── docs/
    └── ENTREGABLE_PROYECTO_FINAL.md # Documentación oficial de entrega
```
