import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/categories', label: 'Categories' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/recurring', label: 'Recurring' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-text flex">
      <aside className="w-60 border-r border-border flex flex-col p-6">
        <h1 className="font-display text-2xl text-brass mb-10">Ledger</h1>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-surface text-brass'
                    : 'text-text-muted hover:text-text hover:bg-surface'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border pt-4">
          <p className="text-sm text-text truncate">{user?.name}</p>
          <p className="text-xs text-text-muted truncate mb-3">{user?.email}</p>
          <button
            onClick={logout}
            className="text-sm text-text-muted hover:text-danger transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}