import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Eye,
  Users,
  DollarSign,
  Compass,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';

export type PeriodType = 'dias' | 'semanas' | 'meses' | 'semestral';

interface MetricPoint {
  label: string;
  views: number;
  revenue: number;
  customers: number;
  sublabel?: string;
}

const PERIOD_DATA: Record<PeriodType, {
  summary: {
    totalRevenue: string;
    revenueGrowth: string;
    totalCustomers: string;
    customersGrowth: string;
    totalViews: string;
    viewsGrowth: string;
    conversionRate: string;
    conversionGrowth: string;
  };
  metrics: MetricPoint[];
  channelDistribution: { label: string; pct: number; color: string }[];
}> = {
  dias: {
    summary: {
      totalRevenue: 'R$ 11.450',
      revenueGrowth: '+14.2%',
      totalCustomers: '380',
      customersGrowth: '+9.5%',
      totalViews: '2.640',
      viewsGrowth: '+21.3%',
      conversionRate: '14.4%',
      conversionGrowth: '+2.1%'
    },
    metrics: [
      { label: 'Seg', sublabel: '16/09', views: 240, revenue: 1100, customers: 38 },
      { label: 'Ter', sublabel: '17/09', views: 310, revenue: 1420, customers: 45 },
      { label: 'Qua', sublabel: '18/09', views: 380, revenue: 1650, customers: 54 },
      { label: 'Qui', sublabel: '19/09', views: 420, revenue: 1890, customers: 62 },
      { label: 'Sex', sublabel: '20/09', views: 560, revenue: 2650, customers: 89 },
      { label: 'Sáb', sublabel: '21/09', views: 490, revenue: 2100, customers: 71 },
      { label: 'Dom', sublabel: '22/09', views: 240, revenue: 640, customers: 21 },
    ],
    channelDistribution: [
      { label: 'Busca no Mapa', pct: 54, color: '#6366f1' },
      { label: 'Raio de Proximidade', pct: 28, color: '#38bdf8' },
      { label: 'Rotas Traçadas', pct: 12, color: '#10b981' },
      { label: 'Compartilhamento Direto', pct: 6, color: '#f59e0b' }
    ]
  },
  semanas: {
    summary: {
      totalRevenue: 'R$ 48.250',
      revenueGrowth: '+12.4%',
      totalCustomers: '1.420',
      customersGrowth: '+8.1%',
      totalViews: '9.840',
      viewsGrowth: '+23.0%',
      conversionRate: '14.4%',
      conversionGrowth: '+1.8%'
    },
    metrics: [
      { label: 'Sem 1', sublabel: '01 a 07', views: 980, revenue: 4900, customers: 155 },
      { label: 'Sem 2', sublabel: '08 a 14', views: 1120, revenue: 5400, customers: 172 },
      { label: 'Sem 3', sublabel: '15 a 21', views: 1260, revenue: 6150, customers: 198 },
      { label: 'Sem 4', sublabel: '22 a 28', views: 1450, revenue: 7300, customers: 220 },
      { label: 'Sem 5', sublabel: '29 a 05', views: 1380, revenue: 6900, customers: 205 },
      { label: 'Sem 6', sublabel: '06 a 12', views: 1580, revenue: 8100, customers: 240 },
      { label: 'Sem 7', sublabel: '13 a 19', views: 1490, revenue: 7600, customers: 225 },
      { label: 'Sem 8', sublabel: '20 a 26', views: 1680, revenue: 8900, customers: 260 },
    ],
    channelDistribution: [
      { label: 'Busca no Mapa', pct: 51, color: '#6366f1' },
      { label: 'Raio de Proximidade', pct: 31, color: '#38bdf8' },
      { label: 'Rotas Traçadas', pct: 11, color: '#10b981' },
      { label: 'Compartilhamento Direto', pct: 7, color: '#f59e0b' }
    ]
  },
  meses: {
    summary: {
      totalRevenue: 'R$ 294.800',
      revenueGrowth: '+26.8%',
      totalCustomers: '9.340',
      customersGrowth: '+18.4%',
      totalViews: '64.200',
      viewsGrowth: '+34.2%',
      conversionRate: '14.5%',
      conversionGrowth: '+3.2%'
    },
    metrics: [
      { label: 'Out', sublabel: '2025', views: 3900, revenue: 18200, customers: 580 },
      { label: 'Nov', sublabel: '2025', views: 4200, revenue: 19800, customers: 640 },
      { label: 'Dez', sublabel: '2025', views: 6100, revenue: 31500, customers: 980 },
      { label: 'Jan', sublabel: '2026', views: 4600, revenue: 22100, customers: 710 },
      { label: 'Fev', sublabel: '2026', views: 4900, revenue: 23400, customers: 745 },
      { label: 'Mar', sublabel: '2026', views: 5300, revenue: 25100, customers: 810 },
      { label: 'Abr', sublabel: '2026', views: 5600, revenue: 26800, customers: 860 },
      { label: 'Mai', sublabel: '2026', views: 5900, revenue: 28400, customers: 890 },
      { label: 'Jun', sublabel: '2026', views: 6400, revenue: 30900, customers: 960 },
      { label: 'Jul', sublabel: '2026', views: 6700, revenue: 32600, customers: 1020 },
      { label: 'Ago', sublabel: '2026', views: 7200, revenue: 34500, customers: 1090 },
      { label: 'Set', sublabel: '2026', views: 7800, revenue: 37200, customers: 1180 },
    ],
    channelDistribution: [
      { label: 'Busca no Mapa', pct: 49, color: '#6366f1' },
      { label: 'Raio de Proximidade', pct: 33, color: '#38bdf8' },
      { label: 'Rotas Traçadas', pct: 13, color: '#10b981' },
      { label: 'Compartilhamento Direto', pct: 5, color: '#f59e0b' }
    ]
  },
  semestral: {
    summary: {
      totalRevenue: 'R$ 546.000',
      revenueGrowth: '+38.5%',
      totalCustomers: '17.800',
      customersGrowth: '+29.1%',
      totalViews: '121.500',
      viewsGrowth: '+46.0%',
      conversionRate: '14.6%',
      conversionGrowth: '+4.0%'
    },
    metrics: [
      { label: '2024.2', sublabel: 'Jul - Dez 24', views: 24500, revenue: 112000, customers: 3600 },
      { label: '2025.1', sublabel: 'Jan - Jun 25', views: 32000, revenue: 148000, customers: 4800 },
      { label: '2025.2', sublabel: 'Jul - Dez 25', views: 42800, revenue: 198000, customers: 6400 },
      { label: '2026.1', sublabel: 'Jan - Jun 26', views: 56400, revenue: 262000, customers: 8400 },
      { label: '2026.2', sublabel: 'Jul - Atual', views: 65100, revenue: 284000, customers: 9400 },
    ],
    channelDistribution: [
      { label: 'Busca no Mapa', pct: 47, color: '#6366f1' },
      { label: 'Raio de Proximidade', pct: 35, color: '#38bdf8' },
      { label: 'Rotas Traçadas', pct: 14, color: '#10b981' },
      { label: 'Compartilhamento Direto', pct: 4, color: '#f59e0b' }
    ]
  }
};

type MetricKey = 'views' | 'revenue' | 'customers';

export const PerformanceCharts: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('meses');
  const [activeMetric, setActiveMetric] = useState<MetricKey>('revenue');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const currentData = PERIOD_DATA[period];
  const items = currentData.metrics;

  // Cálculos para o gráfico SVG de Área e Linha
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 25;

  const values = items.map((m) => m[activeMetric]);
  const maxValue = Math.max(...values, 1) * 1.15; // margem superior
  const minValue = 0;

  const points = useMemo(() => {
    return items.map((item, idx) => {
      const x = paddingX + (idx / (items.length - 1 || 1)) * (chartWidth - paddingX * 2);
      const val = item[activeMetric];
      const y = chartHeight - paddingY - ((val - minValue) / (maxValue - minValue)) * (chartHeight - paddingY * 2);
      return { x, y, item, val };
    });
  }, [items, activeMetric, maxValue, minValue]);

  // Caminho da linha e da área
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };

    let lPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Curva Bézier suave entre pontos
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      lPath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    const aPath = `${lPath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;
    return { linePath: lPath, areaPath: aPath };
  }, [points]);

  // Formatação de valores para exibição
  const formatMetricValue = (val: number, metric: MetricKey) => {
    if (metric === 'revenue') {
      return `R$ ${val.toLocaleString('pt-BR')}`;
    }
    return val.toLocaleString('pt-BR');
  };

  const getMetricLabel = (key: MetricKey) => {
    switch (key) {
      case 'revenue': return 'Faturamento Estimado';
      case 'views': return 'Visualizações no Guia';
      case 'customers': return 'Clientes Atendidos';
    }
  };

  return (
    <div className="performance-analytics-wrapper">
      {/* 1. Header do Painel com Filtros de Período */}
      <div className="analytics-header-card">
        <div className="analytics-title-group">
          <div className="analytics-icon-badge">
            <Layers size={22} />
          </div>
          <div>
            <h2 className="analytics-main-title">Painel Analítico de Desempenho</h2>
            <p className="analytics-subtitle">
              Métricas detalhadas e tendências do seu negócio no ecossistema Voyage
            </p>
          </div>
        </div>

        {/* Seletor de Período (Dias, Semanas, Meses, Semestral) */}
        <div className="period-selector-pills" role="tablist" aria-label="Seletor de Período">
          <button
            type="button"
            className={`period-pill-btn ${period === 'dias' ? 'active' : ''}`}
            onClick={() => { setPeriod('dias'); setHoveredIndex(null); }}
          >
            <Calendar size={14} />
            <span>Dias</span>
          </button>
          <button
            type="button"
            className={`period-pill-btn ${period === 'semanas' ? 'active' : ''}`}
            onClick={() => { setPeriod('semanas'); setHoveredIndex(null); }}
          >
            <Calendar size={14} />
            <span>Semanas</span>
          </button>
          <button
            type="button"
            className={`period-pill-btn ${period === 'meses' ? 'active' : ''}`}
            onClick={() => { setPeriod('meses'); setHoveredIndex(null); }}
          >
            <Calendar size={14} />
            <span>Meses</span>
          </button>
          <button
            type="button"
            className={`period-pill-btn ${period === 'semestral' ? 'active' : ''}`}
            onClick={() => { setPeriod('semestral'); setHoveredIndex(null); }}
          >
            <Calendar size={14} />
            <span>Semestrais</span>
          </button>
        </div>
      </div>

      {/* 2. Grid de Resumo dos Indicadores Principais do Período */}
      <div className="kpi-grid analytics-kpis">
        <div
          className={`kpi-box clickable-kpi ${activeMetric === 'revenue' ? 'selected-metric' : ''}`}
          onClick={() => setActiveMetric('revenue')}
        >
          <div className="kpi-header-row">
            <span className="kpi-label">Volume Estimado</span>
            <div className="metric-icon-bubble revenue">
              <DollarSign size={16} />
            </div>
          </div>
          <span className="kpi-value">{currentData.summary.totalRevenue}</span>
          <span className="kpi-growth positive">
            <TrendingUp size={14} />
            {currentData.summary.revenueGrowth} vs período ant.
          </span>
        </div>

        <div
          className={`kpi-box clickable-kpi ${activeMetric === 'customers' ? 'selected-metric' : ''}`}
          onClick={() => setActiveMetric('customers')}
        >
          <div className="kpi-header-row">
            <span className="kpi-label">Clientes Atendidos</span>
            <div className="metric-icon-bubble customers">
              <Users size={16} />
            </div>
          </div>
          <span className="kpi-value">{currentData.summary.totalCustomers}</span>
          <span className="kpi-growth positive">
            <TrendingUp size={14} />
            {currentData.summary.customersGrowth} vs período ant.
          </span>
        </div>

        <div
          className={`kpi-box clickable-kpi ${activeMetric === 'views' ? 'selected-metric' : ''}`}
          onClick={() => setActiveMetric('views')}
        >
          <div className="kpi-header-row">
            <span className="kpi-label">Visualizações no Guia</span>
            <div className="metric-icon-bubble views">
              <Eye size={16} />
            </div>
          </div>
          <span className="kpi-value">{currentData.summary.totalViews}</span>
          <span className="kpi-growth positive">
            <TrendingUp size={14} />
            {currentData.summary.viewsGrowth} neste intervalo
          </span>
        </div>

        <div className="kpi-box">
          <div className="kpi-header-row">
            <span className="kpi-label">Taxa de Conversão</span>
            <div className="metric-icon-bubble conversion">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <span className="kpi-value">{currentData.summary.conversionRate}</span>
          <span className="kpi-growth positive">
            <TrendingUp size={14} />
            {currentData.summary.conversionGrowth} de eficiência
          </span>
        </div>
      </div>

      {/* 3. Gráfico Principal de Linha/Área Dinâmico */}
      <div className="company-card chart-container-card">
        <div className="card-header chart-header">
          <div>
            <span className="card-title">
              <TrendingUp size={18} className="card-title-icon" />
              Evolução Temporal: {getMetricLabel(activeMetric)}
            </span>
            <span className="chart-granularity-indicator">
              Visualizando dados agregados por <strong>{period.toUpperCase()}</strong>
            </span>
          </div>

          {/* Abas rápidas para trocar a métrica do gráfico */}
          <div className="metric-toggle-group">
            <button
              className={`metric-toggle-btn ${activeMetric === 'revenue' ? 'active' : ''}`}
              onClick={() => setActiveMetric('revenue')}
            >
              Faturamento
            </button>
            <button
              className={`metric-toggle-btn ${activeMetric === 'views' ? 'active' : ''}`}
              onClick={() => setActiveMetric('views')}
            >
              Visualizações
            </button>
            <button
              className={`metric-toggle-btn ${activeMetric === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveMetric('customers')}
            >
              Clientes
            </button>
          </div>
        </div>

        {/* SVG Interativo com gradiente e eixos */}
        <div className="svg-chart-wrapper">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="analytics-svg-element"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Linhas de Grade Horizontais */}
            {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
              const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
              return (
                <line
                  key={ratio}
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Área sombreada sob a linha */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#chartGradient)"
                className="chart-area-path"
              />
            )}

            {/* Linha principal com curva Bézier suave */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="url(#lineGlow)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="chart-line-path"
              />
            )}

            {/* Marcadores circulares interativos */}
            {points.map((p, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6 : 4}
                    fill="#ffffff"
                    stroke="#6366f1"
                    strokeWidth={isHovered ? 3 : 2}
                    className="chart-data-point"
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* Linha guia vertical no hover */}
                  {isHovered && (
                    <line
                      x1={p.x}
                      y1={paddingY}
                      x2={p.x}
                      y2={chartHeight - paddingY}
                      stroke="rgba(99, 102, 241, 0.5)"
                      strokeDasharray="2 2"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Rótulos do Eixo X */}
          <div className="chart-x-labels">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`chart-x-item ${hoveredIndex === idx ? 'highlight' : ''}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span className="x-main">{item.label}</span>
                {item.sublabel && <span className="x-sub">{item.sublabel}</span>}
              </div>
            ))}
          </div>

          {/* Tooltip flutuante de detalhe do ponto selecionado */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <div
              className="chart-floating-tooltip"
              style={{
                left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
                top: `${(points[hoveredIndex].y / chartHeight) * 100}%`
              }}
            >
              <div className="tooltip-title">
                {items[hoveredIndex].label} {items[hoveredIndex].sublabel ? `(${items[hoveredIndex].sublabel})` : ''}
              </div>
              <div className="tooltip-metric">
                <span className="dot"></span>
                <span>{getMetricLabel(activeMetric)}: </span>
                <strong>{formatMetricValue(points[hoveredIndex].val, activeMetric)}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Gráfico Secundário em Barras + Distribuição por Origem */}
      <div className="analytics-dual-grid">
        {/* Gráfico de Barras: Comparativo Direto por Intervalo */}
        <div className="company-card">
          <div className="card-header">
            <span className="card-title">
              <Compass size={18} className="card-title-icon" />
              Volume Comparativo ({getMetricLabel(activeMetric)})
            </span>
          </div>

          <div className="bar-chart-container">
            {items.map((item, idx) => {
              const val = item[activeMetric];
              const pct = Math.max(12, Math.round((val / maxValue) * 100));
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={idx}
                  className={`bar-chart-column ${isHovered ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="bar-val-top">
                    {formatMetricValue(val, activeMetric)}
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="bar-label">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Origem e Canais de Tráfego */}
        <div className="company-card">
          <div className="card-header">
            <span className="card-title">
              <Filter size={18} className="card-title-icon" />
              Distribuição por Origem no Voyage
            </span>
          </div>

          <p className="card-description">
            Como os clientes locais encontram o seu estabelecimento:
          </p>

          <div className="channel-distribution-list">
            {currentData.channelDistribution.map((ch, idx) => (
              <div key={idx} className="channel-dist-item">
                <div className="channel-info-row">
                  <div className="channel-name-col">
                    <span className="channel-dot" style={{ backgroundColor: ch.color }}></span>
                    <span className="channel-label">{ch.label}</span>
                  </div>
                  <span className="channel-pct">{ch.pct}%</span>
                </div>
                <div className="channel-progress-track">
                  <div
                    className="channel-progress-bar"
                    style={{ width: `${ch.pct}%`, backgroundColor: ch.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="performance-tip-box">
            <span className="tip-badge">Dica Voyage</span>
            <p>
              Mais de <strong>50% das buscas</strong> vêm diretamente da navegação pelo mapa. Manter suas fotos e horários atualizados maximiza o clique para rota.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;
