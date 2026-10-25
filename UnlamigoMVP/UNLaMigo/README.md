# UNLaMigo — MVP

Webapp mobile-first para que estudiantes de la UNLaM que manejan publiquen sus trayectos
(origen, hora, días y lugares libres) y sumen a otros estudiantes a su viaje.

Basada en `../wireframe.html` (flujo del conductor): Login → Inicio → Cargar trayecto →
Confirmación → Solicitud entrante → Aceptación → Mi viaje → En viaje → Cierre.

## Correr

```bash
npm install
npm run dev -- --host   # --host para abrirla desde el celular en la misma red
npm run build
```

## Notas del MVP

- Sin backend: el estado se guarda en `localStorage` (`src/store.ts`). Cualquier usuario y
  contraseña ingresa con el perfil demo de `src/data.ts`.
- Los botones "Demo: …" simulan eventos que en la versión real llegarían de otro usuario
  (una solicitud) o del GPS (la llegada).
- "Verificar llegada" hace una lectura puntual de ubicación (sin tracking en vivo) y habilita
  "Finalizar viaje" si estás a menos de 600 m del campus. Requiere HTTPS o localhost.
- "Buscar viaje" (rol pasajero) queda como pantalla de próximamente, igual que en el wireframe.
