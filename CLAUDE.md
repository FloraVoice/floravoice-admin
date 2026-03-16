# FloraVoice Admin — Claude Context

## Project

React Router v7 SPA (framework mode, no SSR) admin panel for the FloraVoice FastAPI backend.
Auth: JWT (access + refresh) stored in `localStorage`. Token refresh handled transparently in `app/lib/api.ts`.

## Stack

- **React Router v7** (framework mode, `ssr: false`)
- **React 19**
- **Tailwind CSS v4**
- **shadcn/ui** components (`app/components/ui/`)
- **Lucide React** icons
- **Sonner** for toast notifications

## Routes

| Path | File | Description |
|---|---|---|
| `/login` | `app/routes/login.tsx` | Admin login form |
| `/` | `app/routes/layout.tsx` | Auth guard + sidebar layout |
| `/flowers` | `app/routes/flowers.tsx` | Flowers CRUD |
| `/admins` | `app/routes/admins.tsx` | Admins CRUD |
| `/customers` | `app/routes/customers.tsx` | Customers (users) CRUD |
| `*` | `app/routes/not-found.tsx` | 404 |

## API (`app/lib/api.ts`)

Base URL: `http://127.0.0.1:8000`

Key exports:
- `authApi` — `login(email, password)`
- `adminsApi` — `list / get / create / update / delete` → `/admins/`
- `usersApi` — `list / get / create / update / delete` → `/users/`
- `flowersApi` — `list / get / create / update / delete` → `/flowers/`
- `ApiError` — typed error with `.status`

Auth endpoints: `POST /auth/admin/login`, `POST /auth/admin/refresh`

## Auth context (`app/context/auth-context.tsx`)

Provides `isAuthenticated`, `isLoading`, `logout()`.
The layout route redirects to `/login` when not authenticated.
`auth:logout` DOM event triggers logout on 401.

## Patterns

- Full CRUD pages follow the flowers pattern: table + create/edit/delete dialogs
- `PUT /admins/{id}` and `PUT /users/{id}` require **all fields** (email, username, password, [address for users]) — API schema has them all required
- Edit dialog for password: user must supply a new password to save changes (API requires the field)
- Toasts for success/error feedback via `sonner`
