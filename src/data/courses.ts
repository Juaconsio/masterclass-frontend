import type { Course } from "../types/course";
import engineeringImg from "../assets/engineering.jpg";

export const courses: Course[] = [
  {
    id: "1",
    title: "Cálculo I",
    description: "Aprende los fundamentos del cálculo, incluyendo límites, derivadas y integrales.",
    tutor: "Carlos Sáez",
    frequency: "Semanal",
    level: "MAT1610",
    price: 299,
    image: engineeringImg.src,
    category: "Plan Común",
    rating: 4.8,
    format: ["Grupal", "Personal"],
    topics: ["Thermodynamics", "Fluid Mechanics", "Materials Science", "CAD Design"],
    prerequisites: ["Basic Physics", "Calculus I"]
  },
  {
    id: "2", 
    title: "Circuitos Eléctricos",
    description: "Fundamentos de los circuitos eléctricos. Aprende en profundidad en una sesión.",
    tutor: "Prof. Michael Chen",
    frequency: "Semanal", 
    level: "IEE2123",
    price: 349,
    image: engineeringImg.src,
    category: "Ingeniería Eléctrica",
    rating: 4.9,
    format: ["Grupal"],
    topics: ["Circuit Analysis", "AC/DC Theory", "Electronic Components", "SPICE Simulation"],
    prerequisites: ["Basic Electronics", "Linear Algebra"]
  },
  {
    id: "3",
    title: "Estructuras de Datos y Algoritmos",
    description: "Conceptos sobre las estructuras de datos fundamentales e introducción a los algoritmos.",
    tutor: "Tomás González", 
    frequency: "Bisemanal",
    level: "IIC2133",
    price: 399,
    image: engineeringImg.src,
    category: "Computación",
    rating: 4.7,
    format: ["Personal"],
    topics: ["Arrays & Lists", "Trees & Graphs", "Sorting Algorithms", "Dynamic Programming"],
    prerequisites: ["Programming Fundamentals", "Discrete Mathematics"]
  },
  {
    id: "4",
    title: "Structural Engineering Basics",
    description: "Learn structural analysis, concrete design, and steel construction principles.",
    tutor: "Prof. David Martinez",
    frequency: "A la demanda",
    level: "Minor", 
    price: 449,
    image: engineeringImg.src,
    category: "Civil Engineering",
    rating: 4.6,
    format: ["Grupal", "Personal"],
    topics: ["Structural Analysis", "Concrete Design", "Steel Construction", "Building Codes"],
    prerequisites: ["Statics", "Mechanics of Materials", "Calculus II"]
  }
];