# Modo Demo (Mock)

Para activar el flujo demo (sin Cognito ni Dynamo para usuario/quiniela):

```bash
NEXT_PUBLIC_DEMO_MODE=true npm run dev
```

También puedes usar archivo de entorno:

```bash
cp .env.demo .env.local
npm run dev
```

Si usas SST:

```bash
NEXT_PUBLIC_DEMO_MODE=true npx sst dev
```

## Qué cambia al activar demo

- Login/Auth funciona con sesión local (localStorage).
- Perfil de usuario se guarda en localStorage.
- Quiniela (equipos, partidos, ranking y predicciones) usa `src/lib/mock.ts` y `src/lib/demo.ts`.
- Predicciones se persisten en localStorage.

## Limpieza de sesión demo

En el navegador elimina:

- `quiniela_demo_session`
- `quiniela_demo_user_id`
- `quiniela_demo_profile`
- `quiniela_predictions`
