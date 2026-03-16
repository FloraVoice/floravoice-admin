import { Navigate, NavLink, Outlet, useNavigate } from "react-router";
import { Flower2, Users, ShoppingBag, LogOut, ClipboardList } from "lucide-react";
import { useAuth } from "~/context/auth-context";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";

const navItems = [
  { to: "/flowers", label: "Flowers", icon: Flower2 },
  { to: "/admins", label: "Admins", icon: Users },
  { to: "/customers", label: "Customers", icon: ShoppingBag },
  { to: "/orders", label: "Orders", icon: ClipboardList },
];

export default function Layout() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (auth.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="text-muted-foreground text-sm">Loading…</span>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    auth.logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <nav className="flex w-60 flex-col border-r bg-sidebar text-sidebar-foreground">
        {/* Logo */}
        <div className="flex h-14 items-center px-4">
          <Flower2 className="mr-2 size-5 text-primary" />
          <span className="font-semibold tracking-tight">FloraVoice</span>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-0.5 px-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                    ].join(" ")
                  }
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* User menu */}
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-sidebar-accent/50 transition-colors">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    A
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sidebar-foreground">Admin</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48">
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
