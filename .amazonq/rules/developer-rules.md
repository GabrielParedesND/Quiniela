# Reglas de Buenas Prácticas de Desarrollo — Proyecto Next.js

Este documento define reglas y convenciones para mantener un proyecto Next.js profesional, consistente y fácil de mantener. Se promueve **Clean Code**, **SOLID** y principios de **Clean Architecture** cuando aporten valor (no como obligación, sino como guía para mantener integridad y calidad).

---

## 1. Principios generales
- Priorizar legibilidad y mantenibilidad sobre “ingeniería” innecesaria.
- Cambios incrementales: modificar lo mínimo necesario para cumplir el objetivo.
- Evitar acoplamientos: UI, dominio y acceso a datos deben estar claramente separados.
- Preferir composición sobre herencia; funciones pequeñas, enfocadas y testeables.
- No duplicar lógica; extraer utilidades y componentes reutilizables cuando tenga sentido.

---

## 2. Estructura recomendada del proyecto (App Router)
Ejemplo (puede ajustarse según el tamaño del producto):

- `src/app/` — Rutas y layouts (Next App Router)
- `src/app/(public)/` — Rutas públicas (ej. login, marketing)
- `src/app/(auth)/` — Rutas protegidas (ej. dashboard)
- `src/components/` — Componentes UI reutilizables
- `src/features/` — Feature modules (UI + hooks + acciones por feature)
- `src/domain/` — Reglas del negocio (entidades, value objects, contratos)
- `src/application/` — Casos de uso (orquestación del dominio)
- `src/infrastructure/` — Implementaciones externas (HTTP, storage, adapters)
- `src/lib/` — Helpers generales (formatters, constants, etc.)
- `src/data/` — JSON estático, seeds, mocks, temas, catálogos
- `src/types/` — Tipos compartidos (si no viven cerca del uso)
- `src/styles/` — Globals (si aplica)
- `tests/` — Pruebas (unit/integration/e2e)

Regla práctica: **si un feature crece**, muévalo a `src/features/<feature>/` y mantenga su código lo más “encapsulado” posible.

---

## 3. Convenciones de nombres

### 3.1 Archivos y carpetas
- Componentes React: **PascalCase**. Ej.: `UserCard.tsx`, `MatchCard.tsx`.
- Hooks: **camelCase** con prefijo `use`. Ej.: `useAuth.ts`, `useTheme.ts`.
- Utilidades: nombres específicos (evitar “cajones”). Ej.: `formatDate.ts`, `currency.ts`, `auth.ts`.
- Rutas en App Router: minúsculas. Ej.: `src/app/dashboard/page.tsx`.
- Evitar genéricos como `utils.ts`, `helpers.ts` si crecen sin control.

### 3.2 Variables, funciones y tipos
- Variables y funciones: **camelCase** (ej.: `totalPoints`, `getUserProfile`).
- Constantes globales reales: **UPPER_SNAKE_CASE** (ej.: `MAX_RETRIES`).
- Tipos/Interfaces/Enums: **PascalCase** (ej.: `User`, `Match`, `TeamGroup`).
- Booleanos con prefijos claros: `isLoading`, `hasError`, `canEdit`.
- Evitar abreviaturas ambiguas: `usr`, `cfg`, `tmp` (usar nombres expresivos).

---

## 4. TypeScript (reglas mínimas)
- Prohibido `any` salvo casos extremadamente justificados. Preferir `unknown` + narrowing.
- Tipos cerca del uso: ponga interfaces/tipos en el mismo módulo/feature cuando sea local.
- Usar `union types` y **discriminated unions** para estados (ej.: `{ status: 'idle' | 'loading' | 'success' | 'error' }`).
- Usar `as const` para catálogos estáticos y derivar tipos.
- Validar data externa en los “bordes” (API, forms) con esquemas (Zod u otro) cuando aplique.

---

## 5. Clean Code (reglas prácticas)
- Funciones pequeñas: una sola responsabilidad, nombre descriptivo.
- Evitar efectos secundarios escondidos; separar (ej.: navegación, logging, setState).
- Evitar comentarios redundantes; comentar solo intención/decisiones.
- Eliminar código muerto, `console.log` y flags temporales antes de merge.
- Preferir **early returns** para reducir indentación.
- No mezclar formateo de datos con render UI; extraer formatters.

---

## 6. SOLID aplicado a frontend (cuando sí aporta)

### 6.1 S — Single Responsibility
- Un componente UI no debería manejar también HTTP + mapping + lógica compleja.
- Separar: **UI (presentational)** vs **Container/Controller** (hooks + acciones).

### 6.2 O — Open/Closed
- Componentes extensibles por props y composición (children/slots).
- Evitar condicionales gigantes; preferir subcomponentes o mapas de configuración.

### 6.3 L — Liskov
- No romper contratos al extender componentes.
- Prop `disabled` no debe ejecutar acciones.

### 6.4 I — Interface Segregation
- Props pequeñas y específicas; evitar pasar objetos enormes “por si acaso”.
- Separar tipos por caso de uso (ej.: `UserSummary` vs `UserDetail`).

### 6.5 D — Dependency Inversion
- Dominio/casos de uso dependen de **abstracciones**, no de `fetch` directo.
- Implementaciones reales viven en `infrastructure` y se inyectan (factory/provider).

---

## 7. Clean Architecture (cuando vale la pena)
No es obligatorio aplicar todas las capas en features simples. Úsela cuando haya reglas de negocio, integraciones o complejidad creciente.

- `domain/`: entidades y reglas del negocio (**sin React, sin Next, sin APIs**).
- `application/`: casos de uso (orquestan reglas + puertos).
- `infrastructure/`: implementaciones (API clients, storage, adapters).
- `presentation/`: UI (componentes, páginas, hooks).

Regla: dependencias apuntan hacia adentro (**UI → application → domain**).

---

## 8. Componentes UI y diseño
- Preferir componentes presentacionales puros y mantener el estado en hooks/containers.
- No hardcodear strings repetidos: centralizar copy si se reutiliza.
- Accesibilidad: labels, `aria-*` cuando corresponda, foco visible.
- Diseño consistente: espaciado/tipografía con tokens/clases estándar del proyecto.
- Evitar estilos inline salvo casos puntuales.

---

## 9. Estado y side-effects
- Estado local (`useState`) para UI simple; elevar estado solo cuando sea necesario.
- Evitar prop drilling excesivo: usar context o store por feature si aplica.
- `useEffect`: dependencias correctas; separar efectos por intención.
- Nunca disparar side-effects en render; hacerlo en handlers/efectos controlados.

---

## 10. Data fetching y Server/Client Components
- Definir qué es Server Component y qué es Client Component de forma explícita.
- No convertir todo a `'use client'` por comodidad; solo donde se necesite interacción.
- Data fetching en servidor cuando sea seguro y simple; en cliente solo si lo requiere UX.
- En límites externos (API) mapear **DTO → tipos internos** (no filtrar DTOs directo a UI).

---

## 11. Validación y manejo de errores
- Errores visibles y accionables (mensaje claro).
- Manejar `loading/empty/error` states en cada pantalla/feature.
- Validar entradas en el borde (form) y validar respuestas externas antes de usarlas.
- No ocultar errores silenciosamente; loggear en el entorno adecuado.

---

## 12. Formato, linting y consistencia
- Usar Prettier + ESLint con reglas consistentes en el repo.
- Orden de imports: built-in → external → internal.
- Prohibido mergear con errores de lint o typecheck.
- Husky/lint-staged recomendado para pre-commit si el proyecto lo permite.

---

## 13. Git y convenciones de trabajo
- Commits claros: `tipo(alcance): mensaje`. Ej.: `feat(auth): add cognito login UI`.
- Branches por feature/fix. PRs pequeños y revisables.
- Descripción de PR: qué cambió, por qué, cómo probar, screenshots si es UI.
- Evitar commits masivos con cambios no relacionados.

---

## 14. Reglas de seguridad mínimas
- Nunca subir secretos al repo. Usar env vars y secretos gestionados.
- Validar/escapar contenido proveniente de usuarios si se renderiza.
- Evitar exponer información sensible en errores del cliente.
- Revisar dependencias y actualizar si hay vulnerabilidades relevantes.

---

## 15. Checklist rápido antes de entregar
1. Build y typecheck pasan sin errores.
2. No hay `console.log`/`debugger` ni código muerto.
3. Lo nuevo respeta naming y estructura.
4. UI responsive validada (mobile/desktop).
5. Estados `loading/empty/error` manejados.
6. Sin hardcodes innecesarios (copy, URLs, colores) si existe configuración.
