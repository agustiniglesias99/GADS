# Conectar ARCADE a Supabase

Esta guía te lleva desde un proyecto Supabase vacío hasta tener tus tablas,
datos, autenticación por rol y la app lista para conectarse.

> **Estado actual:** esta ronda deja lista la **base de datos + el cliente**.
> Las pantallas todavía usan `src/data/mockData.ts`; las conectamos a datos en
> vivo en la próxima ronda.

---

## Lo que se creó en el repo

```
supabase/
  schema.sql        ← tablas, enums, RLS, triggers de auth   (correr 1°)
  seed.sql          ← tus datos actuales (empleados, novedades, etc.) (correr 2°)
  post_users.sql    ← asigna roles después de crear usuarios   (correr 4°)
src/lib/
  supabase.ts       ← cliente de Supabase (usa las variables .env)
  database.types.ts ← tipos TypeScript del esquema
.env.example        ← plantilla de credenciales
.env                ← tus credenciales (gitignored) — completalo
```

---

## Paso 1 — Credenciales (`.env`)

En el dashboard de Supabase: **Project Settings → API**. Copiá:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

Pegalas en el archivo **`.env`** (ya existe, con placeholders):

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> ⚠️ Usá **solo** la clave `anon`. Nunca pongas la `service_role` en una
> variable `VITE_` — todo lo que empieza con `VITE_` viaja al navegador.

---

## Paso 2 — Crear el esquema

Dashboard → **SQL Editor → New query**. Pegá **todo** el contenido de
`supabase/schema.sql` y ejecutá (**Run**).

Esto crea las tablas (`empleados`, `profiles`, `novedades`, `registros_dia`,
`cierres_mensuales`, `resumen_empleados`), los enums, las políticas RLS por rol
y el trigger que crea un `profile` automáticamente cuando se registra un usuario.

## Paso 3 — Cargar los datos

Nueva query → pegá `supabase/seed.sql` → **Run**.

Verificá en **Table Editor** que `empleados` tenga 8 filas, `novedades` 21, etc.

---

## Paso 4 — Crear los usuarios (autenticación real)

Elegiste **Supabase Auth real**, así que cada persona que entra necesita un
usuario. Dashboard → **Authentication → Users → Add user**. Activá
**"Auto Confirm User"** para poder entrar sin verificar el mail.

Creá al menos:

| Rol      | Email sugerido          | Contraseña |
|----------|-------------------------|------------|
| RRHH     | `rrhh@arcade.com`       | la que quieras |
| Contador | `contador@arcade.com`   | la que quieras |
| Empleado | `juan.perez@empresa.com`| la que quieras |

> Para empleados, usá un email que **coincida** con el de un registro de la
> tabla `empleados` (columna `email`, p. ej. `juan.perez@empresa.com`). Así el
> Paso 5 los vincula solo.

## Paso 5 — Asignar los roles

Al crearse, cada usuario queda como `empleado` por defecto. Corré
`supabase/post_users.sql` en el SQL Editor para corregir los roles y vincular
a los empleados con su legajo. Ajustá los emails de staff si usaste otros.

Comprobá:

```sql
select email, role, empleado_id from public.profiles order by role;
```

Deberías ver `rrhh`, `contador` y los `empleado` con su `empleado_id`.

---

## Paso 6 — Probar la conexión

```bash
npm run dev
```

La app todavía muestra datos mock (eso se cambia en la próxima ronda), pero el
cliente ya está configurado. Si querés probar que las credenciales y el RLS
funcionan, pegá esto temporalmente en la consola del navegador (con la app
abierta) — o esperá a la próxima ronda donde lo cableamos en la UI:

```js
import { supabase } from '/src/lib/supabase.ts'
await supabase.auth.signInWithPassword({ email: 'rrhh@arcade.com', password: '...' })
console.log((await supabase.from('empleados').select('*')).data)
```

Con el rol **rrhh** verás los 8 empleados; con **empleado**, solo el suyo;
con **contador**, los empleados pero solo novedades aprobadas. Eso confirma que
las políticas RLS están activas.

---

## Próxima ronda (cuando me digas)

1. `AuthContext` → usar `supabase.auth` real (sesión, login, logout).
2. Login → `signInWithPassword`. **Ojo:** con Auth real, los empleados entran
   con **email + contraseña** (no legajo + PIN, porque Supabase Auth necesita
   email). Si querés conservar "legajo + PIN", lo resolvemos mapeando el legajo
   a un email interno (p. ej. `042@empleado.arcade.local`) — avisame.
3. Reemplazar `mockData` por consultas en vivo en cada página, con estados de
   carga / error / vacío.
4. (Opcional) Generar tipos automáticamente:
   `npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts`
