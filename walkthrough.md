# MetalVision AI — Sistema Integral de Control de Calidad Siderúrgica

## 1. Resumen de Logros y Estado Final

### A. Resultados de Modelos y Ensamble Tri-Modelo (Evaluación sobre 270 Muestras de Test)

| Modelo / Arquitectura | Precisión Test (Accuracy) | F1-Score Ponderado | Precision Ponderada | Recall Ponderado |
| :--- | :---: | :---: | :---: | :---: |
| **EfficientNet-B3** | **99.63%** (269/270) | 0.9963 | 0.9963 | 0.9963 |
| **ResNet-50** | **99.26%** (268/270) | 0.9925 | 0.9928 | 0.9926 |
| **VGG-16** | **99.26%** (268/270) | 0.9926 | 0.9928 | 0.9926 |
| **Ensamble Tri-Modelo (Soft Voting)** | **100.00%** (270/270) | **1.0000** | **1.0000** | **1.0000** |

* **Matriz de Confusión del Ensamble:** 0 falsos positivos y 0 falsos negativos en todo el conjunto de prueba independiente.
* **Artefactos Guardados:**
  - `ml_models/ensemble/ensemble_confusion_matrix.png`
  - `ml_models/ensemble/models_accuracy_comparison.png`
  - `ml_models/ensemble/ensemble_evaluation.json`
  - `ml_models/ensemble/ensemble_report.txt`

---

## 2. Mejoras Implementadas

### A. Animación de Análisis Exploratorio (Estilo remove.bg / Escáner Metalúrgico)
* **Duración Calibrada:** Ajustada con un tiempo mínimo garantizado de **3.8 segundos** (`Promise.all([predictionPromise, minAnimationTime])`) para que el usuario pueda apreciar el barrido completo sin importar la velocidad de respuesta del servidor.
* **Efectos Visuales:**
  - Haz láser neón de barrido vertical continuo con cortinas de luz degradada (`.exploratory-laser-sweep`).
  - Malla digital micrométrica de detección de fallas.
  - Retículas dinámicas de focalización (`[+] ZONA A-12 • DISCONTINUIDAD`, `[+] ZONA B-04 • RUGOSIDAD Ra`, `[+] MICRO-INCLUSIÓN • ESCANEO`).
  - HUD activo con telemetría en tiempo real, barras oscilantes de señal a 60 FPS y transición entre 4 fases técnicas:
    1. *Fase 1: Normalización Óptica y calibración de tensores RGB...*
    2. *Fase 2: Análisis Topológico y rugosidad superficial Ra...*
    3. *Fase 3: Inferencia Convolucional profunda...*
    4. *Fase 4: Veredicto Metrológico bajo norma ASTM A653 / ISO 9001:2015.*

### B. Certificados de Inspección en Formato PDF
* **Acceso Permanente:** Botón directo `📄 Descargar PDF` en cada fila del historial y en el modal `👁️ Dictamen`.
* **Inclusión de la Fotografía:** La imagen de la probeta se decodifica e incrusta en alta resolución dentro del informe oficial con marco técnico y retículas.
* **Identificador Sucesivo Correlativo:** Numeración secuencial clara (`MUESTRA SUCESIVA #00001`, `Código: MV-2026-00001`).
* **Informe Consolidado:** Botón `📑 Bitácora PDF Consolidada` para descargar un reporte de auditoría completo con todas las muestras tabuladas.

### C. Registro CSV Organizado para Excel
* Cabeceras descriptivas con formato técnico en español.
* Desglose completo de probabilidades para cada una de las 4 clases de defectos.
* Separador de punto y coma (`;`) y cabecera **UTF-8 BOM** (`\uFEFF`) para compatibilidad directa con Microsoft Excel sin distorsión de caracteres.
