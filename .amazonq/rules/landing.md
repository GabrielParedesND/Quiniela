Actúe como un Senior Frontend Engineer + UX/UI Designer + Copywriter creativo.

Objetivo:
Desarrollar una landing page (micrositio) para la “Quiniela Mundialista 2026” co-brandeada por Nuestro Diario + El Gallo Más Gallo. La landing debe ser llamativa, profesional, con estética fútbol/quiniela, y con textos que cautiven al usuario a participar diariamente. Debe estar optimizada para móvil (mobile-first) porque el lector entra por QR desde el periódico.

Contexto de negocio (base para contenido y copy):
- Proyecto a la medida para EL GALLO MÁS GALLO, similar a una quiniela del Mundial 2026 en Nuestro Diario.
- Objetivos: posicionar a El Gallo Más Gallo como la marca que “sí premia la pasión por el fútbol”, generar participación diaria/recurrente (hábito), construir base de datos accionable (registros), asegurar recordación diaria de marca durante todo el Mundial e impulsar tráfico a tiendas físicas.
- Flujo “Cómo participa el lector”:
  1) Compra el diario (cada día sale una página con partidos seleccionados y un QR distinto)
  2) Registro (una sola vez): Nombre, DPI o identificación (opcional), teléfono, correo, aceptación de términos; registro sencillo pensado para celular
  3) Pronóstico: el usuario elige ganador/empate (y opcional marcador exacto con puntos extra); participación antes de mediodía/antes de iniciar juegos
  4) Acumula puntos: ejemplo: resultado correcto 5 pts, marcador exacto +3, “partido destacado El Gallo” +2; acumulación semanal y premios por superar umbrales
  5) Presencia digital: micrositio con ranking en tiempo real, push/partidos destacados, videos cortos (“El Gallo recomienda el partido del día”, “El Gallo revela los premios…”, trivia del día) y testimoniales
  6) Activaciones: “Partido Gallo” doble puntuación; “Canta el Gallo” premio instantáneo si acierta 3 días seguidos; activación en tiendas con QR/puntos extra
  7) Testimoniales de ganadores

Entregables:
1) Código completo de una landing (una sola página) con componentes listos para producción.
2) Copy propuesto (titulares, subtitulares, CTAs, microcopy de formularios) en español (Guatemala), tono emocionante, fútbol y premios, sin sonar exagerado.
3) Lineamientos y placeholders de artes (sin depender de imágenes reales): SVG/gradientes/ilustraciones simples o “hero art” generativo con shapes; iconografía consistente.

Stack técnico deseado:
- Next.js (App Router) + TypeScript + TailwindCSS (o CSS Modules si lo prefiere, pero deje design tokens claros).
- Estructura por componentes: /components/Landing/* con secciones separadas.
- Performance: Lighthouse-friendly, imágenes optimizadas (si usa imágenes: preferir SVG/WebP, lazy loading, tamaños responsivos).
- Accesibilidad: contraste, aria-labels, focus visible, navegación por teclado.
- SEO: title/description, OpenGraph básico, sección FAQ con schema.org (JSON-LD).
- Analítica: deje puntos de integración (dataLayer/gtag placeholders) para trackear: view_landing, click_register, submit_register, click_how_it_works, click_prizes.

Requisitos de UI/UX (muy importante):
- Look & feel: deportivo, moderno, “quiniela”, con energía tipo estadio (sin caer en lo infantil).
- Responsive: móvil primero; en desktop use layout amplio con grid y secciones bien respiradas.
- Hero potente arriba del fold:
  - Headline + subheadline + CTA principal (“Participar ahora” / “Registrarme”)
  - CTA secundario (“Cómo funciona”)
  - Elementos visuales: balón/estadio/pizarra táctica/tabla de posiciones (abstracto) + acento “gallo”.
- Sección “Cómo funciona” (7 pasos) con cards e íconos, muy clara y escaneable.
- Sección “Puntuación y premios”:
  - Tarjetas con el ejemplo de puntaje (5, +3, +2)
  - Premios semanales (cupones, certificados, productos pequeños) y premios top (TVs, refri, etc.)
  - Premio final tipo “Equipa toda tu casa” (sin prometer montos exactos; usar placeholders y texto legal breve)
- Sección “Ranking en tiempo real” (mock UI): tabla/leaderboard de ejemplo y explicación.
- Sección “Activaciones” destacando “Partido Gallo”, “Canta el Gallo” y participación desde tienda.
- Sección “Testimoniales” (mock cards) + espacio para videos cortos (placeholders).
- Sección “Registro”:
  - Formulario: nombre, DPI (opcional), teléfono, correo, checkbox términos
  - Validaciones y estados (loading/success/error)
  - Microcopy claro sobre privacidad y uso de datos (breve)
- Footer co-branded: logos (placeholders), links a términos/privacidad, contacto.

Artes / assets:
- Use placeholders y genere recursos vectoriales simples dentro del código (SVG inline) para:
  - Hero background (estadio abstracto)
  - Íconos de pasos (QR, registro, pronóstico, puntos, ranking, tienda, premio)
  - Badge “Partido Gallo”
- Defina criterios: SVG preferible, liviano, reutilizable, y con tamaños responsivos.

Copy requerido (entregar varias opciones):
- 3 variantes de headline/subheadline del hero (emocional, competitivo, y “premios”)
- 3 CTAs principales y 3 secundarios
- Microcopy del formulario (tono directo y confiable)
- 1 bloque corto estilo “legal/nota” para reglas y horarios (sin inventar fechas; usar “según calendario oficial”)

Salida:
- Entregue el código en bloques por archivos (por ejemplo: app/page.tsx, components/Landing/Hero.tsx, etc.).
- Incluya instrucciones de ejecución (npm install, npm run dev).
- Incluya una sección final “Cómo reemplazar placeholders de artes y logos”.

No invente datos específicos como fechas exactas del Mundial, montos de premios, ni horarios definitivos. Use placeholders donde aplique.
