# Burger & Broaster Express

## 📋 Descripción del Proyecto

Sitio web de restaurante de comida rápida especializado en hamburguesas y pollo broaster. Incluye catálogo de productos, carrito de compras y sistema de pedidos por WhatsApp.

## 🗂️ Estructura del Proyecto

```
Burger_&_Broaster_Express/
├── index.html                      # Página principal
├── assets/
│   ├── css/
│   │   ├── main.css               # CSS principal (importa todos los módulos)
│   │   ├── components/            # Componentes CSS
│   │   │   ├── header.css        # Estilos del header y navegación
│   │   │   ├── menu.css          # Estilos del menú y carruseles
│   │   │   ├── cart.css          # Estilos del carrito y pedidos
│   │   │   └── footer.css        # Estilos del footer y contacto
│   │   └── utilities/            # Utilidades CSS
│   │       ├── variables.css     # Variables CSS (colores, espaciados, etc.)
│   │       └── responsive.css    # Media queries responsive
│   ├── js/
│   │   ├── main.js               # Punto de entrada JavaScript
│   │   ├── config.js             # Configuración global
│   │   └── modules/              # Módulos JavaScript
│   │       ├── menu-data.js      # Datos del menú
│   │       ├── carousel.js       # Funcionalidad de carruseles
│   │       ├── cart.js           # Lógica del carrito
│   │       └── navigation.js     # Navegación entre secciones
│   └── images/                   # Imágenes organizadas por categoría
│       ├── broaster/
│       ├── hamburguesas/
│       ├── salchipapas/
│       └── bebidas/
└── docs/
    └── README.md                 # Este archivo
```

## 🚀 Características

### Funcionalidades Principales

- ✅ Catálogo de productos por categorías
- ✅ Carruseles infinitos para navegación de productos
- ✅ Carrito de compras interactivo
- ✅ Sistema de pedidos por WhatsApp
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Navegación suave entre secciones

### Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modularizados con variables CSS
- **JavaScript ES6+** - Módulos y funcionalidad moderna
- **WhatsApp API** - Integración para pedidos

## 📦 Instalación y Uso

### Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional, para desarrollo)

### Instalación

1. **Clonar o descargar el proyecto**

   ```bash
   # Si tienes el proyecto en un repositorio
   git clone [url-del-repositorio]
   ```

2. **Abrir el proyecto**

   - Opción 1: Abrir `index.html` directamente en el navegador
   - Opción 2: Usar un servidor local (recomendado)

   ```bash
   # Con Python 3
   python -m http.server 8000

   # Con Node.js (npx)
   npx serve

   # Con PHP
   php -S localhost:8000
   ```

3. **Acceder a la aplicación**
   - Si usas servidor local: `http://localhost:8000`
   - Si abres directamente: Doble clic en `index.html`

## 🎨 Personalización

### Modificar Colores

Edita `assets/css/utilities/variables.css`:

```css
:root {
  --color-primary: #c62828; /* Color principal */
  --color-secondary: #ffc107; /* Color secundario */
  /* ... más variables */
}
```

### Agregar Productos

Edita `assets/js/modules/menu-data.js`:

```javascript
export const menuData = {
  broaster: [
    {
      id: 1,
      name: "Nuevo Producto",
      price: 15.0,
      emoji: "🍗",
      description: "Descripción del producto",
      image: "nombre-imagen.jpg",
    },
    // ... más productos
  ],
};
```

### Cambiar Número de WhatsApp

Edita `assets/js/config.js`:

```javascript
export const CONFIG = {
  whatsapp: {
    number: "51991282954", // Cambia este número
    baseUrl: "https://wa.me/",
  },
};
```

## 📱 Responsive Design

El sitio está optimizado para:

- 📱 **Móviles**: < 768px
- 📱 **Tablets**: 768px - 1024px
- 💻 **Desktop**: > 1024px

## 🔧 Mantenimiento

### Agregar Nuevas Imágenes

1. Coloca la imagen en la carpeta correspondiente en `assets/images/`
2. Actualiza `menu-data.js` con el nombre de la imagen
3. Asegúrate de que el nombre coincida exactamente

### Modificar Estilos

- **Estilos globales**: `assets/css/main.css`
- **Componentes específicos**: `assets/css/components/[componente].css`
- **Responsive**: `assets/css/utilities/responsive.css`

### Debugging

- Abre la consola del navegador (F12)
- Revisa mensajes de inicialización
- Verifica errores de carga de imágenes o módulos

## 📝 Buenas Prácticas Implementadas

### HTML

- ✅ Estructura semántica
- ✅ Meta tags para SEO
- ✅ Accesibilidad (ARIA labels)
- ✅ Comentarios descriptivos

### CSS

- ✅ Variables CSS para mantenibilidad
- ✅ Modularización por componentes
- ✅ Mobile-first approach
- ✅ Nombres de clases descriptivos

### JavaScript

- ✅ ES6 Modules
- ✅ Separación de responsabilidades
- ✅ Código reutilizable
- ✅ Comentarios JSDoc
- ✅ Manejo de errores

## 🐛 Solución de Problemas

### Las imágenes no se cargan

- Verifica que las rutas en `menu-data.js` sean correctas
- Asegúrate de que las imágenes estén en las carpetas correctas
- Revisa la consola del navegador para errores

### Los módulos JavaScript no funcionan

- Asegúrate de usar un servidor web (no abrir directamente el HTML)
- Verifica que el navegador soporte ES6 modules
- Revisa la consola para errores de importación

### El carrito no actualiza

- Verifica que los IDs de los elementos HTML coincidan con el JavaScript
- Revisa la consola para errores
- Asegúrate de que `cart.js` esté cargado correctamente

## 📞 Soporte

Para soporte o consultas:

- 📱 WhatsApp: +51 991 282 954
- 📧 Email: info@burgerbroaster.pe

## 📄 Licencia

© 2024 Burger & Broaster Express. Todos los derechos reservados.
