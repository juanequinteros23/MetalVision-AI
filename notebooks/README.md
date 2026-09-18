# MetalVision AI - Machine Learning Notebooks

Este directorio contiene los Jupyter notebooks para el entrenamiento y evaluación de los modelos de Deep Learning.

## 📓 Notebooks Disponibles

### 1. `01_dataset_preparation.ipynb`
**Preparación del Dataset NEU Surface Defect**

- Descarga y organización del dataset
- Mapeo de 6 categorías originales a 4 categorías del proyecto
- Split estratificado: 70% train, 15% val, 15% test
- Generación de estadísticas y visualizaciones

**Output:**
- `data/processed/train/` - Imágenes de entrenamiento
- `data/processed/val/` - Imágenes de validación
- `data/processed/test/` - Imágenes de prueba
- `data/dataset_stats.json` - Estadísticas del dataset

---

### 2. `02_eda_and_augmentation.ipynb`
**Análisis Exploratorio y Data Augmentation**

- Análisis de distribución de clases
- Análisis de características de imágenes
- Implementación de pipeline de augmentation
- Visualización de transformaciones
- Estrategia de balanceo de clases

**Output:**
- `data/augmentation_config.json` - Configuración de augmentation
- Visualizaciones y gráficas

---

### 3. `03_model_efficientnet.ipynb`
**Modelo EfficientNetB3 con Transfer Learning**

- Carga de EfficientNetB3 preentrenado
- Entrenamiento en 2 fases (congelado + fine-tuning)
- Evaluación con métricas completas
- Confusion matrix y classification report

**Output:**
- `ml_models/efficientnet_b3_final.h5` - Modelo entrenado
- Gráficas de training history
- Métricas de evaluación

---

### 4. `04_model_resnet.ipynb`
**Modelo ResNet50 con Transfer Learning**

- Carga de ResNet50 preentrenado
- Arquitectura con variaciones vs EfficientNet
- Comparativa de métricas
- Análisis de fortalezas por clase

**Output:**
- `ml_models/resnet50_final.h5` - Modelo entrenado
- `ml_models/model_comparison.json` - Comparativa de modelos
- Gráficas comparativas

---

### 5. `05_model_vgg_ensemble.ipynb`
**Modelo VGG16 y Ensemble Completo**

- Entrenamiento de VGG16
- Implementación de ensemble con soft voting
- Test-Time Augmentation (TTA)
- Evaluación final del ensemble
- Comparativa: Individual vs Ensemble

**Output:**
- `ml_models/vgg16_final.h5` - Modelo VGG16
- `ml_models/ensemble_wrapper.pkl` - Ensemble completo
- Tabla comparativa de todos los modelos
- Confusion matrix del ensemble

---

### 6. `06_gradcam_visualization.ipynb`
**Grad-CAM para Interpretabilidad**

- Implementación de Grad-CAM
- Generación de heatmaps para predicciones
- Análisis de regiones de interés
- Módulo reutilizable para producción

**Output:**
- `backend/src/utils/gradcam.py` - Módulo de Grad-CAM
- Visualizaciones de heatmaps
- Análisis cualitativo de interpretabilidad

---

## 🚀 Orden de Ejecución

Los notebooks deben ejecutarse en orden secuencial:

1. **01_dataset_preparation.ipynb** - Prepara los datos
2. **02_eda_and_augmentation.ipynb** - Analiza y configura augmentation
3. **03_model_efficientnet.ipynb** - Entrena primer modelo
4. **04_model_resnet.ipynb** - Entrena segundo modelo
5. **05_model_vgg_ensemble.ipynb** - Entrena tercer modelo y crea ensemble
6. **06_gradcam_visualization.ipynb** - Genera visualizaciones

## 💻 Requisitos

### Software
- Python 3.10+
- Jupyter Notebook o JupyterLab
- GPU con soporte CUDA (recomendado para entrenamiento)

### Librerías
```bash
pip install tensorflow scikit-learn numpy pandas matplotlib seaborn opencv-python pillow jupyter
```

### Hardware Recomendado
- **RAM**: 16GB mínimo, 32GB recomendado
- **GPU**: NVIDIA con 8GB+ VRAM (o usar Google Colab)
- **Almacenamiento**: 10GB libres

## 🌐 Uso de Google Colab

Si no tienes GPU local, puedes ejecutar los notebooks en Google Colab:

1. Subir notebooks a Google Drive
2. Abrir con Google Colab
3. Activar GPU: Runtime → Change runtime type → Hardware accelerator: GPU
4. Instalar dependencias en la primera celda:
```python
!pip install tensorflow scikit-learn opencv-python
```

## 📊 Tiempo Estimado de Entrenamiento

| Notebook | Hardware | Tiempo Estimado |
|----------|----------|-----------------|
| 01 | CPU | ~5 minutos |
| 02 | CPU | ~10 minutos |
| 03 | GPU (V100) | ~2-3 horas |
| 03 | CPU | ~10-15 horas |
| 04 | GPU (V100) | ~2-3 horas |
| 05 | GPU (V100) | ~1-2 horas + evaluación |
| 06 | GPU/CPU | ~30 minutos |

**Total con GPU**: ~6-9 horas
**Total con CPU**: ~20-30 horas

## 📝 Notas Importantes

1. **Dataset NEU**: Debe descargarse manualmente y colocarse en `data/raw/NEU/`

2. **Checkpoints**: Los modelos se guardan automáticamente durante el entrenamiento con ModelCheckpoint

3. **Memoria**: El entrenamiento de múltiples modelos requiere RAM significativa. Cerrar notebooks anteriores para liberar memoria.

4. **Reproducibilidad**: Se establecen seeds aleatorias para reproducibilidad, pero pequeñas variaciones son normales.

5. **Modelos guardados**: Los archivos .h5 son grandes (100-500MB cada uno), asegúrate de tener espacio suficiente.

## 🐛 Troubleshooting

**Error: CUDA out of memory**
- Reducir batch size en el entrenamiento
- Usar modelo más pequeño (ej: EfficientNetB0 en vez de B3)
- Cerrar otros programas que usen GPU

**Error: Dataset not found**
- Verificar que NEU esté en `data/raw/NEU/`
- Ejecutar notebook 01 primero

**Entrenamiento muy lento**
- Verificar que GPU esté siendo utilizada: `tf.config.list_physical_devices('GPU')`
- Considerar usar Google Colab con GPU gratuita

## 📧 Soporte

Para problemas con los notebooks:
1. Verificar que todas las dependencias estén instaladas
2. Revisar los outputs de error completos
3. Consultar documentación de TensorFlow: https://www.tensorflow.org/
