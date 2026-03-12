// greetings.ts
const greetings = [
  '¡Hola, {name}! Hoy es un gran día para conquistar apuntes!',
  '¡Qué onda, {name}! A romperla con esos estudios 💥',
  '¡Ey, {name}! Que el café esté fuerte y la flojera débil ☕',
  '¡Vamos, {name}, futura leyenda académica!',
  '¡Hola máquina, {name}! Hoy es un buen día para sumar neuronas 🧠',
  '¡Hey, {name}! El conocimiento no se va a aprender solo 😏',
  '¡Ánimo, {name}! Que los profes tiemblen con tu sabiduría',
  '¡Buenos días, {name}, guerrero/a del semestre! 🛡️',
  '¡Vamos, {name}, que esas notas no se van a subir solas 📈!',
  '¡Hola, {name}, cerebro en entrenamiento, hoy toca gym mental 🧠!',
  '¡Ánimo, {name}, que ya sobreviviste a peores ramos!',
  '¡Hey, {name}! Hoy es el día perfecto para sorprenderte de lo que puedes lograr',
  '¡Dale, {name}, que cada página que leas es XP para tu cerebro 🧬!',
  '¡Hola, {name}! Si estudiar fuera un deporte, serías campeón 🏆',
  '¡Vamos, {name}, que el conocimiento es poder… y el poder da vacaciones 😎!',
  '¡Ey, {name}, recuerda que estudiar también es invertir en tus sueños 💭!',
  '¡Buenos días, {name}, estudiante estrella! El mundo te espera 🌍',
  '¡Vamos, {name}, que aprobar ese ramo será tu próximo plot twist 🎬!',
  '¡Hola, {name}, mente brillante, hoy a brillar aún más ✨!',
  '¡Ánimo, {name}! Que en unos años te vas a reír de este estrés',
  '¡Ey, {name}! Si no lo haces por ti, hazlo por tu yo del futuro 😄',
  '¡Vamos, {name}, futuro CEO / doctora / ganador del Nobel 🧪!',
  '¡Hola, {name}! Hoy estudias, mañana conquistas el mundo 🌎',
  '¡Ey, {name}, que tus ganas sean más fuertes que tus bostezos 😴💪!',
  '¡Vamos, {name}, que el semestre no se gana solo!',
  '¡Hola, {name}, que el conocimiento fluya y las distracciones huyan 💨!',
  '¡Ánimo, {name}! Lo que hoy parece difícil, mañana será fácil',
  '¡Ey, {name}, cada hora de estudio es un paso más cerca de tus metas 🎯!',
  '¡Vamos, {name}, héroe sin capa del conocimiento 📚!',
  '¡Hola, {name}! Estudiar no mata… salvo de aburrimiento, pero sobrevive 😅',
  '¡Hey, {name}! Hoy toca ponerle turbo al cerebro 🧠⚡',
];

export function getGreeting(name: string) {
  const userName = name?.split(' ')[0]?.trim() || 'estudiante';
  const greetingTemplate = greetings[Math.floor(Math.random() * greetings.length)];
  return greetingTemplate.replace(/{name}/g, userName);
}
