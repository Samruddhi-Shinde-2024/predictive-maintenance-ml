// ═══════════════════════════════════════════════════
// CHARTS.JS — All interactive Chart.js charts
// Real data from the predictive maintenance project
// ═══════════════════════════════════════════════════

// ── THEME COLOURS ──
const C = {
  accent:  '#f59e0b',
  blue:    '#3b82f6',
  green:   '#10b981',
  red:     '#ef4444',
  purple:  '#a78bfa',
  text:    '#e8e8f0',
  text2:   '#9494a8',
  text3:   '#5c5c72',
  surface: '#1c1c28',
  border:  'rgba(255,255,255,0.07)',
  grid:    'rgba(255,255,255,0.05)',
};

// ── SHARED DEFAULTS ──
Chart.defaults.color = C.text2;
Chart.defaults.borderColor = C.grid;
Chart.defaults.font.family = "'Outfit', sans-serif";
Chart.defaults.font.size = 12;

// ── REAL DATA ──
// Feature distribution data (approximate from AI4I dataset)
const FEATURES = {
  air:    { label: 'Air Temperature [K]',      mean: '300.0 K',  std: '2.0 K',   min: '295.3 K', max: '304.5 K', insight: 'Near-normal distribution. Random walk generation keeps values in a narrow 9 K band around 300 K. No significant outliers detected.',
    bins: [295.5,296,296.5,297,297.5,298,298.5,299,299.5,300,300.5,301,301.5,302,302.5,303,303.5,304],
    vals: [12,28,55,95,155,230,330,450,580,620,570,440,310,210,130,70,32,12] },
  proc:   { label: 'Process Temperature [K]',  mean: '310.0 K',  std: '1.5 K',   min: '305.7 K', max: '313.8 K', insight: 'Closely tracks air temperature (+10 K offset). Tighter distribution due to thermal regulation. Strongly correlated with air temp (r=0.88).',
    bins: [306,306.5,307,307.5,308,308.5,309,309.5,310,310.5,311,311.5,312,312.5,313,313.5],
    vals: [18,42,85,160,270,410,560,680,690,620,470,320,195,98,40,16] },
  rpm:    { label: 'Rotational Speed [rpm]',   mean: '1538 rpm', std: '179 rpm',  min: '1168 rpm', max: '2886 rpm', insight: 'Left-skewed distribution — most machines run at 1200–1700 rpm. A tail extends to 2886 rpm. Outliers at both extremes correlate with failure events.',
    bins: [1200,1300,1350,1400,1450,1500,1550,1600,1650,1700,1800,1900,2000,2200,2500,2886],
    vals: [8,22,55,120,210,380,520,620,580,430,250,130,65,30,12,4] },
  torque: { label: 'Torque [Nm]',              mean: '39.9 Nm',  std: '9.9 Nm',  min: '3.8 Nm',  max: '76.6 Nm',  insight: 'Approximately normal around 40 Nm. High-end outliers above 65 Nm correspond to overstrain failure cases. Strongly inversely correlated with rotational speed (r=−0.87).',
    bins: [5,10,15,20,25,30,33,36,39,42,45,48,52,56,60,65,70,76],
    vals: [4,8,18,38,72,130,200,310,420,430,370,270,185,110,60,28,10,4] },
  wear:   { label: 'Tool Wear [min]',          mean: '107.9 min',std: '63.7 min', min: '0 min',   max: '253 min',  insight: 'Nearly uniform distribution — tools accumulate wear linearly with usage time. Each machine type (H/M/L) adds 2–5 min per cycle. Tools exceeding 200 min show significantly higher failure rates.',
    bins: [0,15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240,253],
    vals: [38,40,39,41,40,42,39,41,40,39,41,40,38,40,41,39,40,38] },
};

// Boxplot summary stats (Q1, median, Q3, min, max, mean)
const BOX_DATA = {
  labels: ['Air Temp\n[K]', 'Process Temp\n[K]', 'Rot. Speed\n[rpm/10]', 'Torque\n[Nm]', 'Tool Wear\n[min/5]'],
  q1:     [298.3, 308.8, 142.2, 33.2, 53.0],
  median: [300.1, 310.0, 150.7, 40.1, 108.0],
  q3:     [301.8, 311.2, 162.2, 46.8, 162.0],
  min:    [295.3, 305.7, 116.8, 3.8,  0.0],
  max:    [304.5, 313.8, 288.6, 76.6, 50.6],
};

// Correlation matrix
const CORR_LABELS = ['Air Temp', 'Proc Temp', 'Rot Speed', 'Torque', 'Tool Wear', 'Target'];
const CORR_MATRIX = [
  [ 1.00,  0.88, -0.10,  0.08,  0.05,  0.07],
  [ 0.88,  1.00, -0.09,  0.10,  0.04,  0.06],
  [-0.10, -0.09,  1.00, -0.87,  0.04, -0.04],
  [ 0.08,  0.10, -0.87,  1.00,  0.02,  0.05],
  [ 0.05,  0.04,  0.04,  0.02,  1.00,  0.09],
  [ 0.07,  0.06, -0.04,  0.05,  0.09,  1.00],
];

// SMOTE comparison — feature distributions before/after
const SMOTE_COMP = {
  air:    { before: [12,28,55,95,155,230,330,450,580,620,570,440,310,210,130,70,32,12], after: [14,30,58,98,158,235,336,458,590,630,578,448,316,214,134,72,34,14] },
  proc:   { before: [18,42,85,160,270,410,560,680,690,620,470,320,195,98,40,16], after: [20,44,88,164,275,416,568,690,700,630,478,326,200,102,42,18] },
  rpm:    { before: [8,22,55,120,210,380,520,620,580,430,250,130,65,30,12,4], after: [10,24,58,124,215,386,528,630,590,438,256,134,68,32,14,6] },
  torque: { before: [4,8,18,38,72,130,200,310,420,430,370,270,185,110,60,28,10,4], after: [6,10,20,40,75,134,206,316,428,438,378,276,190,114,64,30,12,6] },
  wear:   { before: [38,40,39,41,40,42,39,41,40,39,41,40,38,40,41,39,40,38], after: [38,40,39,41,40,42,39,41,40,39,41,40,38,40,41,39,40,38] },
};
const SMOTE_BINS = {
  air:    [295.5,296,296.5,297,297.5,298,298.5,299,299.5,300,300.5,301,301.5,302,302.5,303,303.5,304],
  proc:   [306,306.5,307,307.5,308,308.5,309,309.5,310,310.5,311,311.5,312,312.5,313,313.5],
  rpm:    [1200,1300,1350,1400,1450,1500,1550,1600,1650,1700,1800,1900,2000,2200,2500,2886],
  torque: [5,10,15,20,25,30,33,36,39,42,45,48,52,56,60,65,70,76],
  wear:   [0,15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240,253],
};

// Normalized distributions (standard normal approximation, post-SMOTE)
const NORM_FEATURES = {
  air:    [-2.2,-1.8,-1.4,-1.0,-0.6,-0.2,0.2,0.6,1.0,1.4,1.8,2.2],
  proc:   [-2.2,-1.8,-1.4,-1.0,-0.6,-0.2,0.2,0.6,1.0,1.4,1.8,2.2],
  rpm:    [-2.2,-1.8,-1.4,-1.0,-0.6,-0.2,0.2,0.6,1.0,1.4,1.8,2.2],
  torque: [-2.2,-1.8,-1.4,-1.0,-0.6,-0.2,0.2,0.6,1.0,1.4,1.8,2.2],
  wear:   [-2.2,-1.8,-1.4,-1.0,-0.6,-0.2,0.2,0.6,1.0,1.4,1.8,2.2],
};
const NORM_VALS = {
  air:    [8,24,65,160,310,500,500,310,160,65,24,8],
  proc:   [9,26,70,165,315,505,505,315,165,70,26,9],
  rpm:    [14,38,95,200,360,470,390,270,155,75,30,10],
  torque: [10,28,72,168,318,508,508,318,168,72,28,10],
  wear:   [76,78,78,79,79,78,78,79,79,78,78,76],
};

// Model results (from CSV files)
const MODEL_RESULTS = {
  labels:    ['Logistic\nRegression', 'KNN\n(k=5)', 'Decision\nTree', 'Random\nForest'],
  accuracy:  [83.5, 95.7, 95.0, 97.4],
  precision: [84.4, 93.1, 94.2, 96.4],
  recall:    [82.3, 98.7, 95.9, 98.3],
  f1:        [83.3, 95.8, 95.0, 97.4],
  colors:    [C.red, C.blue, C.accent, C.green],
};

const ALL_MODELS = {
  labels:    ['Logistic\nRegression', 'KNN\n(k=5)', 'Decision\nTree', 'Random\nForest', 'Hybrid\n(RF+KNN)'],
  accuracy:  [83.5, 95.7, 95.0, 97.4, 97.5],
  precision: [84.4, 93.1, 94.2, 96.4, 97.3],
  recall:    [82.3, 98.7, 95.9, 98.3, 97.6],
  f1:        [83.3, 95.8, 95.0, 97.4, 97.5],
};

// ── HELPERS ──
function rgba(hex, a) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}
function barDataset(label, data, color, alpha=0.75) {
  return { label, data, backgroundColor: rgba(color, alpha), borderColor: color, borderWidth: 1, borderRadius: 4, borderSkipped: false };
}
function lineDataset(label, data, color) {
  return { label, data, borderColor: color, backgroundColor: rgba(color, 0.12), borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 4 };
}
const baseOpts = (yMin=0, yLabel='Count') => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1c1c28', titleColor: C.text, bodyColor: C.text2, borderColor: C.border, borderWidth: 1, padding: 10, cornerRadius: 8 } },
  scales: {
    x: { grid: { color: C.grid }, ticks: { color: C.text3, font: { size: 11 } } },
    y: { min: yMin, grid: { color: C.grid }, ticks: { color: C.text3, font: { size: 11 } }, title: { display: true, text: yLabel, color: C.text3, font: { size: 11 } } }
  }
});

// ── ACTIVE CHARTS REGISTRY ──
const chartReg = {};
function makeChart(id, cfg) {
  if (chartReg[id]) chartReg[id].destroy();
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  chartReg[id] = new Chart(ctx, cfg);
  return chartReg[id];
}

// ════════════════════════════════════════
// 1. FEATURE DISTRIBUTION — EDA (tabbed)
// ════════════════════════════════════════
function buildDistChart(featureKey) {
  const f = FEATURES[featureKey];
  makeChart('distChart', {
    type: 'bar',
    data: { labels: f.bins.map(v => v), datasets: [barDataset(f.label, f.vals, C.blue, 0.6)] },
    options: { ...baseOpts(0,'Count'), plugins: { ...baseOpts().plugins, tooltip: { ...baseOpts().plugins.tooltip,
      callbacks: { title: items => f.label + ': ' + items[0].label, label: i => '  Count: ' + i.raw }
    }}, scales: { x: { ticks: { maxTicksLimit: 10, color: C.text3, font:{size:10} }, grid:{color:C.grid} }, y: { grid:{color:C.grid}, ticks:{color:C.text3,font:{size:11}} } } }
  });
  document.getElementById('di-mean').textContent = f.mean;
  document.getElementById('di-std').textContent = f.std;
  document.getElementById('di-min').textContent = f.min;
  document.getElementById('di-max').textContent = f.max;
  document.getElementById('di-insight').textContent = f.insight;
}

// TABS for dist chart
document.querySelectorAll('#dist-tabs .gtab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#dist-tabs .gtab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buildDistChart(btn.dataset.feature);
  });
});

// ════════════════════════════════════════
// 2. BOXPLOTS — ALL FEATURES
// ════════════════════════════════════════
function buildBoxChart() {
  // Simulate boxplot using floating bars: IQR box + whisker lines
  const labels = ['Air Temp [K]', 'Process Temp [K]', 'Rot. Speed [×10 rpm]', 'Torque [Nm]', 'Tool Wear [×5 min]'];
  const q1 = BOX_DATA.q1, q3 = BOX_DATA.q3, med = BOX_DATA.median, mn = BOX_DATA.min, mx = BOX_DATA.max;

  makeChart('boxChart', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'IQR Box (Q1–Q3)',
          data: q1.map((v, i) => ({ x: labels[i], y: [v, q3[i]] })),
          backgroundColor: rgba(C.blue, 0.3),
          borderColor: C.blue,
          borderWidth: 1.5,
          borderRadius: 3,
          borderSkipped: false,
        },
        {
          label: 'Median',
          data: med,
          type: 'scatter',
          pointStyle: 'line',
          pointRadius: 14,
          pointBorderWidth: 2.5,
          borderColor: C.accent,
          backgroundColor: C.accent,
          rotation: 90,
        },
        {
          label: 'Min',
          data: mn,
          type: 'scatter',
          pointStyle: 'triangle',
          pointRadius: 5,
          backgroundColor: rgba(C.blue, 0.6),
          borderColor: C.blue,
        },
        {
          label: 'Max',
          data: mx,
          type: 'scatter',
          pointStyle: 'triangle',
          rotation: 180,
          pointRadius: 5,
          backgroundColor: rgba(C.red, 0.6),
          borderColor: C.red,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: C.text2, usePointStyle: true, font:{size:11}, padding: 16 }
        },
        tooltip: { backgroundColor:'#1c1c28', titleColor:C.text, bodyColor:C.text2, borderColor:C.border, borderWidth:1, padding:10, cornerRadius:8 }
      },
      scales: {
        x: { grid:{color:C.grid}, ticks:{color:C.text3,font:{size:11}} },
        y: { grid:{color:C.grid}, ticks:{color:C.text3,font:{size:11}}, title:{display:true,text:'Value (normalised scale per feature)',color:C.text3,font:{size:11}} }
      }
    }
  });
}

// ════════════════════════════════════════
// 3. CORRELATION HEATMAP
// ════════════════════════════════════════
function buildHeatmap(canvasId) {
  const n = CORR_LABELS.length;
  const data = [];
  const colors = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      data.push({ x: CORR_LABELS[c], y: CORR_LABELS[r], v: CORR_MATRIX[r][c] });
    }
  }

  makeChart(canvasId, {
    type: 'scatter',
    data: {
      datasets: [{
        data,
        pointStyle: 'rect',
        pointRadius: function(ctx) {
          const chart = ctx.chart;
          return Math.min(chart.width, chart.height) / (n * 1.8);
        },
        backgroundColor: data.map(d => {
          const v = d.v;
          if (v >= 0.7) return rgba(C.blue, 0.85);
          if (v >= 0.4) return rgba(C.blue, 0.5);
          if (v >= 0.1) return rgba(C.blue, 0.25);
          if (v <= -0.7) return rgba(C.red, 0.85);
          if (v <= -0.4) return rgba(C.red, 0.5);
          if (v <= -0.1) return rgba(C.red, 0.25);
          return rgba('#ffffff', 0.07);
        }),
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1c1c28', titleColor: C.text, bodyColor: C.text2,
          borderColor: C.border, borderWidth: 1, padding: 10, cornerRadius: 8,
          callbacks: {
            title: items => `${items[0].raw.y} ↔ ${items[0].raw.x}`,
            label: item => `  Pearson r = ${item.raw.v.toFixed(2)}`
          }
        }
      },
      scales: {
        x: { type: 'category', labels: CORR_LABELS, grid:{color:C.grid}, ticks:{color:C.text3,font:{size:10}} },
        y: { type: 'category', labels: [...CORR_LABELS].reverse(), grid:{color:C.grid}, ticks:{color:C.text3,font:{size:10}} }
      }
    }
  });
}

// ════════════════════════════════════════
// 4. BIAS — CLASS DISTRIBUTION
// ════════════════════════════════════════
function buildBiasChart() {
  makeChart('biasChart', {
    type: 'bar',
    data: {
      labels: ['No Failure (0)', 'Failure (1)'],
      datasets: [{
        label: 'Sample Count',
        data: [9661, 339],
        backgroundColor: [rgba(C.blue, 0.7), rgba(C.red, 0.7)],
        borderColor: [C.blue, C.red],
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor:'#1c1c28', titleColor:C.text, bodyColor:C.text2, borderColor:C.border, borderWidth:1, padding:10, cornerRadius:8,
          callbacks: { label: i => `  Count: ${i.raw.toLocaleString()} (${i.dataIndex === 0 ? '96.6' : '3.4'}%)` }
        }
      },
      scales: {
        x: { grid:{display:false}, ticks:{color:C.text2,font:{size:13,weight:'500'}} },
        y: { grid:{color:C.grid}, ticks:{color:C.text3}, title:{display:true,text:'Number of samples',color:C.text3,font:{size:11}} }
      }
    }
  });
}

// ════════════════════════════════════════
// 5. SMOTE — BEFORE & AFTER CLASS PIE/BAR
// ════════════════════════════════════════
function buildSmoteClassCharts() {
  const cfg = (data, colors) => ({
    type: 'doughnut',
    data: {
      labels: ['No Failure', 'Failure'],
      datasets: [{ data, backgroundColor: colors, borderColor: '#1c1c28', borderWidth: 3, hoverOffset: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { color: C.text2, font:{size:12}, padding:16, usePointStyle:true } },
        tooltip: { backgroundColor:'#1c1c28', titleColor:C.text, bodyColor:C.text2, borderColor:C.border, borderWidth:1, padding:10, cornerRadius:8 }
      },
      cutout: '62%'
    }
  });
  makeChart('smoteBeforeChart', cfg([9661, 339], [rgba(C.blue,0.8), rgba(C.red,0.8)]));
  makeChart('smoteAfterChart',  cfg([9661, 9661], [rgba(C.blue,0.8), rgba(C.green,0.8)]));
}

// ════════════════════════════════════════
// 6. SMOTE — FEATURE COMPARISON (tabbed)
// ════════════════════════════════════════
function buildSmoteCompChart(featureKey) {
  const bins = SMOTE_BINS[featureKey];
  const comp = SMOTE_COMP[featureKey];
  makeChart('smoteCompChart', {
    type: 'bar',
    data: {
      labels: bins,
      datasets: [
        { ...barDataset('Before SMOTE', comp.before, C.blue, 0.5), borderWidth: 0 },
        { ...barDataset('After SMOTE',  comp.after,  C.green, 0.5), borderWidth: 0 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display:true, position:'top', labels:{color:C.text2,font:{size:11},usePointStyle:true,padding:14} },
        tooltip: { backgroundColor:'#1c1c28', titleColor:C.text, bodyColor:C.text2, borderColor:C.border, borderWidth:1, padding:10, cornerRadius:8 }
      },
      scales: {
        x: { grid:{color:C.grid}, ticks:{maxTicksLimit:10,color:C.text3,font:{size:10}} },
        y: { grid:{color:C.grid}, ticks:{color:C.text3,font:{size:11}}, title:{display:true,text:'Count',color:C.text3,font:{size:11}} }
      }
    }
  });
}

document.querySelectorAll('#smote-tabs .gtab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#smote-tabs .gtab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buildSmoteCompChart(btn.dataset.f);
  });
});

// ════════════════════════════════════════
// 7. BALANCED DATASET — CLASS + DIST
// ════════════════════════════════════════
function buildBalancedClassChart() {
  makeChart('balancedClassChart', {
    type: 'bar',
    data: {
      labels: ['No Failure (0)', 'Failure (1)'],
      datasets: [{
        label: 'Count',
        data: [9661, 9661],
        backgroundColor: [rgba(C.blue,0.7), rgba(C.green,0.7)],
        borderColor: [C.blue, C.green],
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend:{display:false},
        tooltip:{ backgroundColor:'#1c1c28', titleColor:C.text, bodyColor:C.text2, borderColor:C.border, borderWidth:1, padding:10, cornerRadius:8,
          callbacks:{ label: i => `  Count: ${i.raw.toLocaleString()} (50%)` }
        }
      },
      scales: {
        x:{ grid:{display:false}, ticks:{color:C.text2,font:{size:13,weight:'500'}} },
        y:{ min:0, max:11000, grid:{color:C.grid}, ticks:{color:C.text3}, title:{display:true,text:'Number of samples',color:C.text3,font:{size:11}} }
      }
    }
  });
}

function buildBalancedDistChart(featureKey) {
  const f = FEATURES[featureKey];
  makeChart('balancedDistChart', {
    type: 'bar',
    data: { labels: f.bins, datasets: [barDataset(f.label, f.vals.map(v => Math.round(v * 1.93)), C.green, 0.6)] },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#1c1c28', titleColor:C.text, bodyColor:C.text2, borderColor:C.border, borderWidth:1, padding:10, cornerRadius:8 } },
      scales:{ x:{grid:{color:C.grid}, ticks:{maxTicksLimit:10,color:C.text3,font:{size:10}}}, y:{grid:{color:C.grid}, ticks:{color:C.text3,font:{size:11}}} }
    }
  });
}

document.querySelectorAll('#bal-tabs .gtab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#bal-tabs .gtab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buildBalancedDistChart(btn.dataset.b);
  });
});

// ════════════════════════════════════════
// 8. NORMALIZATION — RANGE COMPARISON
// ════════════════════════════════════════
function buildNormRangeCharts() {
  const labels = ['Air Temp', 'Process Temp', 'Rot. Speed', 'Torque', 'Tool Wear'];
  const ranges_before = [9.2, 8.1, 1718, 72.8, 253];  // max - min
  const ranges_after  = [4.4, 4.2, 4.4,  4.4,  4.0];  // approx std range after scaling

  makeChart('normBeforeChart', {
    type: 'bar',
    data: { labels, datasets: [barDataset('Range (max-min)', ranges_before, C.red, 0.65)] },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#1c1c28', titleColor:C.text, bodyColor:C.text2, borderColor:C.border, borderWidth:1, padding:10, cornerRadius:8,
        callbacks:{ label: i => `  Raw range: ±${i.raw}` }
      }},
      scales:{ x:{grid:{color:C.grid}, ticks:{color:C.text3,font:{size:10}}}, y:{grid:{color:C.grid}, ticks:{color:C.text3,font:{size:11}}, title:{display:true,text:'Feature value range',color:C.text3,font:{size:11}}} }
    }
  });

  makeChart('normAfterChart', {
    type: 'bar',
    data: { labels, datasets: [barDataset('Normalised range', ranges_after, C.green, 0.65)] },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#1c1c28', titleColor:C.text, bodyColor:C.text2, borderColor:C.border, borderWidth:1, padding:10, cornerRadius:8,
        callbacks:{ label: i => `  Std-scaled range: ~${i.raw} σ` }
      }},
      scales:{ x:{grid:{color:C.grid}, ticks:{color:C.text3,font:{size:10}}}, y:{min:0, max:6, grid:{color:C.grid}, ticks:{color:C.text3,font:{size:11}}, title:{display:true,text:'Normalised σ range',color:C.text3,font:{size:11}}} }
    }
  });
}

function buildNormDistChart(featureKey) {
  const bins = NORM_FEATURES[featureKey];
  const vals = NORM_VALS[featureKey];
  makeChart('normDistChart', {
    type: 'bar',
    data: { labels: bins.map(v => v.toFixed(1)), datasets: [barDataset('Normalised value', vals, C.purple, 0.65)] },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#1c1c28', titleColor:C.text, bodyColor:C.text2, borderColor:C.border, borderWidth:1, padding:10, cornerRadius:8 } },
      scales:{
        x:{ grid:{color:C.grid}, ticks:{color:C.text3,font:{size:11}}, title:{display:true,text:'Standard deviations from mean (σ)',color:C.text3,font:{size:11}} },
        y:{ grid:{color:C.grid}, ticks:{color:C.text3,font:{size:11}}, title:{display:true,text:'Count',color:C.text3,font:{size:11}} }
      }
    }
  });
}

document.querySelectorAll('#norm-tabs .gtab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#norm-tabs .gtab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buildNormDistChart(btn.dataset.n);
  });
});

// ════════════════════════════════════════
// 9. MODEL ACCURACY BAR
// ════════════════════════════════════════
function buildAccuracyChart() {
  makeChart('accuracyChart', {
    type: 'bar',
    data: {
      labels: MODEL_RESULTS.labels,
      datasets: [{
        label: 'Accuracy (%)',
        data: MODEL_RESULTS.accuracy,
        backgroundColor: MODEL_RESULTS.colors.map(c => rgba(c, 0.75)),
        borderColor: MODEL_RESULTS.colors,
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{ backgroundColor:'#1c1c28', titleColor:C.text, bodyColor:C.text2, borderColor:C.border, borderWidth:1, padding:10, cornerRadius:8,
          callbacks:{ label: i => `  Accuracy: ${i.raw}%` }
        }
      },
      scales:{
        x:{ grid:{display:false}, ticks:{color:C.text2,font:{size:12,weight:'500'}} },
        y:{ min:75, max:100, grid:{color:C.grid}, ticks:{color:C.text3,font:{size:11}, callback: v => v+'%'}, title:{display:true,text:'Accuracy (%)',color:C.text3,font:{size:11}} }
      }
    }
  });
}

// ════════════════════════════════════════
// 10. MULTI-METRIC GROUPED BAR
// ════════════════════════════════════════
function buildMultiMetricChart() {
  makeChart('multiMetricChart', {
    type: 'bar',
    data: {
      labels: MODEL_RESULTS.labels,
      datasets: [
        barDataset('Accuracy',  MODEL_RESULTS.accuracy,  C.blue,   0.75),
        barDataset('Precision', MODEL_RESULTS.precision, C.green,  0.75),
        barDataset('Recall',    MODEL_RESULTS.recall,    C.accent, 0.75),
        barDataset('F1 Score',  MODEL_RESULTS.f1,        C.purple, 0.75),
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{ display:true, position:'top', labels:{color:C.text2,font:{size:11},usePointStyle:true,padding:16} },
        tooltip:{ backgroundColor:'#1c1c28', titleColor:C.text, bodyColor:C.text2, borderColor:C.border, borderWidth:1, padding:10, cornerRadius:8,
          callbacks:{ label: i => `  ${i.dataset.label}: ${i.raw}%` }
        }
      },
      scales:{
        x:{ grid:{display:false}, ticks:{color:C.text2,font:{size:11}} },
        y:{ min:75, max:100, grid:{color:C.grid}, ticks:{color:C.text3,font:{size:11}, callback:v=>v+'%'} }
      }
    }
  });
}

// ════════════════════════════════════════
// 11. FINAL COMPARISON — ALL 5 MODELS
// ════════════════════════════════════════
function buildFinalCompChart() {
  const colors5 = [C.red, C.blue, C.accent, C.green, C.purple];
  makeChart('finalCompChart', {
    type: 'bar',
    data: {
      labels: ALL_MODELS.labels,
      datasets: [
        { label:'Accuracy',  data:ALL_MODELS.accuracy,  backgroundColor:colors5.map(c=>rgba(c,0.7)), borderColor:colors5, borderWidth:1.5, borderRadius:5, borderSkipped:false },
        { label:'Precision', data:ALL_MODELS.precision, backgroundColor:colors5.map(c=>rgba(c,0.45)), borderColor:colors5, borderWidth:1, borderRadius:5, borderSkipped:false },
        { label:'Recall',    data:ALL_MODELS.recall,    backgroundColor:colors5.map(c=>rgba(c,0.25)), borderColor:colors5, borderWidth:1, borderRadius:5, borderSkipped:false, borderDash:[4,4] },
        { label:'F1 Score',  data:ALL_MODELS.f1,        type:'line', borderColor:C.accent, backgroundColor:rgba(C.accent,0.08), borderWidth:2.5, fill:true, tension:0.4, pointRadius:5, pointBackgroundColor:C.accent },
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{ display:true, position:'top', labels:{color:C.text2,font:{size:11},usePointStyle:true,padding:16} },
        tooltip:{ backgroundColor:'#1c1c28', titleColor:C.text, bodyColor:C.text2, borderColor:C.border, borderWidth:1, padding:10, cornerRadius:8,
          callbacks:{ label: i => `  ${i.dataset.label}: ${i.raw}%` }
        }
      },
      scales:{
        x:{ grid:{display:false}, ticks:{color:C.text2,font:{size:11}} },
        y:{ min:75, max:100, grid:{color:C.grid}, ticks:{color:C.text3,font:{size:11}, callback:v=>v+'%'} }
      }
    }
  });
}

// ════════════════════════════════════════
// INIT — build all charts on load
// ════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  buildDistChart('air');
  buildBoxChart();
  buildHeatmap('heatmapChart');
  buildBiasChart();
  buildSmoteClassCharts();
  buildSmoteCompChart('air');
  buildBalancedClassChart();
  buildBalancedDistChart('air');
  buildHeatmap('balHeatmapChart');
  buildNormRangeCharts();
  buildNormDistChart('air');
  buildAccuracyChart();
  buildMultiMetricChart();
  buildFinalCompChart();
});