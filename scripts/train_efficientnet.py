"""
Training script for EfficientNetB3 on NEU Surface Defect Database.
Optimized for stability, correct preprocessing, and standalone execution.
"""
import os
import sys
import json
import time
from pathlib import Path
from datetime import datetime

import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, TensorBoard
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

# Set UTF-8 encoding for stdout
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data' / 'processed'
MODEL_DIR = BASE_DIR / 'ml_models' / 'efficientnet'
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Hyperparameters
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
PHASE1_EPOCHS = 15
PHASE2_EPOCHS = 15
LEARNING_RATE = 1e-3
NUM_CLASSES = 4

print("=" * 80)
print("METALVISION AI - EFFICIENTNET-B3 TRAINING PIPELINE")
print("=" * 80)
print(f"Base Directory:  {BASE_DIR}")
print(f"Data Directory:  {DATA_DIR}")
print(f"Model Directory: {MODEL_DIR}")
print(f"Image Size:      {IMG_SIZE}")
print(f"Batch Size:      {BATCH_SIZE}")
print(f"TensorFlow:      {tf.__version__}")
print(f"Keras:           {keras.__version__}")
print("=" * 80)

# 1. DATA GENERATORS
# Note: EfficientNetB3 has built-in Rescaling(1./255) and Normalization layers.
# Therefore, images should remain in [0, 255] (NO rescale=1./255).
print("\n[1/7] Initializing Data Generators...")
train_datagen = ImageDataGenerator(
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    vertical_flip=True,
    brightness_range=[0.8, 1.2],
    zoom_range=0.1,
    fill_mode='nearest'
)

val_test_datagen = ImageDataGenerator()

train_generator = train_datagen.flow_from_directory(
    DATA_DIR / 'train',
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=True,
    seed=42
)

val_generator = val_test_datagen.flow_from_directory(
    DATA_DIR / 'val',
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False
)

test_generator = val_test_datagen.flow_from_directory(
    DATA_DIR / 'test',
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False
)

print(f"  Train samples:      {train_generator.samples}")
print(f"  Validation samples: {val_generator.samples}")
print(f"  Test samples:       {test_generator.samples}")
print(f"  Class mapping:      {train_generator.class_indices}")

# Save class indices for backend ml_service
class_indices_path = MODEL_DIR / 'class_indices.json'
with open(class_indices_path, 'w', encoding='utf-8') as f:
    json.dump(train_generator.class_indices, f, indent=2)
print(f"  ✓ Saved class indices to {class_indices_path}")

# 2. CLASS WEIGHTS
print("\n[2/7] Calculating Class Weights...")
class_weights = compute_class_weight(
    class_weight='balanced',
    classes=np.unique(train_generator.classes),
    y=train_generator.classes
)
class_weight_dict = dict(enumerate(class_weights))
for idx, weight in class_weight_dict.items():
    name = list(train_generator.class_indices.keys())[idx]
    print(f"  {name} (id {idx}): {weight:.3f}")

# 3. MODEL ARCHITECTURE
print("\n[3/7] Building EfficientNetB3 Architecture...")
def build_efficientnet_model(input_shape=(224, 224, 3), num_classes=4):
    base_model = EfficientNetB3(
        weights='imagenet',
        include_top=False,
        input_shape=input_shape
    )
    base_model.trainable = False

    inputs = keras.Input(shape=input_shape)
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)

    model = keras.Model(inputs, outputs, name="EfficientNetB3_MetalVision")
    return model, base_model

model, base_model = build_efficientnet_model(
    input_shape=(*IMG_SIZE, 3),
    num_classes=NUM_CLASSES
)

metrics = [
    'accuracy',
    keras.metrics.AUC(name='auc'),
    keras.metrics.Precision(name='precision'),
    keras.metrics.Recall(name='recall')
]

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=metrics
)
print(f"  Total parameters:      {model.count_params():,}")
print(f"  Trainable parameters:  {sum([tf.size(w).numpy() for w in model.trainable_weights]):,}")

# 4. CALLBACKS SETUP
best_model_path = MODEL_DIR / 'efficientnet_best.keras'
log_dir = MODEL_DIR / 'logs' / datetime.now().strftime('%Y%m%d-%H%M%S')

callbacks_phase1 = [
    EarlyStopping(
        monitor='val_loss',
        patience=6,
        restore_best_weights=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=3,
        min_lr=1e-6,
        verbose=1
    ),
    ModelCheckpoint(
        filepath=str(best_model_path),
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    ),
    TensorBoard(
        log_dir=str(log_dir),
        histogram_freq=0  # Safe: prevents memory explosion
    )
]

# 5. PHASE 1 TRAINING
print("\n[4/7] PHASE 1: Training top layers with frozen base...")
start_time = time.time()
history_p1 = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=PHASE1_EPOCHS,
    class_weight=class_weight_dict,
    callbacks=callbacks_phase1,
    verbose=1
)
p1_duration = time.time() - start_time
print(f"✓ Phase 1 completed in {p1_duration/60:.2f} minutes.")

# 6. PHASE 2 FINE-TUNING
print("\n[5/7] PHASE 2: Fine-tuning top 30 layers...")
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

trainable_count = sum([layer.trainable for layer in base_model.layers])
non_trainable_count = sum([not layer.trainable for layer in base_model.layers])
print(f"  Base trainable layers:     {trainable_count}")
print(f"  Base non-trainable layers: {non_trainable_count}")
print(f"  Total trainable params:    {sum([tf.size(w).numpy() for w in model.trainable_weights]):,}")

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE / 10),
    loss='categorical_crossentropy',
    metrics=metrics
)

callbacks_phase2 = [
    EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=2,
        min_lr=1e-7,
        verbose=1
    ),
    ModelCheckpoint(
        filepath=str(best_model_path),
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    ),
    TensorBoard(
        log_dir=str(log_dir),
        histogram_freq=0
    )
]

start_time = time.time()
history_p2 = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=PHASE2_EPOCHS,
    class_weight=class_weight_dict,
    callbacks=callbacks_phase2,
    verbose=1
)
p2_duration = time.time() - start_time
print(f"✓ Phase 2 completed in {p2_duration/60:.2f} minutes.")

# Load the absolute best checkpoint for evaluation
print("\n[6/7] Loading best checkpoint for final evaluation...")
best_model = keras.models.load_model(str(best_model_path))

# 7. EVALUATION ON TEST SET
print("\n[7/7] Evaluating Best Model on Test Set...")
test_generator.reset()
eval_results = best_model.evaluate(test_generator, verbose=1)
metric_names = best_model.metrics_names
test_metrics = dict(zip(metric_names, [float(x) for x in eval_results]))

print("\n" + "=" * 80)
print("TEST SET EVALUATION RESULTS:")
print("=" * 80)
for k, v in test_metrics.items():
    print(f"  {k:15s}: {v:.4f}")

# Detailed Predictions and Classification Report
test_generator.reset()
y_pred_probs = best_model.predict(test_generator, verbose=1)
y_pred = np.argmax(y_pred_probs, axis=1)
y_true = test_generator.classes
target_names = list(test_generator.class_indices.keys())

clf_report = classification_report(y_true, y_pred, target_names=target_names, output_dict=True)
clf_report_text = classification_report(y_true, y_pred, target_names=target_names)

print("\nCLASSIFICATION REPORT:")
print(clf_report_text)

# Save evaluation report
eval_summary = {
    'model': 'EfficientNetB3',
    'timestamp': datetime.now().isoformat(),
    'test_metrics': test_metrics,
    'classification_report': clf_report,
    'phase1_epochs': len(history_p1.history['loss']),
    'phase2_epochs': len(history_p2.history['loss'])
}

with open(MODEL_DIR / 'evaluation_metrics.json', 'w', encoding='utf-8') as f:
    json.dump(eval_summary, f, indent=2)

with open(MODEL_DIR / 'classification_report.txt', 'w', encoding='utf-8') as f:
    f.write(clf_report_text)

# Save Confusion Matrix Plot
cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=target_names, yticklabels=target_names)
plt.title('EfficientNetB3 - Test Set Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.tight_layout()
cm_plot_path = MODEL_DIR / 'confusion_matrix.png'
plt.savefig(cm_plot_path, dpi=300)
plt.close()
print(f"✓ Confusion matrix plot saved to {cm_plot_path}")

# Combine histories and save training curves
def combine_history(h1, h2):
    combined = {}
    keys = h1.history.keys()
    for k in keys:
        combined[k] = h1.history[k] + h2.history.get(k, [])
    return combined

combined_history = combine_history(history_p1, history_p2)

# Save history curves
plt.figure(figsize=(14, 5))
# Accuracy plot
plt.subplot(1, 2, 1)
plt.plot(combined_history['accuracy'], label='Train Accuracy', color='#1f77b4', lw=2)
plt.plot(combined_history['val_accuracy'], label='Val Accuracy', color='#ff7f0e', lw=2)
plt.axvline(x=len(history_p1.history['accuracy'])-1, color='gray', linestyle='--', label='Phase 2 Start')
plt.title('EfficientNetB3 - Accuracy History')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True, alpha=0.3)

# Loss plot
plt.subplot(1, 2, 2)
plt.plot(combined_history['loss'], label='Train Loss', color='#1f77b4', lw=2)
plt.plot(combined_history['val_loss'], label='Val Loss', color='#ff7f0e', lw=2)
plt.axvline(x=len(history_p1.history['loss'])-1, color='gray', linestyle='--', label='Phase 2 Start')
plt.title('EfficientNetB3 - Loss History')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.grid(True, alpha=0.3)

plt.tight_layout()
history_plot_path = MODEL_DIR / 'training_history.png'
plt.savefig(history_plot_path, dpi=300)
plt.close()
print(f"✓ Training history plot saved to {history_plot_path}")

# Save final model copy
final_model_path = MODEL_DIR / 'efficientnet_final.keras'
best_model.save(str(final_model_path))
print(f"✓ Final model saved to {final_model_path}")

print("\n" + "=" * 80)
print("🎉 EFFICIENTNET-B3 TRAINING AND EVALUATION SUCCESSFULLY COMPLETED!")
print(f"   Test Accuracy: {test_metrics['accuracy']*100:.2f}%")
print(f"   Best Model:    {best_model_path}")
print("=" * 80)
