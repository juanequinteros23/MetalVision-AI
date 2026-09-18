export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: '24px 20px',
      marginTop: 'auto',
      background: 'rgba(11, 15, 25, 0.95)',
      color: 'var(--text-muted)',
      fontSize: '0.85rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div>
          <strong style={{ color: 'var(--text-secondary)' }}>MetalVision AI System</strong> — Detección Inteligente de Defectos en Superficies Metálicas
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Dataset: <strong>NEU Surface Defect (1,800 imgs)</strong></span>
          <span>Modelos: <strong>EfficientNetB3 + ResNet50 + VGG16</strong></span>
          <span>Target: <strong style={{ color: 'var(--success)' }}>≥95% Accuracy</strong></span>
        </div>
      </div>
    </footer>
  );
}
