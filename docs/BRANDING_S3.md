# Branding con imágenes en S3

La tabla `BrandingConfigTable` puede guardar URLs completas de imágenes (S3/CloudFront) en `assets` y `sponsors`.

## Variable de entorno

Si quieres enviar rutas relativas (`/assets/...`) y que el backend las convierta automáticamente a URL completa, define:

`NEXT_PUBLIC_BRAND_ASSETS_BASE_URL=https://tu-cdn-o-bucket.s3.amazonaws.com`

## Infra en SST

El proyecto ahora crea un bucket `BrandingAssetsBucket` con acceso público y expone:

- `BRAND_ASSETS_BUCKET_NAME`
- `NEXT_PUBLIC_BRAND_ASSETS_BASE_URL`

## Script de migración automática

Se agregó el script `scripts/sync-branding-s3.mjs` que:

1. Sube todo `public/assets/**` al bucket S3.
2. Actualiza el item de `BrandingConfigTable` convirtiendo rutas `/assets/...` a URLs S3.

### Ejecutar en entorno SST

```bash
sst shell -- npm run branding:sync:s3
```

### Variables opcionales

- `TOURNAMENT_ID` (default: `world-cup-2026-demo`)
- `BRANDING_ID` (si quieres actualizar un branding específico)
- `S3_ASSETS_PREFIX` (default: `assets`)
- `SYNC_SKIP_UPLOAD=1` (solo actualizar Dynamo)
- `SYNC_SKIP_DYNAMO=1` (solo subir archivos)

## Ejemplo de item en DynamoDB

```json
{
  "brandingId": "world-cup-2026-demo#default",
  "tournamentId": "world-cup-2026-demo",
  "themeName": "default",
  "updatedAt": "2026-02-26T00:00:00.000Z",
  "theme": {
    "name": "default",
    "colors": {
      "general": {
        "background": "#f8fafc",
        "text": "#0f172a",
        "textSecondary": "#475569"
      },
      "components": {
        "buttons": {
          "background": "#1d4ed8",
          "text": "#ffffff",
          "hover": "#1e40af"
        },
        "cards": {
          "background": "#ffffff",
          "backgroundAlt": "#f1f5f9",
          "border": "#e2e8f0"
        },
        "navbar": {
          "accent": "#0ea5e9"
        }
      },
      "accents": {
        "primary": "#1d4ed8",
        "secondary": "#0ea5e9",
        "tertiary": "#f59e0b"
      },
      "states": {
        "success": "#10b981",
        "warning": "#f59e0b",
        "error": "#ef4444",
        "info": "#3b82f6"
      }
    }
  },
  "assets": {
    "logos": {
      "main": "https://cdn.example.com/branding/logo-main.svg",
      "large": "https://cdn.example.com/branding/logo-large.svg",
      "small": "https://cdn.example.com/branding/logo-small.svg"
    },
    "banners": {
      "sponsor": "https://cdn.example.com/branding/banner-sponsor.svg"
    },
    "social": {
      "google": "https://cdn.example.com/branding/google-icon.svg",
      "facebook": "https://cdn.example.com/branding/facebook-icon.svg"
    },
    "backgrounds": {
      "dashboard": "https://cdn.example.com/branding/dashboard-bg.svg",
      "userCard": "https://cdn.example.com/branding/user-card-bg.svg"
    },
    "cardBackgrounds": {
      "blue": "https://cdn.example.com/branding/card-blue.svg",
      "emerald": "https://cdn.example.com/branding/card-emerald.svg",
      "orange": "https://cdn.example.com/branding/card-orange.svg"
    }
  },
  "sponsors": {
    "master": ["https://cdn.example.com/sponsors/master-1.svg"],
    "gold": [
      "https://cdn.example.com/sponsors/gold-1.svg",
      "https://cdn.example.com/sponsors/gold-2.svg"
    ],
    "silver": [
      "https://cdn.example.com/sponsors/silver-1.svg",
      "https://cdn.example.com/sponsors/silver-2.svg",
      "https://cdn.example.com/sponsors/silver-3.svg"
    ]
  },
  "meta": {
    "appTitle": "Quiniela Mundialista 2026",
    "appDescription": "Pronostica, compite y gana."
  }
}
```
