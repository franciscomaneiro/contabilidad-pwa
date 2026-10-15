# 📱 Contabilidad Binance PWA (Fondo / Custodia Compartida)

Aplicación web progresiva (PWA) diseñada para llevar la rendición de cuentas del dinero depositado en Binance por tu papá, con registro de egresos mediante concepto obligatorio, fotos de comprobantes, saldo restante en tiempo real y protección con PIN.

---

## 🚀 Características Principales

1. **🔒 Acceso Protegido por PIN**:
   - Teclado numérico estilo cajero/móvil para evitar accesos no autorizados.
   - Opción *"Mantener sesión iniciada (30 días)"* para no tener que teclearlo cada vez en el teléfono.
   - PIN inicial: `1234` (se puede cambiar desde Ajustes o con la variable de entorno `NEXT_PUBLIC_APP_PIN`).

2. **💰 Saldo en Tiempo Real (USDT / USD)**:
   - Tarjeta principal con el saldo restante disponible.
   - Desglose de **Total Depositado** vs **Total Gastado**.

3. **📝 Movimientos con Concepto Obligatorio**:
   - **Depósitos (+ Saldo)**: Para sumar las recargas que él hace a tu cuenta de Binance.
   - **Gastos (- Saldo)**: Cada pago realizado con concepto obligatorio (*Supermercado, Farmacia, Luz, etc.*).
   - **Trazabilidad histórica (*Running Balance*)**: Cada movimiento muestra el saldo exacto que quedó tras realizarse (`Saldo restante: $XXX.XX`).

4. **📸 Comprobantes de Pago**:
   - Permite tomar fotos con la cámara o subir capturas de transferencias.
   - Visor a pantalla completa con botón para descargar.

5. **📊 Exportación & Filtros**:
   - Búsqueda en vivo por concepto.
   - Filtros: *Todos, Solo Gastos, Solo Depósitos, Con Comprobante*.
   - Exportación completa del historial a **Excel (CSV)**.

6. **📲 Instalable en Teléfonos (PWA)**:
   - Funciona en pantalla completa sin barras de navegador tanto en Android como en iOS (iPhone).

---

## 🛠️ Ejecución Local

```bash
cd contabilidad-pwa
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ☁️ Conexión con Supabase (Para sincronizar entre teléfonos)

La app funciona inmediatamente en **Modo Local (Offline)** guardando todo en el navegador. Para que tú y tu papá vean los movimientos sincronizados en tiempo real desde cualquier teléfono:

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Ve al **SQL Editor** en Supabase, copia el contenido de [`supabase-schema.sql`](./supabase-schema.sql) y dale a **Run**.
3. Copia tu `Project URL` y `anon public key` desde *Project Settings > API*.
4. Configura las variables de entorno en Vercel o en un archivo `.env.local`:

```env
NEXT_PUBLIC_APP_PIN=1234
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

---

## 🚢 Despliegue en Vercel

1. Sube esta carpeta a tu repositorio de GitHub.
2. En [vercel.com](https://vercel.com), crea un nuevo proyecto importando el repositorio.
3. En la sección **Environment Variables**, agrega:
   - `NEXT_PUBLIC_APP_PIN`: El PIN de 4 dígitos que acordarás con tu papá.
   - `NEXT_PUBLIC_SUPABASE_URL`: Tu URL de Supabase (si usas sincronización en la nube).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu API Key anónima de Supabase.
4. Dale a **Deploy**.

---

## 📱 Cómo instalar en el celular (PWA)

- **En Android (Chrome)**:
  1. Abre el enlace de Vercel en Chrome.
  2. Toca el menú de tres puntos (arriba a la derecha).
  3. Selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.

- **En iPhone (Safari)**:
  1. Abre el enlace de Vercel en Safari.
  2. Toca el botón de compartir (el icono con una flecha hacia arriba en la barra inferior).
  3. Selecciona **"Agregar al inicio"** (o *"Add to Home Screen"*).
