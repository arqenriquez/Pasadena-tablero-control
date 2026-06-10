# Caseta de acceso Pasadena · Tablero de Control

Tablero de control de la obra **Caseta de acceso Pasadena**, gerencia de Metta Arquitectura y Construcción. Toda la personalización vive en `data/proyecto.json` y la carpeta `assets/` — no se toca HTML ni JavaScript.

Sitio web **estático** (HTML + CSS + JavaScript vanilla, sin frameworks ni backend). Pensado para publicarse en **GitHub Pages** y actualizarse semana a semana editando archivos de datos.

**Estado:** semana 08 de 18 · inicio 13/abr/2026 · término 10/ago/2026.

**Módulos activos en esta etapa:** Resumen General · Programa de Obra · Reportes Semanales.
Bitácora, Checklist y Galería quedan pendientes para sesiones posteriores.

> 👉 **¿Qué cargar?** Lee [`INSTRUCCIONES-CARGA.txt`](INSTRUCCIONES-CARGA.txt) — los 3 espacios listos (hero, programa de obra, reporte semanal).
>
> Para el detalle del flujo de actualización semanal, lee [`MANUAL-ACTUALIZACION.md`](MANUAL-ACTUALIZACION.md).

---

## 📁 Estructura del proyecto

```
07. PLANTILLA - TABLERO DE OBRA/
├── index.html                Página principal: hero + 6 módulos
├── resumen.html              Módulo 01 · Resumen general global
├── programa.html             Módulo 02 · Programa de obra (Gantt)
├── reportes.html             Módulo 03 · Índice de reportes semanales
├── semana.html               Plantilla de reporte semanal (?num=XX)
├── bitacora.html             Módulo 04 · Índice de bitácora
├── bitacora-nota.html        Detalle de una nota de bitácora (?id=XXX)
├── checklist.html            Módulo 05 · Checklist de calidad
├── galeria.html              Módulo 06 · Galería fotográfica
│
├── css/
│   ├── styles.css            Sistema de diseño compartido (verde + dorado)
│   └── gantt.css             Estilos exclusivos del Programa de Obra
│
├── js/
│   ├── branding.js           Inyecta nombre/logo del cliente en todas las páginas
│   ├── shell.js              Lógica de index.html
│   ├── resumen.js            Lógica del resumen global
│   ├── reportes.js           Índice de reportes
│   ├── reporte.js            Reporte semanal individual
│   ├── gantt.js              Visualizador de Gantt (parser de XML de MS Project)
│   ├── bitacora.js           Listado y detalle de bitácora
│   ├── checklist.js          Repositorio de checklists (digitaliza .xlsx con SheetJS)
│   └── galeria.js            Galería con filtros
│
├── data/
│   ├── proyecto.json         Datos base del proyecto (hero, fechas, contrato)
│   ├── programa.xml          Export de MS Project (reemplazable cada semana)
│   ├── reportes/
│   │   ├── index.json        Lista de semanas publicadas
│   │   ├── semana-01.json    Datos del reporte de la semana 01
│   │   └── _plantilla-semana.json
│   ├── bitacora/
│   │   ├── index.json        Lista de notas publicadas
│   │   ├── nota-001.json     Datos de la nota 001
│   │   └── _plantilla-nota.json
│   ├── checklist/
│   │   ├── index.json        Catálogo de checklists
│   │   └── *.xlsx            Tus formatos de Excel
│   └── galeria.json          Catálogo de fotos con sus etiquetas
│
├── fotos/
│   ├── reportes/             Fotos de los reportes semanales (por semana/lote)
│   ├── bitacora/             Imágenes de la bitácora física
│   └── galeria/              Imágenes de la galería
│
├── assets/                   Logos (coloca aquí logo-cliente.png y hero-cliente.jpg)
├── README.md                 Este archivo
└── MANUAL-ACTUALIZACION.md   Guía paso a paso para actualizar cada módulo
```

---

## 🚀 Cómo verlo en tu computadora (VS Code)

El sitio carga archivos JSON/XML con `fetch()`, que **no funciona** abriendo el HTML con doble clic (`file://`). Necesitas un servidor local:

1. Abre la carpeta del proyecto en **Visual Studio Code**.
2. Instala la extensión **Live Server** (de Ritwick Dey).
3. Click derecho en `index.html` → **"Open with Live Server"**.
4. Se abre en el navegador en `http://127.0.0.1:5500/` y ya carga todo correctamente.

---

## 🌐 Publicar en GitHub Pages

1. Crea un repositorio en GitHub (recomendado nombrarlo `tablero-<cliente>`, ej. `tablero-rosetta`).
2. Sube todos los archivos de la carpeta del cliente al repo.
3. En **Settings → Pages**: rama `main`, carpeta `/ (root)`.
4. Espera 1-2 minutos. La URL será `https://tuusuario.github.io/tablero-<cliente>/`.

---

## 🔄 Actualización semanal

Todo el contenido vive en la carpeta `data/` y `fotos/`. Para actualizar el tablero **no se toca código**: solo se editan archivos de datos y se sube un commit. Ver **MANUAL-ACTUALIZACION.md** para el paso a paso de cada módulo.

---

## 🎨 Identidad visual

- **Colores:** fondos blancos con tinte azul muy claro, acento **azul cielo `#5a9bd4`** (branding Metta) y dorado claro `#d4b876` como secundario. Se editan en `css/styles.css`.
- **Tipografía:** Poppins (títulos), Inter (texto), JetBrains Mono (números).

---

Metta Arquitectura y Construcción · Gerencia de Proyecto · Hermosillo, Sonora
