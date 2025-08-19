import type { Review } from "../types/review";

export const reviews: Review[] = [
  {
    id: "1",
    name: "Juan Pérez",
    role: "Estudiante 1er año",
    company: "Ingeniería UC",
    rating: 5,
    comment: "Tremendo.",
    course: "Cálculo I"
  },
  {
    id: "2",
    name: "Miguelito",
    role: "Estudiante 4to año",
    company: "Sociología",
    rating: 5,
    comment: "Para mí Carlos manejaba muy bien los temas, sin embargo me pasaba que me costaba mantener la concentración durante 1:15 por lo que cuando fueron grabadas me sirvieron mucho más las clases ya que cuando sentía que estaba perdiendo la atención la pausaba y luego volvía a la clase y lograba entenderla por completo",
    course: "Pre-cálculo"
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "DevOps Engineer",
    company: "CloudTech",
    rating: 5,
    comment: "The DevOps course covered everything from basics to advanced topics. The instructor's real-world experience really shows. I feel confident deploying applications to production now.",
    course: "DevOps & Cloud Architecture"
  },
  {
    id: "4",
    name: "David Wilson",
    role: "Data Scientist",
    company: "Analytics Pro",
    rating: 4,
    comment: "Great course content and excellent support from the community. The projects were challenging but rewarding. It's amazing how much I learned in just a few months.",
    course: "Data Science & ML"
  },
  {
    id: "5",
    name: "Lisa Thompson",
    role: "Mobile Developer",
    company: "AppDev Studios",
    rating: 5,
    comment: "As someone transitioning from web to mobile development, this course was perfect. The step-by-step approach and practical examples made learning Flutter enjoyable and effective.",
    course: "Mobile App Development"
  },
  {
    id: "6",
    name: "Alex Kumar",
    role: "System Architect",
    company: "Enterprise Solutions",
    rating: 5,
    comment: "The system design course helped me understand how to build scalable applications. The knowledge I gained directly contributed to my promotion to senior architect role.",
    course: "System Design & Architecture"
  }
];