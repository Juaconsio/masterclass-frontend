import { useEffect, useState } from 'react';
import { getMyProfessorCourses } from '@/client/professors';
import { Link } from 'react-router';
import { BookOpen, Users, Calendar } from 'lucide-react';
import type { ICourse } from '@/interfaces';

export default function ProfessorCourses() {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getMyProfessorCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-32 w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body items-center text-center">
          <BookOpen className="text-base-content/40 h-16 w-16" />
          <h2 className="card-title">No tienes cursos asignados</h2>
          <p className="text-base-content/70">
            Contacta al administrador para que te asigne cursos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mis Cursos</h1>
        <p className="text-base-content/70 mt-2">Cursos en los que eres profesor</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course: ICourse) => (
          <div
            key={course.id}
            className="card bg-base-100 shadow-xl transition-all hover:shadow-2xl"
          >
            <div className="card-body">
              <h2 className="card-title">
                <span className="badge badge-primary">{course.acronym}</span>
              </h2>
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <p className="text-base-content/70 line-clamp-3">{course.description}</p>

              <div className="divider my-2"></div>

              <div className="stats stats-vertical bg-base-200 shadow">
                <div className="stat py-3">
                  <div className="stat-figure text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="stat-title text-xs">Clases</div>
                  <div className="stat-value text-2xl">{course.classes?.length || 0}</div>
                </div>

                <div className="stat py-3">
                  <div className="stat-figure text-secondary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="stat-title text-xs">Estudiantes</div>
                  <div className="stat-value text-2xl">{course.students?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
