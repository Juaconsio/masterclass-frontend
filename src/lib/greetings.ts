// greetings.ts
const greetings = [
  '¡Hola, hoy es un gran día para conquistar apuntes!',
  '¡Qué onda,! A romperla con esos estudios 💥',
  '¡Ey! Que el café esté fuerte y la flojera débil ☕',
  '¡Vamos, futura leyenda académica!',
  '¡Hola máquina! Hoy es un buen día para sumar neuronas 🧠',
  '¡Hey! El conocimiento no se va a aprender solo 😏',
  '¡Ánimo! Que los profes tiemblen con tu sabiduría',
  '¡Buenos días, guerrero/a del semestre! 🛡️',
  '¡Vamos,, que esas notas no se van a subir solas 📈!',
  '¡Hola, cerebro en entrenamiento, hoy toca gym mental 🧠!',
  '¡Ánimo, que ya sobreviviste a peores ramos!',
  '¡Hey! Hoy es el día perfecto para sorprenderte de lo que puedes lograr',
  '¡Dale, que cada página que leas es XP para tu cerebro 🧬!',
  '¡Hola,! Si estudiar fuera un deporte, serías campeón 🏆',
  '¡Vamos,, que el conocimiento es poder… y el poder da vacaciones 😎!',
  '¡Ey, recuerda que estudiar también es invertir en tus sueños 💭!',
  '¡Buenos días, estudiante estrella! El mundo te espera 🌍',
  '¡Vamos,, que aprobar ese ramo será tu próximo plot twist 🎬!',
  '¡Hola, mente brillante, hoy a brillar aún más ✨!',
  '¡Ánimo! Que en unos años te vas a reír de este estrés',
  '¡Ey! Si no lo haces por ti, hazlo por tu yo del futuro 😄',
  '¡Vamos, futuro CEO / doctora / ganador del Nobel 🧪!',
  '¡Hola! Hoy estudias, mañana conquistas el mundo 🌎',
  '¡Ey, que tus ganas sean más fuertes que tus bostezos 😴💪!',
  '¡Vamos, que el semestre no se gana solo!',
  '¡Hola, que el conocimiento fluya y las distracciones huyan 💨!',
  '¡Ánimo! Lo que hoy parece difícil, mañana será fácil',
  '¡Ey, cada hora de estudio es un paso más cerca de tus metas 🎯!',
  '¡Vamos, héroe sin capa del conocimiento 📚!',
  '¡Hola! Estudiar no mata… salvo de aburrimiento, pero sobrevive 😅',
  '¡Hey! Hoy toca ponerle turbo al cerebro 🧠⚡',
];

export function getGreeting() {
  return greetings[Math.floor(Math.random() * greetings.length)];
}
