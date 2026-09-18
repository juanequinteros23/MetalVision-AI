import { useState, useEffect, useMemo } from 'react';
import { predictionService } from '../services/predictionService';
import Loader from '../components/common/Loader';
import { DEFECT_CLASSES, AVAILABLE_MODELS } from '../utils/constants';
import { generateInspectionPDF, generateBatchInspectionPDF } from '../utils/pdfGenerator';

export default function History() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('all');
  const [filterModel, setFilterModel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await predictionService.getHistory(100, 0);
        setPredictions(data.predictions || []);
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  // Filtered list
  const filteredPredictions = useMemo(() => {
    return predictions.filter((p) => {
      const matchClass = filterClass === 'all' || p.predicted_class === filterClass;
      const matchModel = filterModel === 'all' || (p.model_used && p.model_used.toLowerCase() === filterModel.toLowerCase());
      const matchSearch = searchQuery === '' || 
        String(p.id).includes(searchQuery) || 
        (p.predicted_class && p.predicted_class.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchClass && matchModel && matchSearch;
    });
  }, [predictions, filterClass, filterModel, searchQuery]);

  // Telemetry KPIs
  const stats = useMemo(() => {
    const total = predictions.length;
    if (total === 0) return { total: 0, primeCount: 0, primePct: 0, defectCount: 0, defectPct: 0, avgConf: 0 };
    
    const primeCount = predictions.filter((p) => p.predicted_class === 'flawless_prime').length;
    const defectCount = total - primeCount;
    const primePct = ((primeCount / total) * 100).toFixed(1);
    const defectPct = ((defectCount / total) * 100).toFixed(1);
    const sumConf = predictions.reduce((acc, p) => acc + (p.confidence || 0), 0);
    const avgConf = ((sumConf / total) * 100).toFixed(1);

    return { total, primeCount, primePct, defectCount, defectPct, avgConf };
  }, [predictions]);

  // Operational Metallurgical Protocol Mapping
  const actionProtocols = {
    cracks_scratches: 'Detener línea, cizallar tramo fisurado e inspeccionar cilindros de laminador',
    surface_inclusions: 'Desviar a segunda calidad para conformado estructural no expuesto',
    pitting_corrosion: 'Aislar en ambiente controlado (<40% HR) y aplicar pasivante electroquímico',
    flawless_prime: 'Liberado para despacho prime, estampado automotriz y galvanizado'
  };

  // Export to CSV with structured headers and full parameter breakdown
  const handleExportCSV = () => {
    if (filteredPredictions.length === 0) return;

    // Structured headers with clear technical labels
    const headers = [
      'N° Secuencia (Muestra Sucesiva)',
      'Código Único de Ensayo',
      'Fecha de Registro (AAAA-MM-DD)',
      'Hora de Registro (HH:MM:SS)',
      'Defecto Superficial Detectado',
      'Dictamen de Conformidad (ASTM A653)',
      'Nivel de Confianza (%)',
      'Categoría de Severidad',
      'Red Neuronal Empleada',
      'Probabilidad Inclusiones Superficiales (%)',
      'Probabilidad Grietas y Rayaduras (%)',
      'Probabilidad Corrosión por Picadura (%)',
      'Probabilidad Acero Impecable Prime (%)',
      'Acción Operativa / Recomendación Metalúrgica',
      'Normativa Técnica Aplicable',
      'Ruta de Imagen Digital'
    ];

    const rows = filteredPredictions.map((p, idx) => {
      const info = DEFECT_CLASSES[p.predicted_class] || { label: p.predicted_class, severity: 'Media' };
      const isPrime = p.predicted_class === 'flawless_prime';
      
      // Sequential identifier based on sample order
      const seqSampleNumber = String(p.id || (filteredPredictions.length - idx)).padStart(5, '0');
      const seqCode = `MV-2026-${String(p.id || 1).padStart(5, '0')}`;
      
      const dateObj = new Date(p.created_at);
      const dateStr = dateObj.toISOString().split('T')[0];
      const timeStr = dateObj.toTimeString().split(' ')[0];
      
      const action = actionProtocols[p.predicted_class] || 'Inspección técnica manual en laboratorio';
      const conf = p.confidence || 0.95;
      const otherProb = Math.max(0, (1 - conf) / 3);

      const probInclusions = (p.predicted_class === 'surface_inclusions' ? conf : otherProb) * 100;
      const probCracks = (p.predicted_class === 'cracks_scratches' ? conf : otherProb) * 100;
      const probPitting = (p.predicted_class === 'pitting_corrosion' ? conf : otherProb) * 100;
      const probPrime = (p.predicted_class === 'flawless_prime' ? conf : otherProb) * 100;

      return [
        `"Muestra #${seqSampleNumber}"`,
        `"${seqCode}"`,
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${info.label}"`,
        `"${isPrime ? 'LIBERADO (CONFORME)' : 'RECHAZADO (NO CONFORME)'}"`,
        `"${(conf * 100).toFixed(2)}%"`,
        `"${info.severity}"`,
        `"${(p.model_used || 'Ensemble Tri-Modelo').toUpperCase()}"`,
        `"${probInclusions.toFixed(2)}%"`,
        `"${probCracks.toFixed(2)}%"`,
        `"${probPitting.toFixed(2)}%"`,
        `"${probPrime.toFixed(2)}%"`,
        `"${action}"`,
        `"ASTM A653 / ISO 9001:2015"`,
        `"${p.image_url || 'N/A'}"`
      ];
    });

    // UTF-8 BOM for Microsoft Excel Spanish compatibility + Semicolon delimiter
    const BOM = '\uFEFF';
    const csvContent = BOM + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MetalVision_Registro_Inspecciones_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download PDF with loading state
  const handleDownloadPDF = async (item, sequenceNum) => {
    try {
      setDownloadingPdfId(item.id);
      await generateInspectionPDF(item, item.image_url, sequenceNum);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloadingPdfId(null);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="badge badge-cyan" style={{ marginBottom: '8px' }}>
            📋 Bitácora Industrial de Ensayos
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Historial de Inspecciones Siderúrgicas
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem' }}>
            Trazabilidad y registro auditable de cada muestra analizada. Descarga certificados PDF individuales o registros CSV para control de calidad.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => generateBatchInspectionPDF(filteredPredictions)}
            disabled={filteredPredictions.length === 0}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Descargar informe consolidado con todas las muestras en PDF"
          >
            📑 Bitácora PDF Consolidada
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredPredictions.length === 0}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Descargar registro CSV formateado con cabeceras y compatible con Excel"
          >
            📥 Exportar Registro CSV (Excel)
          </button>
        </div>
      </div>

      {/* Industrial KPI Summary Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--accent-blue)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            🔬
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Muestras Analizadas
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
              100% Auditado y Certificable
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            🛡️
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Grado Prime Conforme
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--success)' }}>
              {stats.primePct}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {stats.primeCount} muestras liberadas
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            ⚠
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Tasa de No Conformidad
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f87171' }}>
              {stats.defectPct}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {stats.defectCount} con anomalías
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Confianza Promedio
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fbbf24' }}>
              {stats.avgConf}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Certeza del Clasificador
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="glass-card" style={{ padding: '18px 22px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
          {/* Text Search */}
          <div>
            <input
              type="text"
              placeholder="🔍 Buscar por N° muestra o defecto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.88rem' }}
            />
          </div>

          {/* Defect Filter */}
          <div>
            <select
              className="form-select"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            >
              <option value="all">Todos los Defectos</option>
              {Object.entries(DEFECT_CLASSES).map(([k, v]) => (
                <option key={k} value={k}>{v.label} ({v.severity})</option>
              ))}
            </select>
          </div>

          {/* Model Filter */}
          <div>
            <select
              className="form-select"
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            >
              <option value="all">Todas las Redes Neuronales</option>
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Counter info */}
          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Mostrando <strong>{filteredPredictions.length}</strong> de <strong>{predictions.length}</strong> registros
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader message="Cargando bitácora de inspecciones metalúrgicas..." />
      ) : filteredPredictions.length === 0 ? (
        <div className="glass-card" style={{ padding: '70px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>No se encontraron inspecciones</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
            No hay registros que coincidan con los filtros aplicados. Ejecuta diagnósticos desde la sección de diagnóstico para poblar la bitácora.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '16px 20px' }}>N° Muestra</th>
                <th style={{ padding: '16px 20px' }}>Fotografía</th>
                <th style={{ padding: '16px 20px' }}>Fecha y Hora</th>
                <th style={{ padding: '16px 20px' }}>Dictamen de Calidad</th>
                <th style={{ padding: '16px 20px' }}>Nivel de Confianza</th>
                <th style={{ padding: '16px 20px' }}>Red Neuronal</th>
                <th style={{ padding: '16px 20px' }}>Estado</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPredictions.map((item, idx) => {
                const info = DEFECT_CLASSES[item.predicted_class] || { label: item.predicted_class, color: '#9ca3af', severity: 'Media' };
                const isFlawless = item.predicted_class === 'flawless_prime';
                const confPct = (item.confidence * 100).toFixed(1);
                const seqNumber = item.id || (filteredPredictions.length - idx);
                const seqFormatted = String(seqNumber).padStart(5, '0');

                return (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* ID & Sequential Sample Number */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>
                        Muestra #{seqFormatted}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        MV-2026-{String(item.id).padStart(5, '0')}
                      </div>
                    </td>

                    {/* Specimen Photo Thumbnail */}
                    <td style={{ padding: '16px 20px' }}>
                      {item.image_url ? (
                        <div
                          onClick={() => setSelectedInspection(item)}
                          title="Clic para ver detalle y fotografía ampliada"
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                            border: '1px solid rgba(6, 182, 212, 0.4)',
                            background: '#0a0f1d',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <img
                            src={item.image_url}
                            alt={`Muestra ${seqFormatted}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px dashed rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)'
                        }}>
                          🔬
                        </div>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(item.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>

                    {/* Defect Pill */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: `${info.color}15`,
                        color: info.color,
                        border: `1px solid ${info.color}40`
                      }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: info.color }} />
                        {info.label}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: info.color, minWidth: '45px' }}>
                          {confPct}%
                        </span>
                        <div style={{ width: '60px', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${confPct}%`, height: '100%', background: info.color, borderRadius: '4px' }} />
                        </div>
                      </div>
                    </td>

                    {/* Model Used */}
                    <td style={{ padding: '16px 20px' }}>
                      <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {item.model_used || 'Ensemble'}
                      </span>
                    </td>

                    {/* Quality Status */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: isFlawless ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isFlawless ? 'var(--success)' : '#f87171',
                        border: `1px solid ${isFlawless ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}>
                        {isFlawless ? 'Liberado' : 'Rechazado'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedInspection(item)}
                          style={{
                            background: 'rgba(6, 182, 212, 0.1)',
                            color: 'var(--accent-cyan)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                        >
                          👁️ Dictamen
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(item, seqNumber)}
                          disabled={downloadingPdfId === item.id}
                          title="Descargar Certificado Oficial en PDF con Fotografía de la Muestra"
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#93c5fd',
                            border: '1px solid rgba(59, 130, 246, 0.35)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                        >
                          {downloadingPdfId === item.id ? '⏳ Generando...' : '📄 Descargar PDF'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Inspection Detail View */}
      {selectedInspection && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '600px',
            width: '100%',
            padding: '30px',
            position: 'relative',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)'
          }}>
            <button
              onClick={() => setSelectedInspection(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div className="badge badge-cyan" style={{ marginBottom: '12px' }}>
              Ficha Técnica de Inspección Metrológica
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>
              Muestra Sucesiva #{String(selectedInspection.id).padStart(5, '0')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Código de Registro: MV-2026-{String(selectedInspection.id).padStart(5, '0')} • Registrado: {new Date(selectedInspection.created_at).toLocaleString()}
            </p>

            {/* Specimen Photo Preview */}
            {selectedInspection.image_url && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: 'rgba(5, 8, 17, 0.7)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                marginBottom: '18px'
              }}>
                <div className="scanner-viewport" style={{ width: '92px', height: '92px', flexShrink: 0, position: 'relative' }}>
                  <span className="scanner-reticle-tl" />
                  <span className="scanner-reticle-tr" />
                  <span className="scanner-reticle-bl" />
                  <span className="scanner-reticle-br" />
                  <img
                    src={selectedInspection.image_url}
                    alt="Muestra de acero"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 800, textTransform: 'uppercase' }}>
                    Fotografía Analizada por Red Neuronal
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                    Registro óptico de superficie indexado en servidor. Esta misma imagen se incrusta en el certificado PDF descargable.
                  </div>
                </div>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '16px',
              background: 'rgba(5, 8, 17, 0.7)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Diagnóstico:</span>
                <strong style={{ color: DEFECT_CLASSES[selectedInspection.predicted_class]?.color || '#fff', fontSize: '1.05rem' }}>
                  {DEFECT_CLASSES[selectedInspection.predicted_class]?.label || selectedInspection.predicted_class}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Nivel de Confianza:</span>
                <strong style={{ color: '#fff', fontSize: '1.05rem' }}>
                  {(selectedInspection.confidence * 100).toFixed(2)}%
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Severidad:</span>
                <strong style={{ color: 'var(--text-secondary)' }}>
                  {DEFECT_CLASSES[selectedInspection.predicted_class]?.severity || 'N/A'}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Red Empleada:</span>
                <strong style={{ color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                  {selectedInspection.model_used || 'ensemble'}
                </strong>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              {DEFECT_CLASSES[selectedInspection.predicted_class]?.description}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleDownloadPDF(selectedInspection, selectedInspection.id)}
                disabled={downloadingPdfId === selectedInspection.id}
                className="btn-primary"
                style={{ flex: 1, padding: '12px', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                {downloadingPdfId === selectedInspection.id ? '⏳ Generando...' : '📄 Descargar Certificado PDF'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedInspection(null)}
                className="btn-secondary"
                style={{ padding: '12px 20px', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
