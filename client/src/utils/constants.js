export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const DEFECT_CLASSES = {
  cracks_scratches: {
    label: 'Grietas y Rayaduras',
    description: 'Fisuras superficiales o rayones lineales causados por fricción o estrés mecánico.',
    color: '#ef4444',
    severity: 'Alta'
  },
  surface_inclusions: {
    label: 'Inclusiones Superficiales',
    description: 'Impurezas no metálicas o partículas atrapadas en la superficie del metal.',
    color: '#f59e0b',
    severity: 'Media'
  },
  pitting_corrosion: {
    label: 'Corrosión por Picaduras',
    description: 'Cavidades o pequeños hoyos localizados causados por reacciones electroquímicas.',
    color: '#8b5cf6',
    severity: 'Alta'
  },
  flawless_prime: {
    label: 'Superficie Impecable (Prime)',
    description: 'Metal en estado óptimo, libre de defectos críticos o imperfecciones.',
    color: '#10b981',
    severity: 'Ninguna'
  }
};

export const AVAILABLE_MODELS = [
  { id: 'ensemble', name: 'Ensemble (Soft Voting)', desc: 'Combinación ponderada de los 3 modelos (Recomendado)', accuracy: '100.00%' },
  { id: 'efficientnet', name: 'EfficientNet-B3', desc: 'Transfer Learning de alta precisión y eficiencia', accuracy: '99.63%' },
  { id: 'resnet50', name: 'ResNet-50', desc: 'Arquitectura residual profunda y robusta', accuracy: '99.26%' },
  { id: 'vgg16', name: 'VGG-16', desc: 'Red convolucional clásica de alta estabilidad', accuracy: '99.26%' }
];
