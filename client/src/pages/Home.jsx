import { Link, useNavigate } from 'react-router-dom';
import { DEFECT_CLASSES, AVAILABLE_MODELS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import heroScannerImg from '../assets/hero_scanner.jpg';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const realSamples = [
    { title: 'Grietas y Rayaduras', file: '/samples/sample_cracks.jpg', classId: 'cracks_scratches', tag: 'Cracks', fileName: 'sample_cracks.jpg' },
    { title: 'Inclusiones Superficiales', file: '/samples/sample_inclusions.jpg', classId: 'surface_inclusions', tag: 'Inclusions', fileName: 'sample_inclusions.jpg' },
    { title: 'Corrosión por Picadura', file: '/samples/sample_pitting.jpg', classId: 'pitting_corrosion', tag: 'Pitting', fileName: 'sample_pitting.jpg' },
    { title: 'Superficie Impecable', file: '/samples/sample_flawless.jpg', classId: 'flawless_prime', tag: 'Prime', fileName: 'sample_flawless.jpg' },
  ];

  const handleTestSample = (sample) => {
    navigate('/predict', { state: { samplePath: sample.file, sampleName: sample.fileName, sampleTitle: sample.title } });
  };

  return (
    <div className="app-container">
      {/* Live System Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '10px 18px',
        background: 'rgba(13, 20, 36, 0.8)',
        border: '1px solid var(--border-color)',
        borderRadius: '9999px',
        marginBottom: '36px',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="pulse-dot" />
          <span><strong>Sistema de Inspección MetalVision:</strong> En Línea</span>
        </div>
        <div style={{ display: 'flex', gap: '18px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          <span>⚙️ Inferencia: <strong>&lt; 150 ms</strong></span>
          <span>🏆 EfficientNet-B3: <strong style={{ color: 'var(--success)' }}>99.63%</strong></span>
          <span>🛡️ ResNet-50: <strong style={{ color: 'var(--accent-cyan)' }}>99.26%</strong></span>
          <span>⚡ VGG-16: <strong style={{ color: '#c084fc' }}>99.26%</strong></span>
          <span>★ Ensamble Maestro: <strong style={{ color: '#fbbf24' }}>100.00%</strong></span>
        </div>
      </div>

      {/* Hero Section with Industrial Background Backdrop */}
      <section className="hero-industrial-backdrop" style={{
        backgroundImage: `url(${heroScannerImg})`,
        marginBottom: '60px'
      }}>
        <div className="hero-overlay">
          <div style={{ maxWidth: '860px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div className="badge badge-cyan">
                ⚡ Industria 4.0 • Control de Calidad Siderúrgico
              </div>
              <div className="badge badge-purple">
                🔬 Visión por Computadora & Deep Learning
              </div>
              <div className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                ★ Ensamble Soft Voting (100% Precisión)
              </div>
            </div>

            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '20px',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
              background: 'linear-gradient(180deg, #ffffff 30%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Inspección Autónoma de Superficies de Acero
            </h1>

            <p style={{
              color: '#e2e8f0',
              fontSize: '1.2rem',
              lineHeight: 1.6,
              marginBottom: '34px',
              maxWidth: '740px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
            }}>
              Sistema de alta precisión para detección y clasificación de anomalías en bobinas y láminas de acero laminado. Entrenado sobre la base de datos industrial <strong>NEU Surface Defect Database</strong> con un ensamble tri-modelo validado con el <strong>100.0% de precisión</strong>.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
              <Link to={isAuthenticated ? '/predict' : '/login'} className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.08rem' }}>
                🔬 Iniciar Diagnóstico en Línea
              </Link>
              <a href="#samples" className="btn-secondary" style={{ padding: '16px 28px', fontSize: '1.08rem', background: 'rgba(15, 23, 42, 0.7)' }}>
                ⚡ Probar Muestras Reales ↓
              </a>
            </div>

            {/* In-Hero Telemetry Metrics Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.14)'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Latencia de Inferencia
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>
                  &lt; 150 ms
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Aceleración AVX2
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  EfficientNet-B3
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--success)' }}>
                  99.63%
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  269/270 test aprobados
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  ResNet-50
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8' }}>
                  99.26%
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  268/270 test aprobados
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  VGG-16
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#c084fc' }}>
                  99.26%
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  268/270 test aprobados
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>
                  ★ Ensamble
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fbbf24' }}>
                  100.0%
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  270/270 Perfecto
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Model Architecture Showcase */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Arquitectura del Ensamble Tri-Modelo
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Combinación sinérgica de tres redes neuronales convolucionales con Soft Voting para máxima robustez
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {AVAILABLE_MODELS.map((m) => {
            const isEnsemble = m.id === 'ensemble';
            return (
              <div
                key={m.id}
                className={isEnsemble ? 'glass-card-glow' : 'glass-card'}
                style={{
                  padding: '24px',
                  borderTop: isEnsemble ? '4px solid var(--accent-cyan)' : '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{m.name}</h3>
                  <span className="badge badge-success">{m.accuracy}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '16px' }}>
                  {m.desc}
                </p>
                <div style={{ fontSize: '0.8rem', color: isEnsemble ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                  {isEnsemble ? '★ Ensamble Maestro' : '• Modelo Individual'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Real Samples Section */}
      <section id="samples" style={{ marginBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="badge badge-purple" style={{ marginBottom: '10px' }}>Muestras de Prueba</div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Prueba Rápida con Imágenes Industriales Reales
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Haz clic en cualquiera de las siguientes muestras del dataset NEU para evaluarlas en vivo
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {realSamples.map((sample) => {
            const defect = DEFECT_CLASSES[sample.classId];
            return (
              <div
                key={sample.classId}
                className="glass-card"
                onClick={() => handleTestSample(sample)}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div style={{
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  marginBottom: '14px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <img
                    src={sample.file}
                    alt={sample.title}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="badge" style={{ background: `${defect.color}20`, color: defect.color }}>
                    {sample.tag}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                  {sample.title}
                </h4>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '100%', padding: '8px', fontSize: '0.85rem', marginTop: '10px' }}
                >
                  ⚡ Analizar esta muestra
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Industrial Defect Types Detail */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Taxonomía de Defectos Metálicos
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Clasificación oficial de acuerdo con la norma de inspección superficial
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '20px'
        }}>
          {Object.entries(DEFECT_CLASSES).map(([key, info]) => (
            <div key={key} className="glass-card" style={{ padding: '24px', borderLeft: `5px solid ${info.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: info.color }}>
                  Severidad: {info.severity}
                </span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: info.color }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                {info.label}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {info.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
