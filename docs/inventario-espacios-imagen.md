# Inventario de Espacios de Imagen — Quiniela v1

**Fecha:** Abril 2026  
**Proyecto:** quiniela-v1 (Cliente de Quiniela)  
**Propósito:** Guía para el departamento creativo con medidas, ubicaciones y especificaciones de todos los espacios que requieren artes gráficos.

---

## Índice

1. [Mapa Visual de Espacios](#mapa-visual-de-espacios)
2. [Espacios de Branding (CMS)](#espacios-de-branding-cms)
3. [Espacios Publicitarios (Ad Slots)](#espacios-publicitarios-ad-slots)
4. [Resumen de Tamaños para Artes](#resumen-de-tamaños-para-artes)
5. [Especificaciones Técnicas](#especificaciones-técnicas)
6. [Archivos Actuales](#archivos-actuales)

---

## Mapa Visual de Espacios

### Dashboard (páginas autenticadas: Home, Pronósticos, Resultados, Equipos)

```
┌─────────────────────────────────────────────────────────┐
│                      NAVBAR                             │
│  [Logo 96×96]                          [Avatar] [Menú] │
├─────────────────────────────────────────────────────────┤
│              ┌─────────────────────┐                    │
│              │  AD BANNER 728×90   │  ← ad-container-   │
│              │  (Espacio publicit.)│    main             │
│              └─────────────────────┘                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │         USER CARD  (fondo: 400×150)             │    │
│  │  [Avatar]  Nombre         Puntos: 120           │    │
│  │            Participante   [Ver resultados →]    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ ⚽ Pronosticar   │  │ 📈 Posiciones    │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  PROMO BANNER (Patrocinadores)                  │    │
│  │  ┌──────────┐  Master: 200×80                   │    │
│  │  │  MASTER  │  Gold:   120×60 (×2)              │    │
│  │  └──────────┘  Silver:  80×40 (×3)              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                      FOOTER                             │
│  [Logo 160w]   Enlaces   Legal                          │
│  Descripción   Cómo Jugar Términos                     │
│                Premios    Privacidad                    │
│                © 2026 Título del sitio                  │
└─────────────────────────────────────────────────────────┘

Fondo de pantalla: 1920×1080 (detrás de todo el contenido)
```

### Landing Page (página pública)

```
┌──────┬──────────────────────────────────────────┬──────┐
│      │                                          │      │
│  L   │              HERO SECTION                │  L   │
│  A   │                                          │  A   │
│  T   ├──────────────────────────────────────────┤  T   │
│  E   │           CÓMO FUNCIONA                  │  E   │
│  R   ├──────────────────────────────────────────┤  R   │
│  A   │            PUNTUACIÓN                    │  A   │
│  L   ├──────────────────────────────────────────┤  L   │
│      │           LEADERBOARD                    │      │
│  I   ├──────────────────────────────────────────┤  D   │
│  Z   │          ACTIVACIONES                    │  E   │
│  Q   ├──────────────────────────────────────────┤  R   │
│  U   │     ┌─────────────────────┐              │  E   │
│  I   │     │  AD BANNER 728×90   │ ← ad-       │  C   │
│  E   │     │  (Espacio publicit.)│   container- │  H   │
│  R   │     └─────────────────────┘   landing    │  O   │
│  D   ├──────────────────────────────────────────┤      │
│  O   │          TESTIMONIALS                    │ 160  │
│      ├──────────────────────────────────────────┤  ×   │
│ 160  │              FOOTER                      │ 600  │
│  ×   │                                          │      │
│ 600  │                                          │      │
└──────┴──────────────────────────────────────────┴──────┘

Laterales: Solo visibles en pantallas ≥1536px (monitores grandes)
IDs: ad-container-lateral-left / ad-container-lateral-right
```

### Página de Resultados

```
┌─────────────────────────────────────────────────────────┐
│                      NAVBAR + AD BANNER                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Puntos por Jornada (gráfico de barras)                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  RANKING CARD  (fondo: 400×120)                 │    │
│  │                          Fase: Zona de Campeones│    │
│  │                          Posición #3            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Tabla de Ranking                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Espacios de Branding (CMS)

Estos espacios se configuran desde el CMS en la sección de Proyectos → Personalización.

### 1. Logo Principal
- **Ubicación:** Navbar, footer, página de login
- **Medida recomendada:** `96 × 96 px`
- **Formato:** SVG (preferido), PNG con transparencia
- **Notas:** Se muestra a ~112px de ancho en navbar, ~160px en footer. Fondo transparente obligatorio.

### 2. Banner de Patrocinador (SponsorBanner)
- **Ubicación:** Actualmente oculto (reemplazado por espacio publicitario)
- **Medida recomendada:** `600 × 60 px`
- **Formato:** SVG, PNG
- **Notas:** Contenedor de 64px de alto. Imagen centrada con ajuste proporcional. Fondo transparente.

### 3. Fondo de Pantalla (Background)
- **Ubicación:** Imagen fija detrás de todo el contenido en páginas autenticadas
- **Medida recomendada:** `1920 × 1080 px`
- **Formato:** SVG, JPG, WebP
- **Notas:** Se muestra con recorte desde la parte superior. Imagen de alta resolución. Considerar que habrá contenido superpuesto con cards y texto.

### 4. Card de Usuario
- **Ubicación:** Dashboard — tarjeta principal con nombre y puntos
- **Medida recomendada:** `400 × 150 px`
- **Formato:** SVG, PNG, WebP
- **Notas:** Se usa como fondo de la tarjeta. Puede tener transparencia parcial. Texto blanco/oscuro se superpone.

### 5. Card de Ranking
- **Ubicación:** Página de Resultados — tarjeta de posición y fase
- **Medida recomendada:** `400 × 120 px`
- **Formato:** SVG, PNG, WebP
- **Notas:** Fondo decorativo. Se superpone texto blanco (posición, fase). Diseño oscuro recomendado para contraste.

### 6. Patrocinador Master
- **Ubicación:** Dashboard — sección de patrocinadores (PromoBanner)
- **Medida recomendada:** `200 × 80 px` (por logo)
- **Formato:** SVG, PNG con transparencia
- **Notas:** Se muestra centrado, 1 logo a la vez con carrusel. Altura máxima visible: 64px.

### 7. Patrocinadores Gold
- **Ubicación:** Dashboard — sección de patrocinadores
- **Medida recomendada:** `120 × 60 px` (por logo)
- **Formato:** SVG, PNG con transparencia
- **Notas:** Grid de 2 columnas. Altura máxima visible: 40px. Se pueden agregar múltiples logos.

### 8. Patrocinadores Silver
- **Ubicación:** Dashboard — sección de patrocinadores
- **Medida recomendada:** `80 × 40 px` (por logo)
- **Formato:** SVG, PNG con transparencia
- **Notas:** Grid de 3 columnas. Altura máxima visible: 24px. Se pueden agregar múltiples logos.

### 9. Avatares de Perfil
- **Ubicación:** Onboarding, perfil, navbar, dashboard
- **Medida recomendada:** `96 × 96 px` (cuadrado)
- **Formato:** SVG
- **Notas:** Set de ~80 camisetas de fútbol predefinidas. Fondo transparente. No se configuran desde CMS.

---

## Espacios Publicitarios (Ad Slots)

Estos espacios están preparados para Google Ad Manager. Actualmente muestran imágenes placeholder con rotación automática.

### 1. Banner Dashboard
- **ID del contenedor:** `ad-container-main`
- **Ubicación:** Entre el Navbar y el contenido principal. Visible en TODAS las páginas autenticadas (Home, Pronósticos, Resultados, Equipos).
- **Estándar IAB:** Leaderboard
- **Comportamiento:** Rotación automática cada 5 segundos con crossfade

| Dispositivo | Breakpoint | Tamaño del arte | Estándar IAB |
|-------------|-----------|-----------------|-------------|
| **Desktop** | ≥1024px | **728 × 90 px** | Leaderboard |
| **Tablet** | 768-1023px | **468 × 60 px** | Full Banner |
| **Mobile** | 320-767px | **320 × 50 px** | Mobile Banner |

> **Prioridad de entrega:** Desktop (728×90) es el tamaño principal. El contenedor usa `object-cover` para adaptar.

### 2. Banner Landing
- **ID del contenedor:** `ad-container-landing`
- **Ubicación:** Landing page, entre la sección "Activaciones Especiales" y "Testimonials"
- **Estándar IAB:** Leaderboard
- **Comportamiento:** Rotación automática cada 5 segundos con crossfade

| Dispositivo | Breakpoint | Tamaño del arte | Estándar IAB |
|-------------|-----------|-----------------|-------------|
| **Desktop** | ≥1024px | **728 × 90 px** | Leaderboard |
| **Tablet** | 768-1023px | **468 × 60 px** | Full Banner |
| **Mobile** | 320-767px | **320 × 50 px** | Mobile Banner |

> **Nota:** Usa las mismas imágenes que el Banner Dashboard.

### 3. Lateral Izquierdo
- **ID del contenedor:** `ad-container-lateral-left`
- **Ubicación:** Landing page, costado izquierdo, posición fija (sticky)
- **Estándar IAB:** Wide Skyscraper
- **Comportamiento:** Imagen fija (sin rotación desde código). Rotación gestionable desde Ad Manager.

| Dispositivo | Breakpoint | Tamaño del arte | Visibilidad |
|-------------|-----------|-----------------|-------------|
| **Monitor grande** | ≥1536px | **160 × 600 px** | ✅ Visible |
| **Laptop/Desktop** | 1024-1535px | N/A | ❌ Oculto |
| **Tablet** | 768-1023px | N/A | ❌ Oculto |
| **Mobile** | 320-767px | N/A | ❌ Oculto |

### 4. Lateral Derecho
- **ID del contenedor:** `ad-container-lateral-right`
- **Ubicación:** Landing page, costado derecho, posición fija (sticky)
- **Estándar IAB:** Wide Skyscraper
- **Comportamiento:** Imagen fija (sin rotación desde código). Rotación gestionable desde Ad Manager.

| Dispositivo | Breakpoint | Tamaño del arte | Visibilidad |
|-------------|-----------|-----------------|-------------|
| **Monitor grande** | ≥1536px | **160 × 600 px** | ✅ Visible |
| **Laptop/Desktop** | 1024-1535px | N/A | ❌ Oculto |
| **Tablet** | 768-1023px | N/A | ❌ Oculto |
| **Mobile** | 320-767px | N/A | ❌ Oculto |

---

## Resumen de Tamaños para Artes

### Artes de Branding (configurados desde CMS)

| Arte | Tamaño (px) | Formato | Transparencia |
|------|------------|---------|---------------|
| Logo principal | 96 × 96 | SVG/PNG | ✅ Sí |
| Banner patrocinador | 600 × 60 | SVG/PNG | ✅ Sí |
| Fondo de pantalla | 1920 × 1080 | JPG/WebP | ❌ No |
| Card de usuario | 400 × 150 | SVG/PNG/WebP | Parcial |
| Card de ranking | 400 × 120 | SVG/PNG/WebP | Parcial |
| Logo Master | 200 × 80 | SVG/PNG | ✅ Sí |
| Logo Gold | 120 × 60 | SVG/PNG | ✅ Sí |
| Logo Silver | 80 × 40 | SVG/PNG | ✅ Sí |

### Artes Publicitarios (Ad Slots)

| Arte | Tamaño Desktop | Tamaño Mobile | Formato | Peso máx. |
|------|---------------|---------------|---------|-----------|
| Banner (Dashboard + Landing) | **728 × 90 px** | 320 × 50 px | JPG/PNG/WebP | 150 KB |
| Lateral izquierdo | **160 × 600 px** | N/A | JPG/PNG/WebP | 200 KB |
| Lateral derecho | **160 × 600 px** | N/A | JPG/PNG/WebP | 200 KB |

---

## Especificaciones Técnicas

### Formatos aceptados
- **SVG:** Preferido para logos y gráficos vectoriales. Escala sin pérdida.
- **PNG:** Para imágenes con transparencia que no pueden ser SVG.
- **JPG:** Para fotografías y fondos sin transparencia. Calidad 80-90%.
- **WebP:** Alternativa moderna con mejor compresión. Soporte universal en navegadores modernos.

### Resolución
- Entregar en **2x** para pantallas Retina cuando sea posible (ej: logo 96×96 → entregar 192×192).
- Para fondos de pantalla, 1920×1080 es suficiente (no necesita 2x).

### Peso máximo recomendado
- Logos: < 50 KB
- Banners publicitarios: < 150 KB
- Laterales publicitarios: < 200 KB
- Fondos de pantalla: < 500 KB
- Cards (usuario/ranking): < 100 KB

### Paleta de colores
Los colores del sitio se configuran desde el CMS (color primario y secundario). Los artes deben ser compatibles con fondos claros y oscuros según la configuración del proyecto.

### Ruta de archivos publicitarios
```
quiniela-v1/public/assets/ADS/
├── BANNER/          ← Banners (728×90)
│   ├── banner1.jpeg
│   ├── banner2.jpg
│   ├── banner3.jpg
│   └── banner4.png
└── LATERAL/         ← Laterales (160×600)
    ├── lateral1.jpeg
    ├── lateral2.jpeg
    └── lateral3.jpg
```

---

## Archivos Actuales

### Branding (defaults en `/public/assets/`)
| Archivo | Espacio |
|---------|---------|
| `LOGO LARGE 96x96.svg` | Logo principal |
| `BANNER SPONSOR 600X60.svg` | Banner patrocinador |
| `DASHBOARD 1920X1080.svg` | Fondo de pantalla |
| `CARD USER 400x150.svg` | Card de usuario |
| `MASTER LOGO 200X80.svg` | Patrocinador Master |
| `LOGO GOLD 1 120X60.svg` | Patrocinador Gold 1 |
| `LOGO GOLD 2 120X60.svg` | Patrocinador Gold 2 |
| `LOGO SILVER 1 80X40.svg` | Patrocinador Silver 1 |
| `LOGO SILVER 2 80X40.svg` | Patrocinador Silver 2 |
| `LOGO SILVER 3 80X40.svg` | Patrocinador Silver 3 |

### Publicitarios (en `/public/assets/ADS/`)
| Archivo | Espacio | Tamaño esperado |
|---------|---------|-----------------|
| `BANNER/banner1.jpeg` | Banner Dashboard + Landing | 728 × 90 |
| `BANNER/banner2.jpg` | Banner Dashboard + Landing | 728 × 90 |
| `BANNER/banner3.jpg` | Banner Dashboard + Landing | 728 × 90 |
| `BANNER/banner4.png` | Banner Dashboard + Landing | 728 × 90 |
| `LATERAL/lateral1.jpeg` | Lateral izquierdo | 160 × 600 |
| `LATERAL/lateral2.jpeg` | Lateral derecho | 160 × 600 |
| `LATERAL/lateral3.jpg` | Lateral (reserva) | 160 × 600 |
