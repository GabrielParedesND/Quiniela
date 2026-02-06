# Quiniela Mundialista - USA 2026

Plataforma web de Quiniela para la Copa Mundial 2026 construida con Next.js, Tailwind CSS v4, SST v3 y Amazon Cognito.

## Stack Tecnológico

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** (theming por JSON con CSS variables)
- **SST v3** (infraestructura y despliegue)
- **Amazon Cognito** (autenticación real)
- **React 19**

## Estructura del Proyecto

```
src/
├── app/                    # Rutas Next.js (App Router)
│   ├── page.tsx           # Login
│   ├── onboarding/        # Registro
│   ├── dashboard/         # Dashboard principal
│   ├── predictions/       # Pronósticos
│   ├── results/           # Resultados y ranking
│   └── teams/             # Ranking de equipos
├── components/            # Componentes reutilizables
│   ├── AppShell.tsx      # Layout autenticado
│   ├── Navbar.tsx        # Barra de navegación
│   ├── SponsorBanner.tsx # Banner de patrocinador
│   └── ThemeProvider.tsx # Proveedor de temas
├── lib/
│   ├── auth/
│   │   └── cognito.ts    # Utilidades de autenticación
│   ├── theme/
│   │   ├── types.ts      # Tipos de tema
│   │   └── theme.ts      # Loader de temas
│   └── mock.ts           # Datos mock tipados
└── data/
    └── themes/
        └── default.json   # Tema por defecto
```

## Características Implementadas

### Iteración 1 (Actual)

✅ **Autenticación con Cognito**
- Login con email/password
- Registro con datos personales (DPI, teléfono, edad)
- Logout funcional
- Protección de rutas autenticadas

✅ **Theming Parametrizable**
- Sistema de temas basado en JSON
- CSS variables para todos los colores
- Sin colores hardcodeados en componentes

✅ **Navegación Completa**
- Dashboard con resumen de puntos
- Pronósticos por jornadas (con tabs)
- Resultados con gráficos y detalle
- Ranking de usuarios con categorías
- Ranking de equipos por grupos

✅ **UI Responsive**
- Mobile-first design
- Componentes reutilizables
- Animaciones y transiciones

✅ **Datos Mock**
- Equipos, partidos, predicciones
- Cálculo de puntos (mock)
- Rankings y categorías

## Comandos

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo con SST
npm run dev
```

Esto iniciará:
1. SST en modo dev (crea recursos de AWS si no existen)
2. Next.js en http://localhost:3000
3. Cognito User Pool configurado automáticamente

### Despliegue

```bash
# Desplegar a AWS
npm run deploy

# Remover recursos de AWS
npm run remove
```

## Configuración de Cognito

SST crea automáticamente:
- **User Pool** con autenticación por email
- **User Pool Client** para la aplicación
- **Variables de entorno** inyectadas automáticamente:
  - `NEXT_PUBLIC_USER_POOL_ID`
  - `NEXT_PUBLIC_USER_POOL_CLIENT_ID`
  - `NEXT_PUBLIC_AWS_REGION`

**No se requiere archivo `.env`** - SST maneja las credenciales de forma nativa.

## Flujo de Autenticación

1. **Login** (`/`): Email + contraseña → Cognito
2. **Registro** (`/onboarding`): Datos personales → Cognito sign up → Auto login
3. **Rutas protegidas**: Verifican sesión de Cognito antes de renderizar
4. **Logout**: Cierra sesión de Cognito y redirige a login

## Datos Mock

Todos los datos están en `src/lib/mock.ts`:
- 8 equipos en 4 grupos
- 8 partidos en 3 jornadas
- Predicciones de ejemplo
- Ranking de usuarios
- Posiciones de equipos

**Nota**: El cálculo de puntos es mock. No hay persistencia real de pronósticos.

## Theming

Para cambiar el tema, edita `src/data/themes/default.json`:

```json
{
  "name": "default",
  "colors": {
    "bg": "#f1f5f9",
    "surface": "#ffffff",
    "primary": "#2563eb",
    ...
  }
}
```

Los colores se aplican automáticamente como CSS variables.

## Próximas Iteraciones

- [ ] Persistencia real de pronósticos (DynamoDB)
- [ ] Cálculo real de puntos con reglas de negocio
- [ ] Cierre automático de jornadas
- [ ] Notificaciones
- [ ] Admin panel
- [ ] Analytics

## Notas de Desarrollo

- **Clean Code**: Componentes pequeños y enfocados
- **SOLID**: Separación de responsabilidades (UI, lógica, datos)
- **Clean Architecture**: Dominio separado de infraestructura
- **TypeScript**: Tipado estricto, sin `any`
- **Tailwind v4**: Clases utilitarias + CSS variables

## Soporte

Para problemas o preguntas, consulta:
- `.amazonq/rules/developer-rules.md` - Reglas de desarrollo
- `.amazonq/rules/initial.md` - Especificaciones del proyecto
