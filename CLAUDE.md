# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Materialize MUI Next.js Admin Template** - a full-featured admin dashboard built with Next.js 15, Material-UI (MUI) 6, TypeScript, and Prisma. The project includes internationalization (i18n) support for English, French, and Arabic with RTL support.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier

### Database
- `pnpm migrate` - Run Prisma migrations (requires `.env` file)
- Prisma schema location: `src/prisma/schema.prisma`
- Database: SQLite (configurable via `DATABASE_URL` in `.env`)

### Other
- `pnpm build:icons` - Bundle Iconify icons (runs automatically on postinstall)
- `pnpm removeI18n` - Remove translation scripts

## Architecture

### App Structure (Next.js 15 App Router)

The application uses Next.js App Router with a sophisticated routing structure:

```
src/app/
├── [lang]/                          # Language-based routing (en, fr, ar)
│   ├── (dashboard)/(private)/       # Authenticated dashboard pages
│   └── (blank-layout-pages)/        # Pages without dashboard layout
│       └── (guest-only)/            # Login, register, etc.
└── api/                             # API routes
```

**Route Groups:**
- `(dashboard)/(private)` - Protected pages requiring authentication, includes full dashboard layout
- `(blank-layout-pages)` - No dashboard chrome, used for auth pages and misc pages
- `(guest-only)` - Nested within blank-layout, prevents access for authenticated users

### Path Aliases (tsconfig.json)

- `@/*` → `src/*`
- `@core/*` → `src/@core/*` - Core theme, hooks, utilities
- `@layouts/*` → `src/@layouts/*` - Layout components (Vertical, Horizontal, Blank)
- `@menu/*` → `src/@menu/*` - Menu system and navigation
- `@assets/*` → `src/assets/*`
- `@components/*` → `src/components/*`
- `@configs/*` → `src/configs/*`
- `@views/*` → `src/views/*` - Page-level view components

### Layout System

The application supports **three layout modes**:
1. **Vertical Layout** - Traditional sidebar navigation (default)
2. **Horizontal Layout** - Top navigation bar
3. **Collapsed Layout** - Minimized sidebar

**Key Layout Files:**
- `src/@layouts/LayoutWrapper.tsx` - Switches between layout modes based on settings
- `src/@layouts/VerticalLayout.tsx` - Sidebar layout implementation
- `src/@layouts/HorizontalLayout.tsx` - Top navigation layout
- `src/@layouts/BlankLayout.tsx` - Minimal layout for auth pages

**Layout Configuration:**
- Settings stored in cookies (see `themeConfig.settingsCookieName`)
- Theme customizer component allows runtime layout switching
- Settings context: `src/@core/contexts/settingsContext.tsx`

### Authentication (NextAuth.js)

- Configuration: `src/libs/auth.ts`
- API route: `src/app/api/auth/[...nextauth]/route.ts`
- Providers: Credentials (custom login API) and Google OAuth
- Session strategy: JWT
- Auth guards:
  - `src/hocs/AuthGuard.tsx` - Protects private routes
  - `src/hocs/GuestOnlyRoute.tsx` - Restricts authenticated users from auth pages

**Environment Variables Required:**
- `NEXTAUTH_SECRET` - JWT encryption secret
- `NEXTAUTH_URL` - Full auth URL including basepath
- `NEXTAUTH_BASEPATH` - If deploying to subdirectory
- `API_URL` - Backend API for credentials login
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - For OAuth

### Internationalization (i18n)

**Supported Languages:** English (en), French (fr), Arabic (ar)

**Key Files:**
- `src/configs/i18n.ts` - i18n configuration including RTL support for Arabic
- `src/data/dictionaries/` - Translation JSON files
- `src/utils/getDictionary.ts` - Server-side translation loader
- `src/components/layout/shared/LanguageDropdown.tsx` - Language switcher

**Direction Handling:**
- RTL automatically applied for Arabic
- Direction prop flows through Providers → ThemeProvider
- MUI theme and Tailwind both support RTL

### State Management

- **Redux Toolkit** - Global state (`src/redux-store/`)
- Slices:
  - `calendar.ts` - Calendar events
  - `chat.ts` - Chat messages
  - `email.ts` - Email client
  - `kanban.ts` - Kanban boards
- Provider: `src/redux-store/ReduxProvider.tsx` (wraps app in Providers)

### Menu/Navigation System

**Menu Data:**
- `src/data/navigation/verticalMenuData.tsx` - Sidebar menu structure
- `src/data/navigation/horizontalMenuData.tsx` - Top nav menu structure

**Menu Components:**
- `src/@menu/` - Core menu system library
- `src/components/layout/vertical/VerticalMenu.tsx` - Sidebar renderer
- `src/components/layout/horizontal/HorizontalMenu.tsx` - Top nav renderer
- `src/components/GenerateMenu.tsx` - Dynamic menu generation from data

**Menu System Features:**
- Supports nested submenus, sections, links, external links
- Menu configuration: `src/@menu/defaultConfigs.ts`
- Toggle animations controlled by duration constants

### Theming (MUI + Tailwind)

**MUI Theme:**
- Theme definition: `src/@core/theme/`
- Color schemes: `src/@core/theme/colorSchemes.ts`
- Component overrides: `src/@core/theme/overrides/` (extensive MUI customization)
- Mode: Supports `light`, `dark`, `system`
- Skin: `default` or `bordered`

**Tailwind:**
- Config: `tailwind.config.ts`
- Custom plugin: `src/@core/tailwind/plugin.ts`
- Uses `tailwindcss-logical` for RTL-aware spacing
- Preflight disabled (MUI provides base styles)
- Important selector: `#__next` (scopes Tailwind to app)

**Theme Configuration:**
- `src/configs/themeConfig.ts` - Default theme settings
- Settings persisted in cookies
- Customizer UI: `src/@core/components/customizer/`

### Data Layer

**Fake Data:**
- `src/fake-db/` - Mock data for demos (apps, pages, widgets)
- API routes in `src/app/api/` serve this data

**Prisma (Real Database):**
- Schema: `src/prisma/schema.prisma`
- Models: User, Account, Session, VerificationToken (NextAuth adapter schema)
- Default provider: SQLite (can be changed to PostgreSQL, MySQL, etc.)

### Component Patterns

**Custom Components:**
- `src/@core/components/` - Reusable core components (customizer, scroll-to-top, option-menu)
- `src/components/` - App-specific components (layout, dialogs, cards)
- `src/components/dialogs/` - Reusable dialog components (confirmation, payment, user forms)

**HOCs:**
- `src/hocs/TranslationWrapper.tsx` - Provides dictionary to client components
- `src/hocs/AuthGuard.tsx` - Protects routes, redirects to login
- `src/hocs/GuestOnlyRoute.tsx` - Redirects authenticated users away from auth pages

**Client Wrappers:**
- Heavy libraries lazy-loaded via client wrappers in `src/libs/`:
  - `ApexCharts.tsx`, `Recharts.tsx` - Chart libraries
  - `ReactPlayer.tsx` - Video player

### Styling Strategy

**CSS Modules:**
- Used for component-specific styles
- Examples: `src/@core/components/customizer/styles.module.css`

**Global Styles:**
- `src/app/globals.css` - Base styles and Tailwind imports
- Library styles: `src/libs/styles/` (react-datepicker, fullcalendar, etc.)

**MUI Styled Components:**
- `@emotion/styled` for styled components
- Emotion cache configuration for SSR

### Icon System

**Iconify:**
- Icons bundled at build time via `pnpm build:icons`
- Bundle script: `src/assets/iconify-icons/bundle-icons-css.ts`
- Uses Bootstrap Icons by default
- Remote fallback available

## Code Standards

### ESLint Rules

**Import Ordering:**
1. `react`
2. `next/**`
3. External packages
4. `@/**` (internal aliases)
5. Relative imports

**Spacing Rules:**
- Blank line before comments (with exceptions for block/object/array starts)
- Blank line after variable declarations
- Blank line before/after functions and multi-line blocks
- Blank line before return statements
- Blank line after imports

**TypeScript:**
- Consistent type imports required (`import type`)
- No `any` allowed in lint (but disabled in config)
- Unused vars are errors

### File Naming
- React components: PascalCase (e.g., `VerticalLayout.tsx`)
- Utilities/configs: camelCase (e.g., `themeConfig.ts`)
- CSS Modules: `*.module.css`

## Important Notes

### Redirects
The app automatically redirects:
- `/` → `/en/dashboards/crm`
- `/:lang` → `/:lang/dashboards/crm`
- Missing language prefix → `/en/:path`

These are defined in `next.config.ts`.

### Cookie-Based Settings
Layout, theme mode, skin, and other UI settings are stored in cookies. To see config changes during development, either:
1. Use the Customizer reset button
2. Clear cookies from browser DevTools

### Prisma Client Generation
`prisma generate` runs automatically on `postinstall`. If Prisma types are missing, run `pnpm install` again.

### BASEPATH Support
The app supports deployment to subdirectories via the `BASEPATH` environment variable. All URLs and auth paths respect this setting.

### Translation Removal
The template includes scripts to remove i18n features if not needed (`pnpm removeI18n`). This modifies packages, layout files, and removes translation-related code.