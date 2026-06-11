# 🔐 Configuración Segura de Variables de Entorno

## ¿Por qué usar variables de entorno?

Las claves de EmailJS y Supabase **NO deben estar en el código**.

❌ **Inseguro:**
```javascript
export const emailjs = {
  serviceId: "service_2opd7vp",  // ¡VISIBLE EN GIT!
  publicKey: "MuH16VnihKaVvx7a2"
}
```

✅ **Seguro:**
```javascript
export const emailjs = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
}
```

---

## 📋 Pasos para configurar

### 1. Copiar `.env.example` a `.env.local`

```bash
cp .env.example .env.local
```

### 2. Editar `.env.local` con tus claves reales

```
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_2opd7vp
VITE_EMAILJS_TEMPLATE_ID=template_4bl7von
VITE_EMAILJS_PUBLIC_KEY=MuH16VnihKaVvx7a2
VITE_EMAILJS_BUSINESS_EMAIL=info@burgerbroaster.pe

# Supabase Configuration (cuando la integres)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Verificar que `.gitignore` incluya `.env.local`

```bash
cat .gitignore | grep ".env"
# Debería mostrar: .env, .env.local, .env.*.local
```

### 4. Verificar que NO esté en Git

```bash
git status
# .env.local NO debe aparecer en la lista
```

### 5. Instalar dependencias si es necesario

```bash
npm install
```

### 6. Iniciar el proyecto

```bash
npm run dev
```

---

## 📝 Archivos involucrados

| Archivo | Función |
|---------|---------|
| `.env.example` | Plantilla con nombres de variables (sin valores) |
| `.env.local` | Tus claves reales (NUNCA commitear) |
| `.gitignore` | Excluye `.env.local` del repositorio |
| `assets/js/config.js` | Lee variables de entorno |

---

## ⚠️ Reglas IMPORTANTES

✅ **Hacer:**
- Copiar `.env.example` a `.env.local`
- Editar `.env.local` localmente con valores reales
- Compartir `.env.example` en Git (sin claves)
- Rotar claves si alguien las ve

❌ **NO hacer:**
- Commitear `.env` o `.env.local` a Git
- Compartir `.env.local` por email/chat
- Hardcodear claves en archivos `.js` o `.html`
- Usar la misma clave en desarrollo y producción

---

## 🔍 Verificar que funciona

En la consola del navegador (DevTools):

```javascript
// Esto debería mostrar tu serviceId (no una cadena vacía)
console.log(CONFIG.emailjs.serviceId)
```

---

## 🚀 Para producción (Vercel/Netlify)

1. Ve a tu plataforma de hosting
2. Crea variables de entorno en la configuración:
   - `VITE_EMAILJS_SERVICE_ID=...`
   - `VITE_EMAILJS_TEMPLATE_ID=...`
   - `VITE_EMAILJS_PUBLIC_KEY=...`
3. Redeploy la aplicación

---

## 📚 Más información

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [Supabase Security](https://supabase.com/docs/guides/auth)
