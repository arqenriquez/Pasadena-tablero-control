/* ============================================================
   ALTOZANO · TABLERO · Lógica del reporte semanal
   Carga data/reportes/semana-XX.json según ?num=XX y lo renderiza
   ============================================================ */

const $ = (sel) => document.querySelector(sel);
const fmt = (n, d = 2) => Number(n).toFixed(d);
const fmtMoney = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tieneMonto = (data) => data && data.curva_financiera && data.curva_financiera.valor_total_mxn > 0;

function obtenerNumSemana() {
  const num = new URLSearchParams(window.location.search).get('num');
  return num ? num.padStart(2, '0') : null;
}

async function cargarReporte(numSemana) {
  try {
    const resp = await fetch(`data/reportes/semana-${numSemana}.json?t=${Date.now()}`, { cache: 'no-cache' });
    if (!resp.ok) throw new Error('Reporte no encontrado');
    return await resp.json();
  } catch (e) {
    console.error('Error cargando reporte:', e);
    return null;
  }
}

function renderHero(data) {
  $('#hero-semana-num').textContent = data.semana.numero;
  $('#hero-proyecto').textContent = data.proyecto.nombre;
  $('#hero-ubicacion').textContent = data.proyecto.ubicacion;
  $('#hero-gerencia').textContent = data.proyecto.gerencia;
  $('#hero-periodo').textContent = data.semana.periodo;
  document.title = `${data.proyecto.nombre_corto} · Semana ${data.semana.numero} | Metta`;
}

function renderKPIs(data) {
  const g = data.avance_global;
  $('#kpi-programado').dataset.target = g.programado_pct;
  $('#kpi-real').dataset.target = g.real_pct;
  $('#kpi-variacion').dataset.target = Math.abs(g.variacion_pct);

  if (tieneMonto(data)) {
    $('#kpi-programado-money').textContent = fmtMoney(g.programado_mxn) + ' MXN';
    $('#kpi-real-money').textContent = fmtMoney(g.real_mxn) + ' MXN';
    const diff = g.real_mxn - g.programado_mxn;
    $('#kpi-variacion-money').textContent = fmtMoney(Math.abs(diff)) + (diff >= 0 ? ' adelanto' : ' atraso');
  } else {
    $('#kpi-programado-money').textContent = 'Avance físico';
    $('#kpi-real-money').textContent = 'Avance físico';
    $('#kpi-variacion-money').textContent = g.variacion_pct >= 0 ? 'Adelanto sobre programa' : 'Atraso respecto a programa';
  }

  const varParent = $('#kpi-variacion').parentElement;
  varParent.classList.remove('positive', 'negative');
  varParent.classList.add(g.variacion_pct >= 0 ? 'positive' : 'negative');

  const realParent = $('#kpi-real').parentElement;
  realParent.classList.remove('positive', 'negative');
  if (g.variacion_pct > 0) realParent.classList.add('positive');
  if (g.variacion_pct < 0) realParent.classList.add('negative');

  $('#kpi-variacion-sign').textContent = g.variacion_pct >= 0 ? '+' : '-';
}

function renderActividades(data) {
  const semActual = data.semana.numero;
  const semSig = String(parseInt(semActual) + 1).padStart(2, '0');
  $('#act-realizadas-sub').textContent = `Semana ${semActual}`;
  $('#act-programadas-sub').textContent = `Semana ${semSig}`;

  $('#act-realizadas-list').innerHTML = data.actividades.realizadas.length
    ? data.actividades.realizadas.map(a => `<li>${a}</li>`).join('')
    : '<li style="color:var(--ink-mute);font-style:italic">Sin actividades registradas</li>';
  $('#act-programadas-list').innerHTML = data.actividades.programadas.length
    ? data.actividades.programadas.map(a => `<li>${a}</li>`).join('')
    : '<li style="color:var(--ink-mute);font-style:italic">Sin actividades programadas</li>';
}

function renderProblemas(data) {
  const tbody = $('#problemas-tbody');
  if (!data.problemas || !data.problemas.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--ink-mute);font-style:italic;padding:2rem">Sin problemas críticos registrados esta semana</td></tr>';
    return;
  }
  tbody.innerHTML = data.problemas.map(p => {
    const statusClass = p.estatus.toLowerCase().includes('observ') ? 'status-observado' : 'status-tramitado';
    return `<tr>
      <td>${p.descripcion}</td>
      <td><span class="status-badge ${statusClass}">${p.estatus}</span></td>
      <td class="mono">${p.fecha_limite || '—'}</td>
      <td>${p.responsable}</td>
    </tr>`;
  }).join('');
}

function renderAvancePartidas(data) {
  const lista = $('#partidas-list');
  lista.innerHTML = '';
  const orden = data.orden_partidas || Object.keys(data.partidas || {});
  if (!orden.length) {
    lista.innerHTML = '<div class="empty-state"><p>Sin datos de partidas en este reporte.</p></div>';
    return;
  }
  orden.forEach(key => {
    const d = data.partidas[key];
    if (!d) return;
    const varClass = d.variacion >= 0 ? 'pos' : 'neg';
    const varSign = d.variacion >= 0 ? '+' : '';
    const estado = d.real >= 100 ? 'Concluida' : (d.real > 0 ? 'En proceso' : 'Sin iniciar');
    const card = document.createElement('div');
    card.className = 'lote-card fade-up';
    card.innerHTML = `
      <div class="lote-identity">
        <div class="name">${d.nombre}</div>
        <div class="modelo">${estado}</div>
      </div>
      <div class="bars-stack">
        <div class="bar-row">
          <span class="bar-tag">Programado</span>
          <div class="bar-container"><div class="bar-fill prog" data-width="${d.programado}"></div></div>
          <span class="bar-value">${fmt(d.programado)}%</span>
        </div>
        <div class="bar-row">
          <span class="bar-tag">Real</span>
          <div class="bar-container"><div class="bar-fill real" data-width="${d.real}"></div></div>
          <span class="bar-value">${fmt(d.real)}%</span>
        </div>
      </div>
      <div class="variation-pill">
        <div class="lbl">Variación</div>
        <div class="val ${varClass}">${varSign}${fmt(d.variacion)}%</div>
      </div>
    `;
    lista.appendChild(card);
  });
}

function renderGraficas(data) {
  const g = data.avance_global;
  const cf = data.curva_financiera;

  $('#dona-programado').textContent = fmt(g.programado_pct) + '%';
  $('#dona-real').textContent = fmt(g.real_pct) + '%';
  const varSign = g.variacion_pct >= 0 ? '+' : '';
  const adelantoEl = $('#dona-adelanto');
  adelantoEl.textContent = `${varSign}${fmt(g.variacion_pct)}%`;
  adelantoEl.classList.remove('green', 'negative');
  adelantoEl.classList.add(g.variacion_pct >= 0 ? 'green' : 'negative');

  const totalSemanas = cf.programado.length - 1;
  $('#curvaS-sub').textContent = tieneMonto(data)
    ? `${totalSemanas} semanas · ${fmtMoney(cf.valor_total_mxn)} MXN`
    : `${totalSemanas} semanas · avance físico %`;
  $('#dona-sub').textContent = `Semana ${data.semana.numero} de ${totalSemanas}`;

  const labels = ['Inicio', ...Array.from({ length: totalSemanas }, (_, i) => `S${i + 1}`)];

  new Chart($('#curvaS').getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Programado', data: cf.programado, borderColor: '#232726', backgroundColor: 'rgba(35,39,38,0.05)', borderWidth: 2, tension: 0.35, fill: true, pointRadius: 0, pointHoverRadius: 5 },
        { label: 'Real', data: cf.real, borderColor: '#5a9bd4', backgroundColor: 'transparent', borderWidth: 2.5, tension: 0.3, fill: false, pointRadius: 4, pointBackgroundColor: '#5a9bd4' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', align: 'end', labels: { font: { family: 'Inter', size: 11, weight: '500' }, boxWidth: 10, boxHeight: 10, usePointStyle: true, color: '#4a4f4d' } },
        tooltip: { backgroundColor: '#232726', titleFont: { family: 'Inter', size: 12, weight: '600' }, bodyFont: { family: 'JetBrains Mono', size: 11 }, padding: 10, cornerRadius: 8,
          callbacks: { label: (ctx) => ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(2) + '%' } }
      },
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + '%', font: { family: 'JetBrains Mono', size: 10 }, color: '#8a8f8c' }, grid: { color: '#f0efeb' } },
        x: { ticks: { font: { family: 'JetBrains Mono', size: 9 }, color: '#8a8f8c', maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }, grid: { display: false } }
      }
    }
  });

  new Chart($('#donaChart').getContext('2d'), {
    type: 'doughnut',
    data: { labels: ['Ejecutado', 'Por ejecutar'], datasets: [{ data: [g.real_pct, Math.max(0, 100 - g.real_pct)], backgroundColor: ['#5a9bd4', '#e2e7ee'], borderWidth: 0, cutout: '78%' }] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false },
        tooltip: { backgroundColor: '#232726', padding: 10, cornerRadius: 8, callbacks: { label: (ctx) => ctx.label + ': ' + ctx.parsed.toFixed(2) + '%' } } } }
  });
}

function renderAbastecimientos(data) {
  const tbody = $('#abast-tbody');
  const semActual = data.semana.numero;
  const semPrev = String(parseInt(semActual) - 1).padStart(2, '0');
  tbody.innerHTML = '';

  const statusClass = (s) => {
    const l = s.toLowerCase();
    if (l.includes('suministrado')) return 'status-sum';
    if (l.includes('proceso')) return 'status-proc';
    return 'status-sol';
  };
  const impClass = (i) => {
    const l = (i || '').toLowerCase();
    if (l === 'alta') return 'importance-alta';
    if (l === 'media') return 'importance-media';
    return 'importance-baja';
  };

  const ab = data.abastecimientos || {};
  if (ab.entregados && ab.entregados.length) {
    tbody.innerHTML += `<tr><td colspan="4" class="abast-subheader">Semana ${semPrev} · Entregados</td></tr>`;
    tbody.innerHTML += `<tr><th>Concepto</th><th>Fecha requerida</th><th>Estatus</th><th>Importancia</th></tr>`;
    ab.entregados.forEach(a => {
      tbody.innerHTML += `<tr>
        <td>${a.concepto}</td>
        <td class="mono">${a.fecha_requerida}</td>
        <td><span class="${statusClass(a.estatus)}">${a.estatus}</span></td>
        <td class="${impClass(a.importancia)}">${a.importancia}</td>
      </tr>`;
    });
  }
  if (ab.programados && ab.programados.length) {
    tbody.innerHTML += `<tr><td colspan="4" class="abast-subheader">Programados para siguientes semanas</td></tr>`;
    tbody.innerHTML += `<tr><th>Concepto</th><th>Fecha requerida</th><th>Estatus</th><th>Importancia</th></tr>`;
    ab.programados.forEach(a => {
      tbody.innerHTML += `<tr>
        <td>${a.concepto}</td>
        <td class="mono">${a.fecha_requerida}</td>
        <td><span class="${statusClass(a.estatus)}">${a.estatus}</span></td>
        <td class="${impClass(a.importancia)}">${a.importancia}</td>
      </tr>`;
    });
  }
  if (!tbody.innerHTML) {
    tbody.innerHTML = '<tr><td style="text-align:center;color:var(--ink-mute);font-style:italic;padding:2rem">Sin abastecimientos registrados</td></tr>';
  }
}

/* Nota: el detalle interactivo por lote (panel lateral + galería/lightbox de
   fotos) se removió en esta versión por partidas de la caseta. */

function configurarAnimaciones() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.querySelectorAll('.bar-fill').forEach(bar => {
          setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 150);
        });
        entry.target.querySelectorAll('.counter').forEach(el => {
          if (el.dataset.animated) return;
          el.dataset.animated = 'true';
          const target = parseFloat(el.dataset.target);
          const decimals = parseInt(el.dataset.decimals || '2');
          const start = performance.now();
          const animate = (now) => {
            const t = Math.min((now - start) / 1400, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = (target * eased).toFixed(decimals);
            if (t < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        });
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
}

async function init() {
  const num = obtenerNumSemana();
  if (!num) {
    document.body.innerHTML = '<div class="loading">Parámetro ?num= no especificado. Redirigiendo...</div>';
    setTimeout(() => { window.location.href = 'reportes.html'; }, 1500);
    return;
  }

  const data = await cargarReporte(num);
  if (!data) {
    document.body.innerHTML = `
      <div class="loading" style="flex-direction:column;gap:1rem;padding:6rem 2rem">
        <div style="font-size:2rem">📄</div>
        <div>No se encontró el reporte de la semana ${num}</div>
        <a href="reportes.html" style="color:var(--accent);text-decoration:none;font-weight:600">← Volver al índice</a>
      </div>`;
    return;
  }

  renderHero(data);
  renderKPIs(data);
  renderActividades(data);
  renderProblemas(data);
  renderAvancePartidas(data);
  renderGraficas(data);
  renderAbastecimientos(data);
  configurarAnimaciones();

  $('#footer-info').textContent = `Reporte Semana ${data.semana.numero} · ${data.proyecto.nombre_corto} · Generado ${data.semana.fecha_generacion || ''}`;
}

document.addEventListener('DOMContentLoaded', init);
