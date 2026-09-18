import { useState, useEffect } from 'react';

/**
 * SurfaceScanAnalysisAnimation
 * 
 * High-tech exploratory metallurgical surface scan animation inspired by remove.bg,
 * specifically customized for deep learning steel defect detection and ASTM metrology.
 * 
 * @param {File|Blob|string} imageSource - Specimen image currently undergoing diagnosis
 * @param {string} modelName - Neural network model currently executing inference
 */
export default function SurfaceScanAnalysisAnimation({ imageSource, modelName = 'ensemble' }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [progress, setProgress] = useState(15);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const stages = [
    { title: 'Normalización Óptica', desc: 'Calibrando espectrometría y normalizando tensores RGB (224×224×3)...', color: '#06b6d4' },
    { title: 'Análisis Topológico', desc: 'Mapeando rugosidad superficial Ra y micro-discontinuidades en frío...', color: '#3b82f6' },
    { title: 'Inferencia Convolucional', desc: 'Extrayendo mapas de calor profundos e identificando patrones de falla...', color: '#8b5cf6' },
    { title: 'Veredicto Metrológico', desc: 'Consolidando probabilidades multiclase bajo norma ASTM A653 / ISO 9001...', color: '#10b981' }
  ];

  // Create preview URL safely
  useEffect(() => {
    if (!imageSource) return;

    if (imageSource instanceof File || imageSource instanceof Blob) {
      const url = URL.createObjectURL(imageSource);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof imageSource === 'string') {
      setImageUrl(imageSource);
    }
  }, [imageSource]);

  // Telemetry Progress Simulation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return Math.min(prev + 3, 98);
      });
    }, 110);

    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 880);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, []);

  const currentStage = stages[currentStageIndex];

  return (
    <div className="glass-card" style={{
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(6, 182, 212, 0.4)',
      boxShadow: '0 0 50px rgba(6, 182, 212, 0.15)'
    }}>
      {/* Top Telemetry Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="pulse-dot" style={{ backgroundColor: '#06b6d4', boxShadow: '0 0 12px #06b6d4' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Escaneo Metalúrgico en Curso
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(6, 182, 212, 0.3)', fontSize: '0.75rem' }}>
            RED: {modelName.toUpperCase()}
          </span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Main Specimen Laser Scan Chamber (remove.bg style sweep) */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '340px',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: '#050811',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Reticle Target Brackets */}
        <span className="scanner-reticle-tl" />
        <span className="scanner-reticle-tr" />
        <span className="scanner-reticle-bl" />
        <span className="scanner-reticle-br" />

        {/* The Analyzed Steel Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Probeta en escaneo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'contrast(1.1) brightness(0.95)',
              display: 'block'
            }}
          />
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Cargando probeta en cámara óptica...
          </div>
        )}

        {/* 1. Holographic Defect Inspection Grid Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          mixBlendMode: 'screen'
        }} />

        {/* 2. Sweeping Metallurgical Laser Line (remove.bg style sweep) */}
        <div className="exploratory-laser-sweep" />

        {/* 3. Floating Target Reticles (Simulating defect exploration points) */}
        <div className="defect-reticle-pulse" style={{ top: '28%', left: '32%' }}>
          <span className="reticle-cross" />
          <span className="reticle-label">ZONA A-12 • DISCONTINUIDAD</span>
        </div>

        <div className="defect-reticle-pulse" style={{ top: '62%', left: '68%', animationDelay: '0.8s' }}>
          <span className="reticle-cross" />
          <span className="reticle-label">ZONA B-04 • RUGOSIDAD Ra</span>
        </div>

        <div className="defect-reticle-pulse" style={{ top: '45%', left: '50%', animationDelay: '1.4s' }}>
          <span className="reticle-cross" />
          <span className="reticle-label">MICRO-INCLUSIÓN • ESCANEO</span>
        </div>

        {/* 4. Active HUD Scan Telemetry Ribbon */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          background: 'rgba(5, 8, 17, 0.85)',
          backdropFilter: 'blur(6px)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>FPS: 60.0</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
            <span>SENSORES: 4 CANALES</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
            <span style={{ color: '#10b981' }}>ESTADO: ESCANEANDO</span>
          </div>

          <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '14px' }}>
            <span className="audio-wave-bar" style={{ animationDelay: '0.1s' }} />
            <span className="audio-wave-bar" style={{ animationDelay: '0.3s' }} />
            <span className="audio-wave-bar" style={{ animationDelay: '0.2s' }} />
            <span className="audio-wave-bar" style={{ animationDelay: '0.4s' }} />
            <span className="audio-wave-bar" style={{ animationDelay: '0.15s' }} />
          </div>
        </div>
      </div>

      {/* Progress Bar with Cyan Glow */}
      <div style={{ marginTop: '18px', marginBottom: '14px' }}>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            boxShadow: '0 0 15px #06b6d4',
            borderRadius: '9999px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Dynamic Descriptive Stage Badge */}
      <div style={{
        background: 'rgba(5, 8, 17, 0.7)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-sm)',
        borderLeft: `4px solid ${currentStage.color}`,
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: currentStage.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {currentStage.title}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Fase {currentStageIndex + 1} de {stages.length}
          </span>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
          {currentStage.desc}
        </p>
      </div>
    </div>
  );
}
