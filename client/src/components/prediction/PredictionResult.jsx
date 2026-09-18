import { DEFECT_CLASSES } from '../../utils/constants';
import { generateInspectionPDF } from '../../utils/pdfGenerator';

export default function PredictionResult({ result, imageSource }) {
  if (!result) return null;

  const { predicted_class, confidence, probabilities, model_used } = result;
  const defectInfo = DEFECT_CLASSES[predicted_class] || {
    label: predicted_class,
    description: 'Defecto identificado en la muestra',
    color: '#3b82f6',
    severity: 'Media'
  };

  const confidencePct = (confidence * 100).toFixed(1);
  const isFlawless = predicted_class === 'flawless_prime';

  // Metallurgical operational recommendations
  const actionProtocols = {
    cracks_scratches: {
      action: 'DETENER LÍNEA Y DESBASTAR',
      protocol: 'Sección no conforme para conformado crítico. Detener bobinadora, inspeccionar cilindros de laminación en frío en busca de esquirlas y marcar metros afectados para cizallado.'
    },
    surface_inclusions: {
      action: 'DESVIAR A SEGUNDA CALIDAD',
      protocol: 'Inclusión de escoria no metálica atrapada. No apto para embutido profundo. Desviar para perfiles estructurales cerrados o reaprovechamiento en fundición.'
    },
    pitting_corrosion: {
      action: 'APLICAR NEUTRALIZANTE Y DECAPAR',
      protocol: 'Ataque por micro-picadura activa. Aislar de humedad ambiental, aplicar pasivante anticorrosivo y recalibrar solución de lavado químico.'
    },
    flawless_prime: {
      action: 'LIBERADO PARA DESPACHO PRIME',
      protocol: 'Superficie homogénea con rugosidad controlada y ausencia de discontinuidades. Cumple especificaciones ASTM/ISO para estampado automotriz y galvanizado.'
    }
  };

  const protocol = actionProtocols[predicted_class] || {
    action: 'INSPECCIÓN MANUAL REQUERIDA',
    protocol: 'Confirmar diagnóstico con ensayo no destructivo adicional (líquidos penetrantes o corrientes inducidas).'
  };

  const handleExportPDF = async () => {
    await generateInspectionPDF(result, imageSource || result.image_url);
  };

  return (
    <div className="glass-card" style={{ padding: '28px', border: `1px solid ${defectInfo.color}40`, boxShadow: `0 8px 30px ${defectInfo.color}15` }}>
      {/* Top Banner Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: isFlawless ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: isFlawless ? 'var(--success)' : '#f87171',
              border: `1px solid ${isFlawless ? 'var(--success)' : 'rgba(239, 68, 68, 0.4)'}`
            }}>
              {isFlawless ? '✓ CONFORME • APTO' : '⚠ NO CONFORME • ANOMALÍA'}
            </span>

            <span className="badge" style={{ background: `${defectInfo.color}20`, color: defectInfo.color, border: `1px solid ${defectInfo.color}40` }}>
              Severidad: {defectInfo.severity}
            </span>

            <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' }}>
              Red: {model_used}
            </span>
          </div>

          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '6px' }}>
            {defectInfo.label}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '520px', lineHeight: 1.5 }}>
            {defectInfo.description}
          </p>
        </div>

        {/* Confidence Gauge & PDF Export */}
        <div style={{ textAlign: 'right', minWidth: '150px' }}>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: defectInfo.color, lineHeight: 1 }}>
            {confidencePct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
            Nivel de Certidumbre
          </div>
          <button
            onClick={handleExportPDF}
            className="btn-secondary"
            style={{
              marginTop: '14px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              background: 'rgba(6, 182, 212, 0.1)',
              borderColor: 'rgba(6, 182, 212, 0.3)',
              color: 'var(--accent-cyan)'
            }}
          >
            📄 Certificado PDF
          </button>
        </div>
      </div>

      {/* Recommended Metallurgical Protocol Box */}
      <div style={{
        marginTop: '18px',
        padding: '16px',
        background: 'rgba(5, 8, 17, 0.7)',
        borderRadius: 'var(--radius-sm)',
        borderLeft: `4px solid ${defectInfo.color}`,
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: defectInfo.color, letterSpacing: '0.05em' }}>
            Protocolo Industrial: {protocol.action}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ISO 9001 / ASTM Quality Control</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {protocol.protocol}
        </p>
      </div>

      {/* Probabilities Distribution Meter */}
      <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid var(--border-color)' }}>
        <h4 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
          Vector de Probabilidad Multiclase (Softmax)
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(probabilities || {}).map(([key, prob]) => {
            const info = DEFECT_CLASSES[key] || { label: key, color: '#6b7280' };
            const pct = (prob * 100).toFixed(1);
            const isWinner = key === predicted_class;

            return (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: isWinner ? 800 : 500, color: isWinner ? '#ffffff' : 'var(--text-secondary)' }}>
                    {info.label} {isWinner && '★'}
                  </span>
                  <span style={{ fontWeight: 700, color: isWinner ? info.color : 'var(--text-muted)' }}>
                    {pct}%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '9999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: isWinner
                      ? `linear-gradient(90deg, ${info.color}80, ${info.color})`
                      : info.color,
                    boxShadow: isWinner ? `0 0 10px ${info.color}` : 'none',
                    borderRadius: '9999px',
                    transition: 'width 0.7s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
