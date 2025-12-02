# Masterclass Frontend - Copilot Instructions

## Architecture Overview

This is a **hybrid Astro + React SPA** for a tutoring/masterclass platform ("Salva Ramos"). The architecture combines:

- **Astro pages** for static landing pages and SEO-optimized content
- **React SPA** (`[...slug].astro` → `App.tsx`) for authenticated app experience with client-side routing
- **Backend API integration** via singleton `httpClient` with JWT authentication
- **DaisyUI + Tailwind v4** for styling (not v3!)

### Key Structural Decisions

1. **Dual Routing**: Landing pages are Astro; authenticated flows (`/app/*`, `/admin/*`) use React Router within `App.tsx`
2. **Content Collections**: Course and review data live in `src/content/courses/` and `src/content/reviews/` as Markdown with frontmatter (schema in `src/content/config.ts`)
3. **Hydration**: The SPA mounts with `client:only` directive in `[...slug].astro` with `prerender = false`

## Core Patterns

### API Client Architecture

All backend communication flows through `src/client/config.ts`:

```typescript
// Singleton pattern with automatic JWT injection
import { httpClient } from '@/client/config';

// Client modules follow this pattern:
export async function getStudents(filters) {
  const response = await httpClient.get('/students', { params: filters });
  return response.data;
}
```

**Key conventions:**

- `httpClient` handles token from `localStorage` automatically
- Dev mode logs all requests/responses with styled console groups
- Base URL from `import.meta.env.PUBLIC_BACKEND_API_URL`
- Client modules organized by domain: `auth.ts`, `courses.ts`, `students.ts`, etc.
- Admin endpoints live in `src/client/admin/` subdirectory

### Authentication & Session Management

JWT-based auth with role-based routing:

1. `SessionContext.tsx` manages global auth state using `jwtDecode`
2. Token stored in `localStorage` with expiry checks
3. `validateToken()` in `src/client/auth.ts` handles refresh logic
4. Separate login endpoints: `/auth/login` (students) vs `/admin/login` (admins)
5. `ProtectedRoute` and `ProtectedAdminRoute` wrappers in `App.tsx` guard routes

**Admin detection**: Check `decoded.role === 'admin'` or `decoded.isAdmin === true` from JWT payload

### Data Fetching Hook Pattern

Use `useTableData` hook for admin tables with pagination/sorting/filtering:

```tsx
const { data, loading, filters, handleSort, handlePageChange } = useTableData({
  fetchFn: getStudents,
  initialFilters: { page: 1, limit: 10 },
});
```

All `fetchFn` functions must return `TableResponse<T>` with `{ data: T[], total: number }` structure.

### TypeScript Path Aliases

```typescript
@/*          → src/*
@client/*    → src/client/*
@components/* → src/components/*
@interfaces/* → src/interfaces/*
@layouts/*   → src/layouts/*
```

Always use path aliases for imports, never relative paths crossing multiple directories.

## Styling Conventions

- **DaisyUI semantic components**: Use `btn btn-primary`, `input input-bordered`, `card card-compact`
- **Custom theme** in `global.css` using `@plugin "daisyui/theme"` with brand colors:
  - Primary: `oklch(0.7049 0.1867 47.6)` (vibrant orange)
  - Secondary: `oklch(0.2101 0.0318 264.66)` (elegant dark blue)
- **Tailwind v4 syntax**: `@import 'tailwindcss'` and `@plugin` directives (not v3 `@tailwind`)
- **Mobile-first**: Use responsive prefixes (`lg:`, `md:`) and test mobile layouts

## Data Models

Core entities defined in `src/interfaces/models.ts`:

- **IProfessor**, **IStudent**, **ICourse**, **IClass**, **ISlot**, **IReservation**, **IPayment**
- Status enums as **string literal types** (not TypeScript enums): `SlotStatus`, `ReservationStatus`, `PaymentStatus`
- All dates are ISO 8601 strings, use `date-fns` for formatting

## Development Workflow

### Commands

```bash
pnpm dev      # Start dev server at localhost:4321
pnpm build    # Production build
pnpm preview  # Preview production build
```

### Adding New Features

1. **New API endpoint**: Add function to appropriate `src/client/*.ts` module
2. **New admin table**: Use `useTableData` hook + create filter interface in `src/interfaces/filters.ts`
3. **New route**:
   - Astro page → create `.astro` in `src/pages/`
   - App route → add to `App.tsx` router under appropriate layout
4. **New content type**: Define collection schema in `src/content/config.ts`

### Common Gotchas

- **Don't use `client:load` or `client:visible`** for main SPA - only `client:only` in `[...slug].astro`
- **Admin routes require role check** - never trust just `isAuthenticated`, always verify `role === 'admin'`
- **Query params helper**: Use `buildQuery()` from `src/client/lib/buildQuery.ts` for URL params
- **Content collections** need restart after schema changes

## Key Files Reference

| File                             | Purpose                                 |
| -------------------------------- | --------------------------------------- |
| `src/components/App.tsx`         | React Router setup, route guards        |
| `src/context/SessionContext.tsx` | Global auth state                       |
| `src/client/config.ts`           | HTTP client singleton                   |
| `src/hooks/useTableData.ts`      | Reusable table data hook                |
| `src/layouts/adminLayout.tsx`    | Admin sidebar/nav shell                 |
| `src/content/config.ts`          | Content collection schemas              |
| `astro.config.mjs`               | Tailwind v4 integration via Vite plugin |

## Best Practices

- **Error handling**: Let httpClient handle network errors; display user feedback via state
- **Loading states**: Always show loading UI when `isLoading` from SessionContext or useTableData
- **Form validation**: Use `react-hook-form` with controlled inputs, validate with `zod`
- **Accessibility**: Use semantic HTML and DaisyUI's built-in ARIA attributes

## Code Style Guidelines

### Comments and Documentation

- **Remove inline comments**: Code should be self-explanatory through clear naming and structure
- **Use JSDoc for functions**: Document public APIs and utilities with JSDoc in English
- **JSDoc format**:
  ```typescript
  /**
   * Brief description of what the function does
   * @param paramName - Parameter description
   * @returns Description of return value
   */
  ```
- **Language**: All JSDoc and code comments must be in English
- **When to comment**: Only add comments for complex business logic or non-obvious algorithms

### Function Exports

- **Prefer named exports** over default exports for utilities and client functions
- **Use `export async function`** pattern for API client methods
- **Default exports** only for React components
- **Pattern**:

  ```typescript
  // ✅ Good - Named exports for utilities
  export async function getStudents(filters) { ... }
  export function formatPhone(phone) { ... }

  // ✅ Good - Default export for components
  export default function StudentProfile() { ... }

  // ❌ Avoid - Exporting object of functions
  export default { getStudents, updateStudent };
  ```

### Helpers and Utilities

- **Location**: Place in `src/lib/` directory
- **Naming**: Use descriptive camelCase names (e.g., `formatPhone.ts`, `validateEmail.ts`)
- **Single responsibility**: One helper file per domain/concern
- **Export pattern**: Named exports for each utility function
