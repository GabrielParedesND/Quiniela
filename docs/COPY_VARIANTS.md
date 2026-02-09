# Copy Variants - Quiniela Mundialista 2026

## Headlines del Hero (3 variantes)

### 1. Emocional
**Headline:** ¡Vive la Pasión del Mundial 2026!  
**Subheadline:** Demuestra que eres el verdadero conocedor del fútbol y gana increíbles premios

### 2. Competitivo
**Headline:** ¿Crees que Sabes de Fútbol?  
**Subheadline:** Compite contra miles de aficionados y demuestra quién es el mejor pronosticador

### 3. Premios
**Headline:** Pronostica y Gana Premios Increíbles  
**Subheadline:** Cada acierto te acerca al gran premio. ¡Participa todos los días del Mundial!

---

## CTAs Principales (3 variantes)

1. **Participar Ahora** (actual - acción directa)
2. **Registrarme Gratis** (énfasis en gratuidad)
3. **Empezar a Ganar** (enfoque en beneficio)

---

## CTAs Secundarios (3 variantes)

1. **¿Cómo Funciona?** (actual - informativo)
2. **Ver Premios** (enfoque en incentivo)
3. **Conocer Más** (exploración general)

---

## Microcopy del Formulario

### Labels y placeholders
- **Nombre Completo:** "Ingresa tu nombre completo"
- **DPI (Opcional):** "1234 56789 0101"
- **Teléfono:** "1234-5678"
- **Correo Electrónico:** "tu@email.com"

### Términos y condiciones
"Acepto los términos y condiciones y la política de privacidad. Mis datos serán utilizados únicamente para la gestión de la quiniela y comunicaciones relacionadas."

### Nota de privacidad
"* Campos obligatorios. Tu información está protegida y no será compartida con terceros."

### Estados del botón
- **Normal:** "Completar Registro"
- **Loading:** "Registrando..."
- **Success:** "¡Registro Exitoso!"

---

## Nota Legal / Reglas

**Texto corto para footer y secciones:**

"* Los pronósticos deben realizarse antes del mediodía o antes del inicio de cada partido según calendario oficial."

"* Premios sujetos a términos y condiciones. Consulta bases completas en nuestro sitio web."

"Promoción válida según calendario oficial del Mundial 2026. Consulta bases completas."

---

## Mensajes de Confianza

- "Miles de participantes ya están jugando"
- "Tu información está protegida y no será compartida con terceros"
- "El ranking se actualiza después de cada partido"
- "Resultados en tiempo real"

---

## Uso en el código

Para cambiar la variante del hero, edita el estado inicial en `Hero.tsx`:

```typescript
const [variant] = useState<keyof typeof copyVariants>('emotional'); // 'emotional' | 'competitive' | 'prizes'
```

Todas las demás copys están hardcodeadas en sus respectivos componentes pero pueden extraerse a un archivo de configuración si se requiere internacionalización o A/B testing.
