# ARCADE — Gestión de novedades de empleados

Plataforma web para la gestión de novedades de empleados: licencias, vacaciones, fichadas y presentismo. Construida con React, TypeScript y Vite.

## Roles

### RRHH Administrativo
Vista completa de la plataforma con acceso a:
- **Dashboard**: métricas del día (empleados activos, fichadas, novedades pendientes, días para cierre), alertas automáticas y resumen de asistencia semanal.
- **Fichadas**: registro diario con entrada, descanso y salida por empleado, estado (presente, tardanza, anomalía, hora extra, etc.), línea de tiempo individual y estadísticas de origen (biométrico, QR, manual, API).
- **Empleados**: listado con filtros, perfil individual con datos laborales, calendario de asistencia mensual y novedades del período.
- **Novedades**: tabla completa de todas las novedades con filtros por estado y tipo, aprobación/rechazo individual o desde modal, creación manual de nuevas novedades.
- **Cierre mensual**: checklist de pasos con bloqueo por pendientes, resumen de preliquidación por empleado y exportación al contador (CSV, Excel, PDF) habilitada solo cuando no hay pendientes.

### Empleado
Panel personal con:
- Calendario de asistencia mensual con colores por estado (presente, tardanza, ausente, horas extra).
- Métricas personales: días trabajados, tardanzas acumuladas, ausencias y horas extra.
- Historial de novedades propias con estado de cada una.
- Formulario para solicitar licencias, vacaciones o ausencias justificadas (quedan en estado pendiente hasta aprobación de RRHH).

### Contador externo
Vista reducida exclusiva para liquidación:
- Filtro por rango de fechas.
- Vista previa del resumen por empleado con todos los datos relevantes.
- Descarga de **resumen CSV** (un registro por empleado con días trabajados, ausencias, tardanzas y horas extra).
- Descarga de **detalle CSV** (un registro por novedad aprobada en el período).

## Stack

- React 19 + TypeScript
- Vite 8
- React Router DOM (navegación por estado, sin backend)
- Datos mock (sin base de datos)

## Correr en desarrollo

```bash
npm install
npm run dev
```

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
