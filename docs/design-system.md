# Sistema de Diseño «Living» · Dados & Bocados

Especificación visual, tokens, componentes y arquitectura de navegación de la interfaz empresarial de **Dados & Bocados** (Cafetería de Especialidad + Ludoteca de Juegos de Mesa en Perú).

---

## 1. Principios de Diseño

1. **Claridad Inmediata**: El empleado en tablet en mostrador debe entender el estado del negocio sin adivinar.
2. **Navegación Centrada sin Sidebar**: Se elimina todo sidebar lateral o menú de esquina. El flujo es:
   $$\text{Login} \longrightarrow \text{Inicio Centrado (Hub)} \longrightarrow \text{Módulo (con Píldora Superior)}$$
3. **Vocabulario Unificado**:
   - `Ingrediente`: materia prima en almacén (no "insumo").
   - `Existencias` o `Stock`: inventario actual.
   - `Reposición`: punto mínimo o lista de compra para reabastecer.
   - `Receta`: ficha técnica de preparación y escandallo.
   - `Producto`: ítem publicado para venta al cliente.
4. **Numerales Limpios**:
   - Los números en títulos de *Cormorant Garamond* usan `font-variant-numeric: lining-nums`.
   - Nombres de tarjetas (ej. *Mesa 01*), tablas, precios en Soles y stock se muestran estrictamente en **DM Sans** con `tabular-nums` mediante la clase `.numeral-clean`.
5. **Moneda Oficial**: Siempre formateada en Soles con espacio tras el símbolo: `S/ 1,250.00`.
6. **Jerarquía de Acciones**: Máximo **UN** botón primario (`ink` sólido oscuro) por pantalla. El resto de acciones son secundarias (`bg-black/5`) o fantasma.

---

## 2. Paleta de Tokens (Variables CSS)

```css
:root {
  /* Fondos y Textos */
  --bg: oklch(98% 0.01 240);          /* Superficie clara base */
  --ink: oklch(15% 0.02 240);         /* #1a1b21 - Texto principal y botón primario */
  --ink-soft: oklch(40% 0.02 240);    /* #555869 - Texto secundario y etiquetas */
  
  /* Acentos Naturales */
  --moss: oklch(88% 0.1 150);         /* Fondo claro de realce */
  --moss-deep: oklch(42% 0.1 150);    /* Verde musgo - Éxito, confirmación y enlaces */

  /* Estados Semánticos */
  --status-ok: var(--moss-deep);
  --status-warn: #b45309;             /* Nivel bajo / Advertencia */
  --status-error: #b91c1c;            /* Agotado / Urgente */
}
```

---

## 3. Escala Tipográfica y Espaciado

- **Hero Saludo**: `36px – 48px` (*Cormorant Garamond*, blanco con contraste AA).
- **Título de Página (Módulo)**: `30px – 36px` (*Cormorant Garamond 600*).
- **Subtítulo / Sección**: `20px – 24px`.
- **Nombres de Tarjeta**: `16px – 18px` (*DM Sans 600* con `.numeral-clean`).
- **Texto Base**: `14px – 15px`.
- **Texto Secundario**: `12px – 13px`.
- **Eyebrow**: `11px – 12px` (mayúsculas, tracking `0.16em`).
- **Espaciados**: Escala de `4px / 8px / 16px / 24px / 48px`. Tarjetas con padding de `20px – 24px` y radio de borde de `24px` (`rounded-3xl`).

---

## 4. Estructura Estándar de Módulo

Cada uno de los módulos de la aplicación respeta la siguiente jerarquía visual:

```tsx
<div className="flex flex-col gap-6 pb-12">
  {/* 1. PageHeader Alineado a la Izquierda */}
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
    <div>
      <span className="eyebrow">{GRUPO_DEL_MODULO}</span>
      <h1 className="text-3xl font-bold font-cormorant text-[#1a1b21] mt-1">{TITULO}</h1>
      <p className="text-sm text-[#555869] mt-0.5">{DESCRIPCION_UNA_LINEA}</p>
    </div>
    {/* Máximo UN botón primario ink */}
    <div className="flex items-center gap-2">
      <button className="bg-[#1a1b21] text-white rounded-full px-4 py-2 text-xs font-bold ...">
        {ACCION_PRIMARIA}
      </button>
    </div>
  </div>

  {/* 2. Pestañas de Subsección (si aplica) */}
  <div className="flex bg-black/5 p-1 rounded-full border border-black/8 w-fit gap-1">
    {/* Tabs con fondo #1a1b21 al activarse */}
  </div>

  {/* 3. Indicadores Clave de Desempeño (KPIs) */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {/* Tarjetas informativas con cifras tabulares */}
  </div>

  {/* 4. Barra de Herramientas Estándar */}
  <div className="flex items-center justify-between gap-3 flex-wrap">
    {/* Buscador + Selectores de Filtro + Acciones Masivas */}
  </div>

  {/* 5. Contenido Principal */}
  {/* Tablas con .living-table o Cuadrículas en living-card */}

  {/* 6. Estados Vacíos con Llamado a la Acción Siguiente */}
</div>
```

---

## 5. Secuencia Profesional en Inicio

El menú principal organiza las funciones operativas en las **4 etapas reales del negocio**:

1. **1. ABASTECER**:
   - `Ingredientes` (Existencias, reposición y almacén).
   - `Alertas de Stock` (Generador de listas de compra sugerida).
2. **2. PREPARAR**:
   - `Recetas y Cocina` (Escandallos y cálculo CTU = CV + CF: S/ 1.80).
3. **3. VENDER**:
   - `Catálogo de Venta` (Productos listos para vender con checklist).
   - `Ventas y Caja (POS)` (Comandas, facturación y medios de pago).
   - `Mesas y Ludoteca` (Partidas activas, cronómetros y consumos).
4. **4. CONTROLAR**:
   - `Resumen Diario` (Cierre y cifras del día).
   - `Costos y Finanzas` (Costos fijos mensuales y estructura de socios).
   - `Reportes` (Analítica de facturación y rotación de títulos).

*(Configuración se ubica como fila de ajustes al pie).*

---

## 6. Reglas de Accesibilidad y Responsive

- **Blancos sobre video**: Viñeta y degradado superior de `black/75` a `black/55` para garantizar ratio de contraste $> 4.5:1$ (WCAG AA).
- **Objetivos Táctiles**: Todos los botones y selectores tienen altura $\ge 40\text{px}$ (óptimo para tablet de mostrador).
- **Teclado**: Atajos `Ctrl + K` para la paleta de comandos global, `Escape` para cerrar menús y modales.
- **Grids Fluidos**: `4` columnas en escritorio $\ge 1280\text{px}$, `2` columnas en tablet $\ge 768\text{px}$ y `1` columna en smartphone.
