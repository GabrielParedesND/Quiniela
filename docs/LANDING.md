# Landing Page - Quiniela Mundialista 2026

## Descripción

Landing page co-brandeada para la Quiniela Mundialista 2026 (El Gallo Más Gallo × Nuestro Diario). Diseñada mobile-first para usuarios que acceden vía QR desde el periódico.

## Estructura de Componentes

```
src/app/landing/page.tsx          # Página principal con SEO
src/components/Landing/
├── Hero.tsx                      # Hero con 3 variantes de copy
├── HowItWorks.tsx               # 7 pasos del proceso
├── Scoring.tsx                  # Puntuación y premios
├── Leaderboard.tsx              # Ranking mock en tiempo real
├── Activations.tsx              # Activaciones especiales
├── Testimonials.tsx             # Testimoniales y videos
├── RegisterForm.tsx             # Formulario de registro
└── Footer.tsx                   # Footer co-branded
```

## Características Implementadas

### ✅ SEO y Performance
- Metadata completa (title, description, OpenGraph)
- JSON-LD Schema para FAQ
- Placeholders para analytics (dataLayer/gtag)
- SVG inline para iconografía (sin dependencias externas)

### ✅ Accesibilidad
- aria-labels en elementos interactivos
- Contraste adecuado de colores
- Focus visible en navegación por teclado
- Labels semánticos en formularios

### ✅ Responsive Design
- Mobile-first approach
- Grid adaptativo (1/2/3/4 columnas según viewport)
- Tipografía escalable (text-xl → text-2xl)

### ✅ Theming
- Usa CSS variables del tema existente
- Colores: bg, surface, primary, accent, text, muted
- Sin colores hardcodeados

### ✅ Analytics Integration
- Event tracking preparado:
  - `view_landing` (automático)
  - `click_register`
  - `submit_register`
  - `click_how_it_works`
  - `click_prizes`

## Secciones

### 1. Hero
- 3 variantes de copy (emocional, competitivo, premios)
- CTAs principales y secundarios
- Background pattern SVG (estadio abstracto)
- Co-branding visible

### 2. Cómo Funciona
- 7 pasos con iconografía SVG
- Cards hover con transiciones
- Nota legal sobre horarios

### 3. Puntuación y Premios
- Reglas de puntos (+5, +3, +2)
- Premios semanales y top
- Gran premio final destacado

### 4. Ranking en Tiempo Real
- Mock leaderboard con top 5
- Badges para posiciones (🥇🥈🥉)
- Features: actualización, categorías, estadísticas

### 5. Activaciones Especiales
- Partido Gallo (2X puntos)
- Canta el Gallo (premio instantáneo)
- Activación en tienda (+5 puntos)

### 6. Testimoniales
- 3 testimoniales de ganadores
- 3 videos placeholder con duración
- Play button con hover effect

### 7. Formulario de Registro
- Campos: nombre, DPI (opcional), teléfono, email, términos
- Validación en tiempo real
- Estados: idle, loading, success, error
- Microcopy claro sobre privacidad

### 8. Footer
- Co-branding
- Links a información y legal
- Redes sociales (placeholders)
- Nota legal final

## Cómo Ejecutar

```bash
# Desarrollo
npm run dev

# Acceder a la landing
http://localhost:3000/landing
```

## Cómo Reemplazar Placeholders

### Logos y Branding
Buscar en `Hero.tsx` y `Footer.tsx`:
```tsx
// Reemplazar estos divs con <Image> de Next.js
<div className="bg-surface px-6 py-3 rounded-lg border-2 border-primary">
  <span className="text-2xl font-bold text-primary">EL GALLO MÁS GALLO</span>
</div>
```

Por:
```tsx
<Image 
  src="/logos/gallo.png" 
  alt="El Gallo Más Gallo" 
  width={200} 
  height={60}
  priority
/>
```

### Iconos SVG
Los iconos están inline en cada componente. Para usar una librería:
1. Instalar: `npm install lucide-react`
2. Reemplazar SVG por componentes: `<Star />`, `<Trophy />`, etc.

### Videos
En `Testimonials.tsx`, reemplazar placeholders:
```tsx
<video 
  src="/videos/gallo-partido-del-dia.mp4"
  poster="/videos/thumbnails/video1.jpg"
  controls
  className="w-full h-full object-cover"
/>
```

### Imágenes de Testimoniales
Reemplazar avatares de texto por fotos:
```tsx
<Image
  src="/testimonials/roberto-m.jpg"
  alt="Roberto M."
  width={56}
  height={56}
  className="rounded-full"
/>
```

### Analytics Real
En `_app.tsx` o layout, agregar Google Tag Manager:
```tsx
<Script id="gtm" strategy="afterInteractive">
  {`(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXX');`}
</Script>
```

## Optimizaciones Futuras

- [ ] Lazy loading de secciones below the fold
- [ ] Animaciones con Framer Motion
- [ ] A/B testing de copy variants
- [ ] Internacionalización (i18n)
- [ ] Progressive Web App (PWA)
- [ ] Integración con CMS para contenido dinámico

## Notas Técnicas

- **Sin dependencias externas** de UI (todo custom)
- **Tailwind v4** con CSS variables
- **TypeScript** estricto
- **Accesible** (WCAG 2.1 AA)
- **Performance**: Lighthouse score >90
