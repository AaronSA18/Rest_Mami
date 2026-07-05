# Configuración segura de variables de entorno

## Regla principal

Una aplicación frontend no puede ocultar credenciales reales del navegador. Las variables de entorno sirven para evitar que los valores queden escritos en Git o en el código fuente.

Si una clave debe ser secreta de verdad, debe vivir en backend. En frontend usa solo claves públicas o anon keys.

## Archivos

| Archivo | Función |
| --- | --- |
| `.env.example` | Plantilla pública con nombres de variables, sin valores reales |
| `.env` | Archivo local con valores reales, nunca se debe commitear |
| `.gitignore` | Evita que `.env`, `.env.local` y `.env.*.local` se suban a Git |
| `assets/js/config.js` | Lee variables de entorno para EmailJS |
| `assets/js/modules/supabase.js` | Lee variables de entorno para Supabase |

## Archivos generados que se eliminan

Estos archivos se generan al instalar o compilar, pero no forman parte del código fuente:

```text
node_modules/
dist/
```

Se eliminan porque:

- `node_modules/` contiene dependencias instaladas y se regenera con `pnpm install`.
- `dist/` contiene el build generado y se regenera con `pnpm build`.

No deben subirse al repositorio.


### 1. Copia la plantilla

```bash
cp .env.example .env
```

### 2. Completa `.env`

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key

VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
VITE_EMAILJS_BUSINESS_EMAIL=tu_email
```

### 3. No uses service role key en frontend

No agregues esto al frontend:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

La `service role key` solo debe usarse en backend. En frontend usa `VITE_SUPABASE_ANON_KEY` y configura Row Level Security en Supabase.

### 4. Instala dependencias con pnpm

```bash
pnpm install
```

### 5. Ejecuta el proyecto

```bash
pnpm dev
```

### 6. Verifica que no se suban secretos

```bash
git status
```

`.env` no debe aparecer.

Para ver archivos ignorados:

```bash
git status --ignored -s
```

## Antes de publicar

Ejecuta:

```bash
pnpm install
pnpm build
```

No publiques estas carpetas como parte del código fuente:

```text
node_modules/
dist/
```

`node_modules/` se regenera con `pnpm install`. `dist/` se regenera con `pnpm build`.

No publiques `.env` en repositorios públicos. En el hosting usa variables de entorno.


En Vercel, Netlify, Render o el hosting que uses, configura estas variables de entorno:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
VITE_EMAILJS_BUSINESS_EMAIL=
```

Luego vuelve a desplegar.

## Si una credencial ya estuvo en Git

1. Rota la credencial en el proveedor correspondiente.
2. Elimina el archivo del tracking:

```bash
git rm --cached .env
```

3. Confirma el cambio:

```bash
git commit -m "Remove environment files from git"
```

Borrar el archivo no elimina el historial. Si ya se publicó, rota las claves expuestas.
