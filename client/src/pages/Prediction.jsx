import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ImageUpload from '../components/prediction/ImageUpload';
import PredictionResult from '../components/prediction/PredictionResult';
import SurfaceScanAnalysisAnimation from '../components/prediction/SurfaceScanAnalysisAnimation';
import Loader from '../components/common/Loader';
import { predictionService } from '../services/predictionService';
import { AVAILABLE_MODELS, DEFECT_CLASSES } from '../utils/constants';

export default function Prediction() {
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState('efficientnet');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mode: single vs batch
  const [mode, setMode] = useState('single');
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchResults, setBatchResults] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);

  // Quick Samples
  const quickSamples = [
    { label: 'Grieta / Rayón', file: '/samples/sample_cracks.jpg', name: 'sample_cracks.jpg' },
    { label: 'Picadura', file: '/samples/sample_pitting.jpg', name: 'sample_pitting.jpg' },
    { label: 'Inclusión', file: '/samples/sample_inclusions.jpg', name: 'sample_inclusions.jpg' },
    { label: 'Impecable', file: '/samples/sample_flawless.jpg', name: 'sample_flawless.jpg' },
  ];

  // If navigated from Home with sample
  useEffect(() => {
    if (location.state?.samplePath) {
      loadSampleFromPath(location.state.samplePath, location.state.sampleName || 'sample.jpg');
    }
  }, [location.state]);

  const loadSampleFromPath = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const safeFilename = (filename && filename.includes('.')) ? filename : `${filename || 'sample'}.jpg`;
      const loadedFile = new File([blob], safeFilename, { type: blob.type || 'image/jpeg' });
      setFile(loadedFile);
      setResult(null);
      setError('');
    } catch (e) {
      console.error('Error loading sample image:', e);
    }
  };

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Garantizar tiempo mínimo de 3.8s para que la animación de escaneo láser se aprecie plenamente
      const minAnimationTime = new Promise((resolve) => setTimeout(resolve, 3800));
      const [data] = await Promise.all([
        predictionService.predictSingle(file, selectedModel),
        minAnimationTime
      ]);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al procesar la imagen. Verifica que el backend esté activo en http://localhost:5000'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBatchPredict = async () => {
    if (batchFiles.length === 0) return;
    setBatchLoading(true);
    setError('');
    setBatchResults(null);

    try {
      const minAnimationTime = new Promise((resolve) => setTimeout(resolve, 3800));
      const [data] = await Promise.all([
        predictionService.predictBatch(batchFiles, selectedModel),
        minAnimationTime
      ]);
      setBatchResults(data.predictions || []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al procesar el lote de imágenes.'
      );
    } finally {
      setBatchLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div className="badge badge-cyan" style={{ marginBottom: '8px' }}>
            🔬 Diagnóstico en Tiempo Real
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Inspección de Superficies de Acero
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Sube una o múltiples muestras de metal laminado para clasificación automatizada
          </p>
        </div>

        {/* Mode Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setMode('single')}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: mode === 'single' ? 'var(--accent-blue)' : 'transparent',
              color: mode === 'single' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            Muestra Individual
          </button>
          <button
            onClick={() => setMode('batch')}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: mode === 'batch' ? 'var(--accent-blue)' : 'transparent',
              color: mode === 'batch' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            Lote (Batch)
          </button>
        </div>
      </div>

      {mode === 'single' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px', alignItems: 'start' }}>
          {/* Left Column: Upload & Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Model selector */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>
                Seleccionar Red Neuronal:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {AVAILABLE_MODELS.map((m) => {
                  const isSelected = selectedModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedModel(m.id)}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)', marginTop: '2px' }}>
                        Acc: {m.accuracy}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Test Samples */}
            <div className="glass-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                💡 Probar muestra instantánea:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {quickSamples.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => loadSampleFromPath(s.file, s.name)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      transition: 'background 0.2s'
                    }}
                  >
                    ⚡ {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Area */}
            <ImageUpload
              selectedFile={file}
              onFileSelect={(f) => { setFile(f); setResult(null); setError(''); }}
              onClear={handleClear}
            />

            {/* Action button */}
            <button
              onClick={handlePredict}
              disabled={!file || loading}
              className="btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: '1.05rem' }}
            >
              {loading ? 'Analizando con Red Neuronal...' : '🔍 Ejecutar Diagnóstico'}
            </button>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem'
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div>
            {loading && (
              <SurfaceScanAnalysisAnimation imageSource={file} modelName={selectedModel} />
            )}

            {!loading && result && (
              <PredictionResult result={result} imageSource={file} />
            )}

            {!loading && !result && (
              <div className="scanner-viewport" style={{
                padding: '60px 24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                minHeight: '420px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <span className="scanner-reticle-tl" />
                <span className="scanner-reticle-tr" />
                <span className="scanner-reticle-bl" />
                <span className="scanner-reticle-br" />
                <div className="scanner-grid" />

                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  marginBottom: '18px',
                  boxShadow: '0 0 30px rgba(6, 182, 212, 0.2)'
                }}>
                  🔬
                </div>

                <div className="badge badge-cyan" style={{ marginBottom: '10px' }}>
                  Cámara de Inspección Lista
                </div>

                <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, marginBottom: '8px' }}>
                  Esperando Muestra de Acero
                </h3>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                  Sube una fotografía, micrografía o selecciona una de las <strong>muestras instantáneas</strong> para ejecutar el análisis de convolución profunda.
                </p>

                {/* Pipeline Flow Stepper */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(13, 20, 36, 0.8)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>1. Captura Digital</span>
                  <span>→</span>
                  <span style={{ color: '#38bdf8' }}>2. Tensor 224×224</span>
                  <span>→</span>
                  <span style={{ color: '#818cf8' }}>3. Extracción de Rasgos</span>
                  <span>→</span>
                  <span style={{ color: 'var(--success)' }}>4. Dictamen de Calidad</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batch Inspection Mode */
        <div className="glass-card" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
            Inspección por Lotes de Láminas
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Carga múltiples imágenes para evaluar una remesa o bobina completa en una sola pasada.
          </p>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setBatchFiles(Array.from(e.target.files || []))}
            style={{ marginBottom: '20px' }}
          />

          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Archivos seleccionados: <strong>{batchFiles.length}</strong>
            </span>
          </div>

          <button
            onClick={handleBatchPredict}
            disabled={batchFiles.length === 0 || batchLoading}
            className="btn-primary"
            style={{ marginBottom: '30px' }}
          >
            {batchLoading ? 'Procesando lote...' : `Analizar ${batchFiles.length} Muestras`}
          </button>

          {batchResults && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Archivo</th>
                    <th style={{ padding: '12px' }}>Defecto Predicho</th>
                    <th style={{ padding: '12px' }}>Confianza</th>
                    <th style={{ padding: '12px' }}>Severidad</th>
                  </tr>
                </thead>
                <tbody>
                  {batchResults.map((item, idx) => {
                    const defect = DEFECT_CLASSES[item.predicted_class] || { label: item.predicted_class, color: '#3b82f6', severity: 'Media' };
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px' }}>{item.image_path?.split(/[\\/]/).pop() || `Muestra #${idx+1}`}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: defect.color }}>{defect.label}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{(item.confidence * 100).toFixed(1)}%</td>
                        <td style={{ padding: '12px' }}>
                          <span className="badge" style={{ background: `${defect.color}20`, color: defect.color }}>
                            {defect.severity}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
