# 📊 Esquema de Base de Datos - Rest Mami

**Proyecto:** Rest Mami - Burger & Broaster Express  
**Plataforma:** Supabase (PostgreSQL)  
**Fecha:** Junio 2026  
**Versión:** 1.0

---

## 📁 Tabla: categories

Almacena las categorías de productos del menú.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---|---|
| **id** (PK) | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| **name** | TEXT | UNIQUE, NOT NULL | broaster, burgers, salchipapas, drinks, combos |
| description | TEXT | NULL | Descripción de la categoría |
| created_at | TIMESTAMP | DEFAULT now() | Fecha de creación |

**Datos iniciales:**
- Broaster
- Hamburguesas
- Salchipapas
- Bebidas
- Combos

---

## 🍔 Tabla: products

Almacena todos los productos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---|---|
| **id** (PK) | UUID | PRIMARY KEY | Identificador único |
| **category_id** (FK) | UUID | NOT NULL, FOREIGN KEY → categories(id) | Referencia a categoría |
| **name** | TEXT | NOT NULL | Alita de Pollo, H_pollo, etc. |
| **price** | DECIMAL(10,2) | NOT NULL | 10.00, 6.00, etc. |
| description | TEXT | NULL | Descripción del producto |
| emoji | TEXT | NULL | 🍗, 🍔, 🌭, 🥤 |
| image_path | TEXT | NULL | broaster/Alita.webp |
| fallback_emoji | TEXT | NULL | Emoji de respaldo |
| is_active | BOOLEAN | DEFAULT true | Indica si está activo |
| created_at | TIMESTAMP | DEFAULT now() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT now() | Última actualización |

**Registros a migrar:** 15 productos
- 4 Broaster
- 5 Hamburguesas
- 3 Salchipapas
- 3 Bebidas

---

## 🎁 Tabla: combos

Almacena los combos (paquetes de productos).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---|---|
| **id** (PK) | UUID | PRIMARY KEY | Identificador único |
| **name** | TEXT | NOT NULL | Combo Pollo, Combo Carne, Combo Familiar |
| **price** | DECIMAL(10,2) | NOT NULL | 12.00, 35.00 |
| description | TEXT | NULL | Descripción del combo |
| emoji | TEXT | NULL | 🎁 |
| image_path | TEXT | NULL | combos/combo-pollo.webp |
| **items** | JSONB | NOT NULL | [{product_id: UUID, quantity: 1}, ...] |
| is_active | BOOLEAN | DEFAULT true | Disponibilidad |
| created_at | TIMESTAMP | DEFAULT now() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT now() | Última actualización |

**Estructura JSON de items:**
```json
[
  {"product_id": "uuid-1", "quantity": 1},
  {"product_id": "uuid-2", "quantity": 1},
  {"product_id": "uuid-3", "quantity": 1}
]
```

**Registros a migrar:** 3 combos
- Combo Pollo (S/ 12.00)
- Combo Carne (S/ 12.00)
- Combo Familiar (S/ 35.00)

---

## 📷 Tabla: images (Opcional)

Registro detallado de imágenes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---|---|
| **id** (PK) | UUID | PRIMARY KEY | Identificador único |
| product_id (FK) | UUID | NULL, FOREIGN KEY → products(id) | Referencia al producto |
| combo_id (FK) | UUID | NULL, FOREIGN KEY → combos(id) | Referencia al combo |
| image_name | TEXT | NOT NULL | Alita.webp, H_pollo.webp |
| image_path | TEXT | NOT NULL | broaster/Alita.webp |
| storage_url | TEXT | NOT NULL | URL pública de Supabase Storage |
| file_size | INTEGER | NULL | Tamaño en bytes |
| uploaded_at | TIMESTAMP | DEFAULT now() | Fecha de carga |

---

## 🔗 Relaciones

```
categories (1) ─────→ (N) products
products (N) ─────→ (1N en JSONB) combos.items
products (1) ─────→ (N) images
combos (1) ─────→ (N) images
```

---

## 💾 Estructura de Almacenamiento - Supabase Storage

**Bucket name:** `images` (Public)

```
images/
├── broaster/
│   ├── Alita.webp
│   ├── Pierna.webp
│   ├── Entrepierna.webp
│   └── Pechodepollo.webp
├── burgers/
│   ├── H_pollo.webp
│   ├── H_carne.webp
│   ├── H_chorizo.webp
│   ├── H_mixta.webp
│   └── H_royal.webp
├── salchipapas/
│   ├── S_.webp
│   ├── S_especial.webp
│   └── S_pollo.webp
├── drinks/
│   ├── inka-cola500ml.webp
│   ├── COCA-COLA500ml.webp
│   └── guarana450ml.webp
├── combos/
│   ├── combo-pollo.webp
│   ├── combo-carne.webp
│   └── combo-familiar.webp
└── logo/
    └── logo.webp
```

**Configuración recomendada:**
- Public: ✅ Sí
- Max file size: 5MB
- Allowed types: .webp, .png, .jpg, .jpeg

**Formato de URL pública:**
```
https://[project-ref].supabase.co/storage/v1/object/public/images/broaster/Alita.webp
```

---

## 🛠️ SQL para Crear Tablas

### Crear tabla categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### Crear tabla products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  emoji TEXT,
  image_path TEXT,
  fallback_emoji TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Crear tabla combos
```sql
CREATE TABLE combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  emoji TEXT,
  image_path TEXT,
  items JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Crear tabla images
```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  combo_id UUID REFERENCES combos(id) ON DELETE SET NULL,
  image_name TEXT NOT NULL,
  image_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT now()
);
```

### Crear índices (mejora de rendimiento)
```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_combos_active ON combos(is_active);
CREATE INDEX idx_images_product ON images(product_id);
CREATE INDEX idx_images_combo ON images(combo_id);
```

---

## 🔄 Cambios Requeridos en el Proyecto

### Archivos a modificar:

1. **`assets/js/modules/menu-data.js`**
   - Reemplazar datos hardcodeados con consultas a Supabase
   - Añadir campo `image` a combos

2. **`assets/js/modules/carousel.js`**
   - Actualizar para leer de la BD
   - Manejar URLs de Storage correctamente

3. **`assets/js/modules/cart.js`**
   - Sincronizar con datos de BD

4. **`index.html`**
   - Cambiar logo de emoji a imagen

### Nuevas dependencias:
```bash
npm install @supabase/supabase-js
```

### Archivo de configuración:
```javascript
// assets/js/config.js
export const supabaseConfig = {
  URL: 'https://[PROJECT-REF].supabase.co',
  KEY: '[ANON-KEY]'
}
```

---

## 📊 Datos de Ejemplo

### Categories
| name | description |
|------|---|
| broaster | Pollo broaster crujiente |
| burgers | Hamburguesas de todo tipo |
| salchipapas | Papas fritas con salchicha |
| drinks | Bebidas refrescantes |
| combos | Paquetes especiales |

### Productos (Sample)
| name | price | image_path | emoji |
|------|-------|---|---|
| Alita de Pollo | 10.00 | broaster/Alita.webp | 🍗 |
| Hamburguesa de Pollo | 6.00 | burgers/H_pollo.webp | 🍔 |
| Salchipapa Clásica | 8.00 | salchipapas/S_.webp | 🌭 |
| Inka Cola 500ml | 3.50 | drinks/inka-cola500ml.webp | 🥤 |

---

## ✅ Checklist de Implementación

- [ ] Crear tablas en Supabase
- [ ] Crear índices
- [ ] Configurar RLS policies
- [ ] Crear bucket "images" en Storage
- [ ] Subir imágenes a Storage
- [ ] Insertar datos iniciales (categories, products, combos)
- [ ] Instalar `@supabase/supabase-js`
- [ ] Crear archivo `assets/js/config.js` con credenciales
- [ ] Actualizar `menu-data.js` para consultar Supabase
- [ ] Actualizar `carousel.js` y `cart.js`
- [ ] Cambiar logo HTML
- [ ] Probar carga de imágenes
- [ ] Probar carrito de compras con datos de BD

---

**Documento generado:** Junio 2026  
**Proyecto:** Rest Mami - Burger & Broaster Express
