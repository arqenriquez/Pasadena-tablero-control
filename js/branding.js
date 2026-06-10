/* ============================================================
   PLANTILLA · BRANDING DINÁMICO
   Se carga en TODAS las páginas. Lee data/proyecto.json y
   rellena los elementos comunes (title, meta, footer, etc.)
   para que NO haya texto del cliente hardcodeado en HTML.

   Cómo lo usa el HTML:
   - <body data-section="Resumen General"> → título = "Cliente · Resumen General | Metta"
   - <span data-brand-cliente>            → texto = nombre_corto del cliente
   - <span data-brand-gerencia>           → texto = gerencia (ej. "Metta...")
   - <span data-brand-ubicacion>          → texto = ubicación
   ============================================================ */
(async function () {
  try {
    const resp = await fetch('data/proyecto.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!resp.ok) return;
    const json = await resp.json();
    const p = json.proyecto || {};
    const cliente = p.nombre_corto || p.nombre || 'Proyecto';
    const gerencia = p.gerencia || 'Metta Arquitectura y Construcción';
    const gerenciaCorta = gerencia.split(' ')[0] || 'Metta';
    const ubicacion = p.ubicacion || '';

    // Título dinámico: si <body data-section="X"> existe, usa "Cliente · X | Metta"
    const seccion = document.body && document.body.dataset.section;
    if (seccion) {
      document.title = `${cliente} · ${seccion} | ${gerenciaCorta}`;
    }

    // Meta description: reemplaza __CLIENTE__ si lo trae el HTML
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && metaDesc.content.includes('__CLIENTE__')) {
      metaDesc.content = metaDesc.content.replace(/__CLIENTE__/g, cliente);
    }

    // Elementos parametrizables vía data-attributes
    document.querySelectorAll('[data-brand-cliente]').forEach(el => { el.textContent = cliente; });
    document.querySelectorAll('[data-brand-gerencia]').forEach(el => { el.textContent = gerencia; });
    document.querySelectorAll('[data-brand-ubicacion]').forEach(el => { el.textContent = ubicacion; });

    // Alt de logos del cliente
    document.querySelectorAll('img[src*="logo-cliente"]').forEach(img => { img.alt = cliente; });
  } catch (e) {
    console.warn('branding.js: no se pudo cargar data/proyecto.json —', e.message);
  }
})();
