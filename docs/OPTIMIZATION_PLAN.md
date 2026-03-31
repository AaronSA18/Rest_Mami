# Plan de Optimización de Rendimiento - Rest_Mami

## 📊 Resumen del Análisis

Este documento detalla el plan de optimización basado en el informe de Lighthouse proporcionado.

---

## 🔴 Problemas Identificados y Soluciones

### 1. Optimización de Imágenes (Impacto: ~588 KiB)

**Problema:**

- Las imágenes son 1024x479 pero se muestran en 278x278
- Sin compresión óptima WebP
- Sin atributo `srcset` para imágenes responsivas

**Ejemplo del informe:**
| Imagen | Tamaño Actual | Dimensiones Mostradas | Ahorro |
|--------|--------------|----------------------|--------|
| Pechodepollo.webp | 113.7 KiB | 278x278 | 101.1 KiB |
| H_mixta.webp | 113.4 KiB | 278x278 | 100.8 KiB |
| H_pollo.webp | 109.4 KiB | 278x278 | 96.8 KiB |

**Solución Propuesta:**

1. Crear versiones de imágenes en múltiples tamaños:
   - 278x278 (tamaño de visualización)
   - 400x400 (para pantallas retina)
   - 150x150 (miniaturas)
2. Implementar `srcset` en el HTML generado por [`carousel.js`](assets/js/modules/carousel.js:91)
3. Optimizar compresión WebP

**Código propuesto para carousel.js:**

```javascript
// Generar srcset para diferentes tamaños
const srcset = `
    ${imagePath.replace(".webp", "-278.webp")} 278w,
    ${imagePath.replace(".webp", "-400.webp")} 400w,
    ${imagePath} 1024w
`;
const sizes = "(max-width: 768px) 150px, 278px";
```

---

### 2. CSS No Utilizado (Impacto: ~12 KiB)

**Problema:**

- [`cart.css`](assets/css/components/cart.css) se carga siempre pero solo se usa en la sección de pedido
- La sección de pedido no es visible inicialmente

**Solución Propuesta:**

1. Cargar [`cart.css`](assets/css/components/cart.css) dinámicamente solo cuando se muestre el formulario de checkout
2. Modificar [`main.css`](assets/css/main.css:14) para no importar cart.css estáticamente

**Implementación:**

```javascript
// En navigation.js o cart.js
function loadCartStyles() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "assets/css/components/cart.css";
  document.head.appendChild(link);
}
```

---

### 3. CSS No Minificado (Impacto: ~11 KiB)

**Problema:**
| Archivo | Tamaño | Ahorro |
|---------|--------|--------|
| responsive.css | 14.8 KiB | 5.8 KiB |
| cart.css | 12.8 KiB | 3.3 KiB |
| header.css | 8.2 KiB | 2.2 KiB |

**Solución Propuesta:**

1. Minificar todos los archivos CSS
2. Crear versión minificada de [`main.css`](assets/css/main.css)
3. Actualizar referencias en [`index.html`](index.html:49)

---

### 4. Trabajo en Hilo Principal (5.4s)

**Distribución del tiempo:**
| Categoría | Tiempo |
|-----------|--------|
| Style & Layout | 2,439 ms |
| Other | 1,312 ms |
| Script Evaluation | 697 ms |
| Rendering | 659 ms |

**Soluciones Propuestas:**

1. **Optimizar IntersectionObserver** en [`carousel.js`](assets/js/modules/carousel.js:26):
   - Aumentar `rootMargin` para reducinter observaciones
   - Limitar categorías observadas simultáneamente

2. **Optimizar estilos CSS**:
   - Reducir selectores complejos
   - Evitar recálculos de layout frecuentes
   - Usar `contain: layout` para aislar secciones

3. **Defer non-critical JavaScript**:
   - El módulo geolocation ya se carga dinámicamente
   - Verificar que no haya ejecución bloqueante

---

### 5. Problema bfcache (Back/Forward Cache)

**Problema:**

- "Pages with WebSocket cannot enter back/forward cache"
- Leaflet.js puede estar creando conexiones WebSocket

**Investigación:**
Leaflet usa WebSocket para:

- Tile loading (no es WebSocket, es HTTP)
- Posiblemente algún plugin de geolocalización

**Solución Propuesta:**

1. Verificar si hay plugins de Leaflet que usen WebSocket
2. Implementar `pagehide` event para limpiar recursos:

```javascript
window.addEventListener("pagehide", (event) => {
  if (event.persisted) {
    // Limpiar WebSocket y recursos
    if (map) {
      map.remove();
      map = null;
    }
  }
});
```

---

## 📋 Checklist de Implementación

### Fase 1: Optimización de Imágenes

- [ ] Redimensionar todas las imágenes a 278x278, 400x400, 150x150
- [ ] Recomprimir con mayor factor de compresión WebP
- [ ] Modificar `getImagePath()` en [`menu-data.js`](assets/js/modules/menu-data.js) para soportar múltiples tamaños
- [ ] Actualizar `renderMenuItem()` en [`carousel.js`](assets/js/modules/carousel.js:80) con `srcset`
- [ ] Actualizar preloads en [`index.html`](index.html:29) para versiones correctas

### Fase 2: Optimización de CSS

- [ ] Crear script de build para minificar CSS
- [ ] Separar carga de [`cart.css`](assets/css/components/cart.css) - cargar bajo demanda
- [ ] Generar versiones minificadas: `main.min.css`, `responsive.min.css`, etc.
- [ ] Actualizar [`index.html`](index.html:49) para usar versiones minificadas

### Fase 3: Optimización de JavaScript

- [ ] Optimizar IntersectionObserver thresholds
- [ ] Agregar `contain: layout` a secciones principales
- [ ] Implementar limpieza de bfcache en [`geolocation.js`](assets/js/modules/geolocation.js)
- [ ] Verificar que no haya memory leaks en el carrusel

### Fase 4: Testing y Validación

- [ ] Ejecutar Lighthouse antes de cambios (baseline)
- [ ] Ejecutar Lighthouse después de cada fase
- [ ] Verificar funcionamiento en móvil
- [ ] Probar navegación back/forward

---

## 📈 Métricas Esperadas

| Métrica                   | Actual   | Objetivo    |
| ------------------------- | -------- | ----------- |
| Transferencia de imágenes | ~680 KiB | ~100 KiB    |
| CSS transferido           | ~36 KiB  | ~15 KiB     |
| Main-thread work          | 5.4s     | <3s         |
| bfcache                   | Fallando | Funcionando |

---

## 🎯 Prioridad de Implementación

1. **ALTA**: Optimización de imágenes (mayor impacto en LCP)
2. **ALTA**: CSS no utilizado (fácil de implementar)
3. **MEDIA**: Minificación de CSS
4. **MEDIA**: Optimización de hilo principal
5. **BAJA**: bfcache (impacto menor en UX)

---

## 📝 Notas Técnicas

- Las imágenes actuales están en formato WebP pero con dimensiones excesivas
- El proyecto usa ES6 modules con imports dinámicos
- Leaflet.js se carga desde CDN con `defer`
- EmailJS se carga async para no bloquear renderizado
- El sistema de skeleton loaders está bien implementado

---

## 🔗 Archivos Clave a Modificar

1. [`assets/js/modules/carousel.js`](assets/js/modules/carousel.js) - srcset y lazy loading
2. [`assets/js/modules/menu-data.js`](assets/js/modules/menu-data.js) - generación de paths
3. [`assets/css/main.css`](assets/css/main.css) - imports condicionales
4. [`index.html`](index.html) - preloads y referencias CSS
5. [`assets/js/modules/geolocation.js`](assets/js/modules/geolocation.js) - limpieza bfcache
