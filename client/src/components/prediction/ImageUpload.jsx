import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function ImageUpload({ selectedFile, onFileSelect, onClear }) {
  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    } else if (fileRejections && fileRejections.length > 0) {
      const fallbackFile = fileRejections[0]?.file || fileRejections[0];
      if (fallbackFile) {
        onFileSelect(fallbackFile);
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.15)'}`,
            background: isDragActive ? 'rgba(59, 130, 246, 0.08)' : 'rgba(17, 24, 39, 0.5)',
            borderRadius: 'var(--radius-md)',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <input {...getInputProps()} />
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
            {isDragActive ? '📥' : '🔬'}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '6px' }}>
            {isDragActive ? 'Suelta la muestra aquí...' : 'Arrastra una imagen de superficie metálica'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Polivalente: Acepta cualquier formato (JPG, PNG, BMP, WEBP, TIFF, etc.) y cualquier tamaño o resolución fotográfica.
          </p>
          <button type="button" className="btn-secondary" style={{ pointerEvents: 'none' }}>
            Seleccionar archivo local
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="pulse-dot" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
                Muestra en Cámara Óptica
              </span>
            </div>
            <button
              type="button"
              onClick={onClear}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              ✕ Cambiar Muestra
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Optical Sensor Viewport */}
            <div className="scanner-viewport" style={{ width: '160px', height: '160px', flexShrink: 0, position: 'relative' }}>
              <span className="scanner-reticle-tl" />
              <span className="scanner-reticle-tr" />
              <span className="scanner-reticle-bl" />
              <span className="scanner-reticle-br" />
              <div className="laser-beam" />
              <div className="scanner-grid" />
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview de Muestra Metalúrgica"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

            {/* Specimen Telemetry Details */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '6px', wordBreak: 'break-all' }}>
                {selectedFile.name}
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                marginTop: '12px',
                padding: '12px',
                background: 'rgba(5, 8, 17, 0.6)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.78rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Masa Digital:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{(selectedFile.size / 1024).toFixed(1)} KB</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Formato Detectado:</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{selectedFile.type || 'RAW/Polivalente'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Entrada Tensor:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>224 × 224 × 3 RGB</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Estado Metrológico:</span>
                  <strong style={{ color: 'var(--success)' }}>Listo p/ Inferencia</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
