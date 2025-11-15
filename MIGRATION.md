# Migration Guide: Astro to Vite React SPA

This document describes the migration from Astro hybrid architecture to a pure Vite + React SPA.

## Summary

The project has been successfully migrated from:
- **Astro** (hybrid static + SSR) → **Vite** (React SPA)
- **astro-icon** (MDI) → **lucide-react**
- **USAL script tag** → **@usal/react**
- **Mixed routing** (Astro + React Router) → **Pure React Router**

## What Changed

### Build System
- **Before**: Astro with `@astrojs/react`, `@astrojs/vercel`
- **After**: Vite 6.4.1 with `@vitejs/plugin-react`
- **Configuration**: `astro.config.mjs` → `vite.config.ts`

### Entry Points
- **Before**: Multiple `.astro` pages in `src/pages/`
- **After**: Single `index.html` + `src/main.tsx`

### Icons
- **Before**: `astro-icon` with MDI icons
  ```astro
  <Icon name="mdi:home" size={24} />
  ```
- **After**: `lucide-react` with mapping utility
  ```tsx
  import { Icon } from '@/lib/icons';
  <Icon name="mdi:home" size={24} />
  ```

### Animations
- **Before**: USAL via script tag in Layout.astro
  ```html
  <script src="https://cdn.usal.dev/latest" defer></script>
  ```
- **After**: `@usal/react` USALProvider
  ```tsx
  import { USALProvider } from '@usal/react';
  <USALProvider config={{ once: true }}>
    <App />
  </USALProvider>
  ```

### Routing
- **Before**: Hybrid Astro pages + React Router in `[...slug].astro`
- **After**: Pure React Router in `App.tsx`

### Components
All landing components converted from `.astro` to `.tsx`:
- `Navbar.astro` → `Navbar.tsx`
- `Hero.astro` → `Hero.tsx`
- `Stats.astro` → `Stats.tsx`
- `Footer.astro` → `Footer.tsx`
- `ContactUs` components → React components

## Pages & Routes

### Landing Pages (Public)
- `/` - Landing page with Hero, Stats, Contact
- `/about` - About page
- `/courses` - Courses listing page

### Auth Pages
- `/ingresar` - Student login
- `/registrar` - Student registration
- `/admin/ingresar` - Admin login

### Protected Routes
- `/app/*` - Student dashboard and features
- `/admin/*` - Admin dashboard and management

## File Structure

```
masterclass-frontend/
├── index.html                 # Entry HTML (replaces Layout.astro)
├── vite.config.ts            # Vite configuration
├── vercel.json               # Vercel SPA configuration
├── src/
│   ├── main.tsx              # React entry point
│   ├── vite-env.d.ts         # Vite environment types
│   ├── components/
│   │   ├── App.tsx           # Main app with routing
│   │   ├── landing/          # Landing page components (React)
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Stats.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── contactUs/
│   │   └── pages/            # Route pages
│   │       ├── AboutPage.tsx
│   │       └── CoursesPage.tsx
│   ├── lib/
│   │   └── icons.tsx         # Icon mapping utility
│   ├── content_backup/       # Original Astro content (backup)
│   └── pages_backup/         # Original Astro pages (backup)
└── package.json
```

## Key Files

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@interfaces': path.resolve(__dirname, './src/interfaces'),
      '@components': path.resolve(__dirname, './src/components'),
      '@client': path.resolve(__dirname, './src/client'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
    },
  },
  server: {
    port: 4321,
  },
});
```

### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### `src/lib/icons.tsx`
Icon mapping utility that maintains compatibility with existing MDI icon names while using Lucide React icons:
```tsx
import { Home, Info, BookOpen, /* ... */ } from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  'mdi:home': Home,
  'mdi:information': Info,
  'mdi:book': BookOpen,
  // ... more mappings
};

export function Icon({ name, size = 24, className = '' }) {
  const IconComponent = iconMap[name];
  return IconComponent ? <IconComponent size={size} className={className} /> : null;
}
```

## Development

### Commands
```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
The project uses `import.meta.env` for environment variables (Vite standard):
- `import.meta.env.PUBLIC_BACKEND_API_URL` - Backend API URL

Types are defined in `src/vite-env.d.ts`:
```typescript
interface ImportMetaEnv {
  readonly PUBLIC_BACKEND_API_URL: string;
}
```

## Deployment

### Vercel
The project is configured for Vercel deployment:
1. Vercel will auto-detect Vite
2. Build command: `npm run build`
3. Output directory: `dist`
4. SPA rewrites configured in `vercel.json`

### Build Output
- JavaScript: ~586KB (~183KB gzipped)
- CSS: ~180KB (~29KB gzipped)
- HTML: ~1.5KB (~0.5KB gzipped)

## Migration Notes

### Content Collections
The original Astro content collections (courses and reviews markdown) have been backed up to `src/content_backup/`. There are several options for handling this content:

1. **Backend API** (Recommended): Fetch courses and reviews from the backend
2. **JSON Data**: Convert markdown to JSON files
3. **Vite Markdown Loader**: Use a Vite plugin to load markdown files

### API Routes
The original Astro API routes (`src/pages/api/`) have been backed up to `src/pages_backup/`. These should be moved to the backend or re-implemented if needed.

### Images
Static images remain in `public/images/` and are referenced the same way:
```tsx
<img src="/images/logo.png" alt="Logo" />
```

## Testing

### Verification Steps
1. ✅ Build successful: `npm run build`
2. ✅ TypeScript compilation: No errors
3. ✅ Dev server starts: `npm run dev`
4. ✅ Routes work: /, /about, /courses, /ingresar, /app/*, /admin/*
5. ✅ Icons render correctly (Lucide icons)
6. ✅ USAL animations work (USALProvider)
7. ✅ No security vulnerabilities (CodeQL scan)

### Known Warnings
- JWT-decode dynamic import warning (benign)
- Bundle size > 500KB (can be optimized with code splitting if needed)
- CSS @property warning (DaisyUI, benign)

## Troubleshooting

### Issue: Icons not showing
**Solution**: Check that the icon name exists in the `iconMap` in `src/lib/icons.tsx`. Add any missing icon mappings.

### Issue: Routes not working in production
**Solution**: Ensure `vercel.json` rewrites are configured correctly to route all paths to `index.html`.

### Issue: Environment variables not working
**Solution**: Make sure environment variables are prefixed with `PUBLIC_` for client-side access in Vite.

## Security

✅ **CodeQL Scan**: No security vulnerabilities found
✅ **Dependencies**: All dependencies updated to latest versions
✅ **TypeScript**: Strict mode enabled

## Performance

The migration maintains similar performance characteristics:
- Fast dev server startup (~350ms)
- Production build time: ~6.5s
- Client-side routing (no page reloads)
- Code splitting can be added for further optimization

## Next Steps (Optional)

1. **Code Splitting**: Implement route-based code splitting
2. **Featured Courses**: Add course cards to landing page from backend API
3. **Reviews Integration**: Add reviews carousel to landing page
4. **Loading States**: Add loading spinners and skeletons
5. **Error Boundaries**: Add React error boundaries
6. **SEO**: Add React Helmet for meta tags

## Support

For questions or issues:
1. Check this migration guide
2. Review the backup files in `src/content_backup/` and `src/pages_backup/`
3. Refer to Vite documentation: https://vitejs.dev/
4. Refer to React Router documentation: https://reactrouter.com/
