import { useEffect, useMemo, useState } from 'react';
import { fetchPublicCourseProfessors } from '@/client/courses';

interface ProfessorFromApi {
  id: number;
  name: string;
}

/** Serialized from Astro: team entries with `professorId` for /nosotros/[slug] preview. */
export interface TeamProfilePreview {
  professorId: number;
  slug: string;
  name: string;
  degree: string;
  imageSrc: string;
}

export interface Props {
  courseAcronym: string;
  teamProfiles?: TeamProfilePreview[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const heroShellClass =
  'relative block overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-content shadow-lg transition-[transform,box-shadow] duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100';

const heroShellStaticClass =
  'relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-content shadow-lg';

/**
 * Sidebar professors: faculty from public API + team enrichment. Card layout 3/5 text + 2/5 portrait,
 * gradient and radial highlight aligned with `/nosotros/[slug]` hero.
 */
export default function CourseProfessorsSection({ courseAcronym, teamProfiles = [] }: Props) {
  const [professors, setProfessors] = useState<ProfessorFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileByProfessorId = useMemo(() => {
    const m = new Map<number, TeamProfilePreview>();
    for (const t of teamProfiles) {
      if (!m.has(t.professorId)) m.set(t.professorId, t);
    }
    return m;
  }, [teamProfiles]);

  useEffect(() => {
    let mounted = true;
    fetchPublicCourseProfessors(courseAcronym)
      .then((list) => {
        if (!mounted) return;
        setProfessors(list.map((p) => ({ id: p.id, name: p.name })));
      })
      .catch(() => {
        if (mounted) setError('Error al cargar');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [courseAcronym]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-base-content/70 text-sm font-semibold tracking-wider uppercase">
          Profesores
        </h3>
        <div className="from-primary/20 to-primary/5 relative overflow-hidden rounded-[2rem] bg-gradient-to-br p-8">
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error || professors.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-base-content/70 text-sm font-semibold tracking-wider uppercase">
          Profesores
        </h3>
        <p className="text-base-content/60 text-sm">
          No hay profesores asignados aún para este curso.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base-content/70 text-sm font-semibold tracking-wider uppercase">
        Profesores
      </h3>
      <div className="flex flex-col gap-4">
        {professors.map((p) => {
          const meta = profileByProfessorId.get(p.id);
          const displayName = meta?.name ?? p.name;
          const subtitle = meta?.degree ?? 'Tutor del curso';
          const profileHref = meta ? `/nosotros/${meta.slug}` : null;

          const avatar = (
            <div className="relative z-10 mx-auto aspect-square w-full max-w-[5.5rem] shrink-0 sm:max-w-[6.5rem]">
              <div
                className="absolute inset-0 animate-pulse rounded-full bg-white/10 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative z-10 h-full w-full overflow-hidden rounded-full border-4 border-white/20 shadow-2xl">
                {meta?.imageSrc ? (
                  <img
                    src={meta.imageSrc}
                    alt={displayName}
                    className="h-full w-full object-cover object-top"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="bg-primary-content/20 flex h-full w-full items-center justify-center text-xl font-bold text-white sm:text-2xl">
                    {getInitials(displayName)}
                  </div>
                )}
              </div>
            </div>
          );

          const profileBtnClass =
            'btn btn-outline mt-1 inline-flex rounded-xl border-0 border-transparent bg-transparent px-4 py-2 text-xs font-bold text-white !shadow-none hover:bg-white/10 sm:text-sm md:hidden pointer-events-none';

          const inner = (
            <>
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]"
                aria-hidden="true"
              />
              <div className="relative z-10 grid grid-cols-5 items-center gap-3 sm:gap-4">
                <div className="col-span-3 flex min-w-0 flex-col items-start gap-2 text-left">
                  <h4 className="w-full text-base leading-tight font-extrabold tracking-tight sm:text-lg">
                    {displayName}
                  </h4>
                  <p
                    className="text-primary-content/90 line-clamp-2 w-full text-xs leading-snug font-light sm:text-sm"
                    title={subtitle}
                  >
                    {subtitle}
                  </p>
                  {profileHref ? <span className={profileBtnClass}>Ver perfil</span> : null}
                </div>
                <div className="col-span-2 flex min-w-0 justify-center">{avatar}</div>
              </div>
            </>
          );

          return profileHref ? (
            <a
              key={p.id}
              href={profileHref}
              className={`${heroShellClass} hover:scale-[1.01] active:scale-[0.99]`}
            >
              {inner}
            </a>
          ) : (
            <div key={p.id} className={heroShellStaticClass}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
