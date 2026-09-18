"""
Evaluation script for the MetalVision AI 3-Model Ensemble.
Performs soft-voting prediction on test set and computes comprehensive comparative metrics.
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime

import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data' / 'processed'
MODELS_DIR = BASE_DIR / 'ml_models'
ENSEMBLE_DIR = MODELS_DIR / 'ensemble'
ENSEMBLE_DIR.mkdir(parents=True, exist_ok=True)

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

print("=" * 80)
print("METALVISION AI - ENSEMBLE EVALUATION PIPELINE")
print("=" * 80)

# 1. Load Test Data (Raw RGB in [0, 255])
test_datagen = ImageDataGenerator()
test_generator = test_datagen.flow_from_directory(
    DATA_DIR / 'test',
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False
)

y_true = test_generator.classes
target_names = list(test_generator.class_indices.keys())
print(f"Test samples: {test_generator.samples}")
print(f"Classes:      {target_names}")

# 2. Load Models
model_paths = {
    'EfficientNetB3': MODELS_DIR / 'efficientnet' / 'efficientnet_best.keras',
    'ResNet50':       MODELS_DIR / 'resnet50' / 'resnet50_best.keras',
    'VGG16':          MODELS_DIR / 'vgg16' / 'vgg16_best.keras'
}

loaded_models = {}
for name, path in model_paths.items():
    if path.exists():
        print(f"✓ Loading {name} from {path}...")
        loaded_models[name] = keras.models.load_model(str(path))
    else:
        print(f"⚠️ Model not found: {path}")

if not loaded_models:
    print("❌ No models available to evaluate!")
    sys.exit(1)

# 3. Individual Model Predictions
predictions = {}
individual_metrics = {}

for name, model in loaded_models.items():
    test_generator.reset()
    probs = model.predict(test_generator, verbose=1)
    preds = np.argmax(probs, axis=1)
    acc = accuracy_score(y_true, preds)
    p, r, f1, _ = precision_recall_fscore_support(y_true, preds, average='weighted')
    
    predictions[name] = probs
    individual_metrics[name] = {
        'accuracy': float(acc),
        'precision': float(p),
        'recall': float(r),
        'f1_score': float(f1)
    }
    print(f"\n{name} Test Accuracy: {acc*100:.2f}% | F1: {f1:.4f}")

# 4. Ensemble Prediction (Soft Voting)
all_probs = list(predictions.values())
ensemble_probs = np.mean(all_probs, axis=0)
ensemble_preds = np.argmax(ensemble_probs, axis=1)
ensemble_acc = accuracy_score(y_true, ensemble_preds)
p, r, f1, _ = precision_recall_fscore_support(y_true, ensemble_preds, average='weighted')

print("\n" + "=" * 80)
print(f"🎉 ENSEMBLE TEST ACCURACY: {ensemble_acc*100:.2f}% (Target: ≥95%)")
print(f"   Weighted F1 Score:      {f1:.4f}")
print("=" * 80)

# 5. Classification Report
clf_report_text = classification_report(y_true, ensemble_preds, target_names=target_names)
clf_report_dict = classification_report(y_true, ensemble_preds, target_names=target_names, output_dict=True)
print("\nENSEMBLE CLASSIFICATION REPORT:")
print(clf_report_text)

# 6. Save Confusion Matrix
cm = confusion_matrix(y_true, ensemble_preds)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Purples',
            xticklabels=target_names, yticklabels=target_names)
plt.title(f'Ensemble Model - Test Set Confusion Matrix (Acc: {ensemble_acc*100:.2f}%)')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.tight_layout()
cm_plot_path = ENSEMBLE_DIR / 'ensemble_confusion_matrix.png'
plt.savefig(cm_plot_path, dpi=300)
plt.close()
print(f"✓ Ensemble confusion matrix saved to {cm_plot_path}")

# 7. Comparative Bar Chart
models_list = list(individual_metrics.keys()) + ['Ensemble']
accuracies = [individual_metrics[m]['accuracy'] * 100 for m in individual_metrics.keys()] + [ensemble_acc * 100]

plt.figure(figsize=(10, 6))
colors = ['#1f77b4', '#2ca02c', '#ff7f0e', '#9467bd']
bars = plt.bar(models_list, accuracies, color=colors[:len(models_list)], width=0.5)
plt.axhline(y=95, color='r', linestyle='--', label='Academic Target (95%)')
plt.title('Model Accuracy Comparison on Test Set', fontsize=14, pad=15)
plt.ylabel('Accuracy (%)', fontsize=12)
plt.ylim(80, 102)
for bar in bars:
    yval = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2.0, yval + 0.5, f"{yval:.2f}%", ha='center', va='bottom', fontweight='bold')
plt.legend()
plt.tight_layout()
comp_plot_path = ENSEMBLE_DIR / 'models_accuracy_comparison.png'
plt.savefig(comp_plot_path, dpi=300)
plt.close()
print(f"✓ Model comparison plot saved to {comp_plot_path}")

# 8. Save Metrics JSON
ensemble_summary = {
    'timestamp': datetime.now().isoformat(),
    'ensemble_accuracy': float(ensemble_acc),
    'ensemble_precision': float(p),
    'ensemble_recall': float(r),
    'ensemble_f1': float(f1),
    'individual_models': individual_metrics,
    'classification_report': clf_report_dict
}

with open(ENSEMBLE_DIR / 'ensemble_evaluation.json', 'w', encoding='utf-8') as f:
    json.dump(ensemble_summary, f, indent=2)

with open(ENSEMBLE_DIR / 'ensemble_report.txt', 'w', encoding='utf-8') as f:
    f.write(clf_report_text)

print(f"✓ All ensemble metrics and reports saved to {ENSEMBLE_DIR}")
print("=" * 80)
