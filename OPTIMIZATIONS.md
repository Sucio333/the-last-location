# Optimizaciones de rendimiento para iOS/Android (2026-07-28)

## Problema diagnosticado
Rendimiento lento en Safari iOS y navegadores Android móviles, especialmente con:
- WebGL shader con múltiples llamadas a FBM (Fractal Brownian Motion)
- Filtro SVG `electric-border` animado con `feTurbulence` + `feDisplacementMap`
- Video heximage con blend modes + filtros CSS

## Optimizaciones aplicadas

### 1. ✅ CRÍTICA — Simplificar y reducir electric-border en mobile

**Archivos modificados:** `templates/index.html`, `static/css/style.css`

**Cambios:**

#### index.html
- Reducido `numOctaves` de 2 a 1 en `<feTurbulence>` (reduce complejidad del shader SVG)
- Aumentado `dur` de 2.5s a 4.5s (animación más lenta = menos operaciones de ruido por segundo)
- Añadido detector temprano de dispositivos touch que aplica clase `is-touch` a `<html>` y `<body>`

**Rationale:** Safari iOS es notoriamente lento con `feTurbulence` animado. Menos octavas = menos iteraciones de ruido Perlin. Animación más lenta reduce la frecuencia de recálculo del filtro.

#### style.css
- **Título grande (.gooey-wrapper) en mobile:** Eliminado `url(#electric-border)`, manteniendo solo `url(#gooey)` filter + `drop-shadow`
- **Elementos pequeños:** Badge EN VIVO, logo, circular-text **conservan** `electric-border` optimizado (menos costoso en elementos chicos)
- Añadido media query como respaldo para navegadores que no soporten la clase `is-touch`

**Rationale:** El título es el elemento más grande (~200px ancho, puede ser ~5rem alto). Aplicar un filtro SVG animado a un elemento tan grande es prohibitivamente costoso en iOS Safari. Los elementos pequeños (badge ~60px) tienen mejor relación costo-beneficio.

**Impacto esperado:** 
- iOS Safari: Reducción de 40-60% de GPU overhead en el título
- Android Chrome/Samsung Internet: Mejora de fluidez general
- Experencia visual: Título mantiene suavidad (gooey effect), sin distorsión eléctrica animada

---

### 2. ✅ ALTO — Reducir resolución interna del shader

**Archivo modificado:** `static/js/shader.js`

**Cambios:**

- **renderScale:** Reducido de `0.65` a `0.45` en mobile normal
  - Dispositivos gama baja (≤2 núcleos CPU) usan `0.3`
  - Desktop mantiene `1.0`
  
- **max_iter en FBM (Fractal Brownian Motion):**
  - Mobile: Reducido de `3` a `2` iteraciones
  - Desktop: Mantiene `6` iteraciones

- **Detección de hardware:**
  - Usa `navigator.hardwareConcurrency` para detectar pocos núcleos de CPU
  - Aplica reducción más agresiva en móviles de entrada (ej. Android Snapdragon 680, etc.)

**Rationale:**
- Reducir `renderScale` de 0.65 a 0.45 disminuye píxeles procesados de 139K a ~62K en iPhone 13
- Cada FBM hace 5 llamadas por píxel + múltiples iteraciones = operación intensiva
- Reducir `max_iter` de 3 a 2 es cambio seguro visualmente (el ruido mantiene coherencia)

**Impacto esperado:**
- iPhone 13: ~55% menos píxeles = ~55% menos operaciones GPU
- Android gama baja: ~60% menos píxeles con renderScale 0.3
- Desktop: Sin cambios (sigue optimizado con 1.75 DPR)

---

## Resumen técnico

| Componente | Antes | Después | Impacto |
|---|---|---|---|
| **SVG filter numOctaves** | 2 | 1 | Menos iteraciones de ruido |
| **SVG filter animation dur** | 2.5s | 4.5s | Menos recálculos por segundo |
| **Título (gooey-wrapper) en mobile** | `gooey` + `electric-border` | Solo `gooey` | GPU overhead -40-60% |
| **Shader renderScale (mobile)** | 0.65 | 0.45 (0.3 gama baja) | Píxeles -31% (55% gama baja) |
| **FBM iterations (mobile)** | 3 | 2 | Operaciones -33% |
| **Visual quality** | Inalterado | ✓ Suave + ligeramente menos distorsión eléctrica | Aceptable |

---

## Testing recomendado

1. **iPhone 13 (Safari):** Verificar fluidez del fondo shader, título sin parpadeos
2. **iPhone 11 (Safari):** Mismo test, ver si diferencia es notable respecto a iPhone 13
3. **Android Pixel 8 (Chrome):** Verificar rendimiento con GPU potente
4. **Android bajo rango (ej. Moto G9, Samsung A12):** Verificar con renderScale 0.3, sin lag
5. **Desktop (Chrome/Firefox):** Confirmar que desktop sigue igual de bonito (sin cambios en renderScale > 1)

---

## Notas futuras

- Si el rendimiento sigue siendo lento en iPhone, considerar:
  - Deshabilitar video heximage por completo en iOS
  - Reducir aún más `renderScale` a 0.35 en mobile (está en el límite visual)
  - Usar Canvas 2D en lugar de WebGL en dispositivos muy lentos (fallback)

- Las detecciones están basadas en **touch pointer** (`pointer: coarse`), NO en user-agent
  - Aplica a cualquier dispositivo touch (iPhone, iPad, Android, tablets)
  - Evita false positives de laptops con touchscreen
