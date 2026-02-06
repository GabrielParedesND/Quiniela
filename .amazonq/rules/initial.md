# Quiniela — Reglas del proyecto + Iteración 1 (Next.js + Tailwind v4 + Theming JSON + SST v3 + Cognito)

## Contexto del proyecto
Se construye una plataforma web de **Quiniela Mundialista (USA 2026)** con:
- Registro/login (real con **Amazon Cognito** en esta iteración).
- Dashboard del usuario.
- Pronóstico por jornadas (inputs de marcadores).
- Mis Resultados (visual de puntos por jornada + detalle).
- Ranking global de usuarios.
- Ranking de equipos por grupos.

En esta fase se requiere **maquetado + navegación + autenticación real con Cognito**, y **theming parametrizable** por JSON.
La lógica de negocio (cálculo de puntos, cierre de jornada, persistencia de pronósticos, etc.) permanece **mock / NO implementada**.

---

## Stack y lineamientos técnicos
- **Next.js (App Router)** + **TypeScript**.
- **TailwindCSS v4**.
- **SST v3** para infraestructura y despliegue.
- **Amazon Cognito** (User Pool) para auth real (sign up / sign in / sign out).
- Componentes en `src/components`.
- Pantallas en `src/app/**/page.tsx`.
- **Datos mock tipados** en `src/lib/mock.ts`.
- **Theming por JSON** en `src/data/themes/*.json` (sin colores hardcodeados en componentes).
- UI responsive (mobile-first).
- Mantener UI lo más fiel posible al prototipo HTML existente (si se provee).

---

## Reglas globales (aplican a todas las iteraciones)
1. **No romper estructura de rutas** una vez definidas (evitar rework).
2. Mantener componentes reutilizables y simples.
3. No acoplar UI a backend (la UI debe funcionar con mocks; Cognito solo para sesión).
4. Todo cambio debe ser incremental: “partir del código existente” y modificar lo mínimo necesario.
5. No introducir librerías nuevas sin justificarlo (evitar dependency creep).
6. **Theming obligatorio**: todos los colores y tokens visuales deben salir del JSON de tema (nada de hex/`bg-*` “fijo” en JSX, salvo neutrales mínimos del layout si se justifica).
7. **Seguridad básica**: no exponer secretos en frontend; variables sensibles solo vía SST + env.

---

## Iteración 1 — Objetivo (maquetado navegable + theming + Cognito + base SST)
### Entregable
Construir un **maquetado funcional y navegable** en Next.js con Tailwind v4, que:
- Use **datos mock** para contenido.
- Implemente **auth real con Cognito** (login/registro/logout).
- Proteja rutas “autenticadas” (dashboard y subsecciones).
- Permita **cambiar tema** cargando un JSON (ej: `default.json`, `dark.json`, `gallo.json`).

### Prohibido en esta iteración
- No integrar APIs propias / DB / DynamoDB (excepto Cognito).
- No implementar cálculo real de puntos ni reglas reales.
- No persistencia de pronósticos (sin localStorage/cookies para data funcional, salvo tokens de sesión manejados por el SDK).
- No SSR/ISR/edge tuning, ni caching, ni analytics, ni tests.

---

## Theming — Requisito obligatorio (JSON en `/src/data/themes`)
### Objetivo
**Todos los colores de todos los componentes** deben ser configurables por un archivo JSON, sin cambiar el código de componentes.

### Estructura sugerida
- `src/data/themes/default.json`
- `src/data/themes/dark.json`
- `src/data/themes/gallo.json`
- `src/lib/theme/types.ts`
- `src/lib/theme/theme.ts` (loader + helpers)
- `src/components/ThemeProvider.tsx` (contexto y selección de tema)

### Reglas de implementación (Tailwind v4 + CSS Variables)
1. El JSON define **tokens** (no clases Tailwind directas).
2. El `ThemeProvider` convierte tokens a **CSS variables** en `:root` o en un wrapper (`<div data-theme="...">`).
3. Los colores NO se aplican mediante clases arbitrarias ([...]).
Todo el theming debe hacerse a través de tokens Tailwind mapeados a CSS variables.
4. Prohibido hardcodear hex o colores directos en componentes.

### Tokens mínimos sugeridos (ejemplo)
```json
{
 "name": "default",
 "colors": {
   "bg": "#0B1220",
   "surface": "#111A2E",
   "surface2": "#16213A",
   "text": "#EAF0FF",
   "muted": "#A9B4D0",
   "primary": "#FFD400",
   "primaryText": "#0B1220",
   "accent": "#00D4FF",
   "danger": "#FF4D4D",
   "border": "#223052"
 },
 "components": {
   "button": {
     "bg": "primary",
     "text": "primaryText",
     "hoverBg": "accent"
   },
   "card": {
     "bg": "surface",
     "border": "border"
   }
 }
}
```

---

## Infraestructura — SST v3 (mínimo en Iteración 1)
### Objetivo
Tener un proyecto deployable con SST v3 que incluya:
- Next.js site (App Router).
- Cognito User Pool + App Client.
- Variables de entorno para el frontend (solo las necesarias).

### Reglas
- La configuración de SST debe vivir en `/sst.config.ts` (o el estándar de SST v3).
- No crear más recursos AWS de los necesarios en esta iteración.
- Exportar outputs relevantes (UserPoolId, UserPoolClientId, Region) como env para el frontend.

---

## Autenticación — Amazon Cognito (obligatorio)
### Requisitos funcionales
- Pantalla `/` (Login): iniciar sesión con Cognito.
- Pantalla `/onboarding` (Registro): crear usuario en Cognito (sign up) + confirmación (si aplica).
- Logout disponible en header (vistas autenticadas) que termine sesión y navegue a `/`.
- Rutas protegidas: `/dashboard`, `/predictions`, `/results`, `/teams`, `/ranking` (si existe).

### Reglas
- Usar el SDK oficial (AWS Amplify Auth o AWS SDK/amazon-cognito-identity-js). Elegir **una** y justificar.
- No guardar secretos en frontend.
- Manejar estados de carga y errores (mensajes simples).

---

## Alcance de UI (pantallas y navegación)
### Rutas (App Router)
- `/` → Login (Cognito)
- `/onboarding` → Registro (Cognito)
- `/dashboard` → Home autenticado (mock)
- `/predictions` → Pronosticar resultados (mock)
- `/results` → Mis resultados (mock)
- `/teams` → Ranking de equipos (mock)
- `/ranking` → Ranking global de usuarios (mock) *(si se separa)*

### Navegación
- Login → “Continuar” navega a `/dashboard` si auth ok.
- Registro → “Completar Registro” navega a `/dashboard` tras confirmación/sign-in.
- Dashboard → cards/botones navegan a Predictions / Results / Teams / Ranking.
- Header/navbar en vistas autenticadas con botón “Salir” (logout real).

---

## Componentes requeridos (mínimo viable)
Crear componentes reutilizables en `src/components`:
- `AppShell` (layout autenticado: header + contenedor)
- `ThemeProvider` (aplica tema desde JSON)
- `SponsorBanner` (placeholder patrocinador)
- `UserCard` (avatar, nombre, puntos mock)
- `Tabs` o `SegmentedTabs` (Jornadas y Grupos)
- `MatchCard` (equipo A vs equipo B + inputs)
- `ResultsCard` (oficial vs tuyo + badge puntos mock)
- `RankingTable` (ranking usuarios)
- `TeamTable` (ranking equipos por grupo)

**Nota:** todos deben consumir tokens del tema (variables CSS).

---

## Datos mock (tipos + archivo único)
Crear `src/lib/mock.ts` con:
- `teams[]` (id, name, short, flagUrl)
- `matches[]` (id, jornada, dateLabel, teamAId, teamBId, status: 'played'|'upcoming', scoreA?, scoreB?)
- `user` (name, avatarUrl, dpi, tel, edad, pointsMock)
- `userPredictions` (por matchId: {a,b} mock)
- `rankingUsers[]` (name, pts, category)
- `teamStandingsByGroup` (A/B/C/D con array {teamId, pts})

**Importante:** todo debe ser estático/mock. No cálculo real.

---

## Definición de “terminado” para Iteración 1
Se considera listo cuando:
1. Todas las rutas cargan sin error.
2. La navegación entre pantallas funciona.
3. La UI es responsive.
4. Los componentes están separados y reutilizables.
5. Theming funciona cambiando JSON (sin tocar componentes).
6. Login/Registro/Logout funciona con Cognito.
7. Rutas autenticadas están protegidas.
8. El proyecto compila y corre (`npm run dev`) y SST despliega sin pasos manuales raros.

---

## Instrucción directa para Amazon Q (Primera interacción)
**Tarea:**
1. Crear/ajustar proyecto Next.js (App Router) con TypeScript.
2. Instalar y configurar TailwindCSS v4.
3. Implementar theming por JSON en `src/data/themes` usando CSS variables + Tailwind.
4. Configurar SST v3 para desplegar el sitio Next.js.
5. Crear Cognito User Pool + App Client en SST y pasar outputs al frontend.
6. Implementar login/registro/logout real con Cognito.
7. Implementar rutas y componentes del maquetado usando mocks.

**Restricciones obligatorias:**
- No backend propio / no DB / no cálculo real / no features inventadas.
- No introducir librerías UI externas (MUI, shadcn, etc.).
- Colores 100% parametrizables desde JSON (sin hardcode).

**Formato de entrega esperado:**
- Explicar estructura de carpetas.
- Proveer archivos principales (pages, components, theme loader/provider, mock, sst config).
- Indicar comandos para correr local y desplegar.