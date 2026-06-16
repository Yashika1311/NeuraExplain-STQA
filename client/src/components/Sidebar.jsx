import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { name: 'Chat', path: '/chat', icon: '💬' },
  { name: 'Community', path: '/community', icon: '👥' },
  { name: 'Credits', path: '/credits', icon: '⭐' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-700 dark:bg-blue-900 text-white"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-linear-to-b from-slate-950 to-slate-900 text-white transform transition-transform duration-300 z-40 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:z-auto`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            PikaExplain
          </h1>

          <nav className="space-y-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-blue-800 shadow-lg'
                    : 'hover:bg-slate-800'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-slate-800" />
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}