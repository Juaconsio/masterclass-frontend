// greetings.ts
const greetings = [
  '¡Hola {name}, hoy es un gran día para conquistar apuntes!',
  '¡Qué onda, {name}! A romperla con esos estudios 💥',
  '¡Ey {name}! Que el café esté fuerte y la flojera débil ☕',
  '¡Vamos, futura leyenda académica {name}!',
  '¡Hola máquina {name}! Hoy es un buen día para sumar neuronas 🧠',
  '¡Hey {name}! El conocimiento no se va a aprender solo 😏',
  '¡Ánimo {name}! Que los profes tiemblen con tu sabiduría',
  '¡Buenos días, guerrero/a del semestre {name}! 🛡️',
  '¡Vamos, {name}, que esas notas no se van a subir solas 📈!',
  '¡Hola, cerebro en entrenamiento {name}, hoy toca gym mental 🧠!',
  '¡Ánimo {name}, que ya sobreviviste a peores ramos!',
  '¡Hey {name}! Hoy es el día perfecto para sorprenderte de lo que puedes lograr',
  '¡Dale {name}, que cada página que leas es XP para tu cerebro 🧬!',
  '¡Hola, {name}! Si estudiar fuera un deporte, serías campeón 🏆',
  '¡Vamos, {name}, que el conocimiento es poder… y el poder da vacaciones 😎!',
  '¡Ey {name}, recuerda que estudiar también es invertir en tus sueños 💭!',
  '¡Buenos días, estudiante estrella {name}! El mundo te espera 🌍',
  '¡Vamos, {name}, que aprobar ese ramo será tu próximo plot twist 🎬!',
  '¡Hola, mente brillante {name}, hoy a brillar aún más ✨!',
  '¡Ánimo {name}! Que en unos años te vas a reír de este estrés',
  '¡Ey {name}! Si no lo haces por ti, hazlo por tu yo del futuro 😄',
  '¡Vamos, futuro CEO / doctora / científico loco {name} 🧪!',
  '¡Hola {name}! Hoy estudias, mañana conquistas el mundo 🌎',
  '¡Ey {name}, que tus ganas sean más fuertes que tus bostezos 😴💪!',
  '¡Vamos, {name}, que el semestre no se gana solo!',
  '¡Hola {name}, que el conocimiento fluya y las distracciones huyan 💨!',
  '¡Ánimo {name}! Lo que hoy parece difícil, mañana será fácil',
  '¡Ey {name}, cada hora de estudio es un paso más cerca de tus metas 🎯!',
  '¡Vamos, héroe sin capa del conocimiento {name} 📚!',
  '¡Hola {name}! Estudiar no mata… salvo de aburrimiento, pero sobrevive 😅',
  '¡Hey {name}! Hoy toca ponerle turbo al cerebro 🧠⚡',
];

export function getGreeting() {
  return greetings[Math.floor(Math.random() * greetings.length)];
}
