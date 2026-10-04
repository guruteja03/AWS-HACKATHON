import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  Bell,
  Cloud,
  Command,
  Database,
  Download,
  FolderGit2,
  LayoutDashboard,
  LogOut,
  Moon,
  Network,
  Shield,
  SunMedium,
  TerminalSquare,
  Wand2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDebounce, useTheme } from '../hooks';

const navItems = [
  { to: '/showcase', label: 'Project Showcase', icon: Wand2 },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accounts', label: 'Accounts', icon: Database },
  { to: '/network', label: 'Network', icon: Network },
  { to: '/ram', label: 'RAM', icon: ArrowRightLeft },
  { to: '/ec2', label: 'EC2', icon: Cloud },
  { to: '/security-groups', label: 'Security Groups', icon: Shield },
  { to: '/network-acls', label: 'NACLs', icon: FolderGit2 },
  { to: '/ip-addressing', label: 'IP Addressing', icon: TerminalSquare },
  { to: '/cloudtrail', label: 'CloudTrail', icon: Bell },
  { to: '/cloudwatch', label: 'CloudWatch', icon: Download },
  { to: '/architecture', label: 'Architecture', icon: Wand2 },
  { to: '/documentation', label: 'Documentation', icon: Command },
  { to: '/ram-explainer', label: 'How RAM works', icon: ArrowRightLeft },
  { to: '/setup', label: 'Setup checklist', icon: FolderGit2 },
  { to: '/cli-commands', label: 'CLI command library', icon: TerminalSquare },
  { to: '/security-posture', label: 'Security posture', icon: Shield },
  { to: '/cidr-calculator', label: 'CIDR calculator', icon: TerminalSquare },
  { to: '/quiz', label: 'Mini quiz', icon: Command },
  { to: '/presentation', label: 'Presentation mode', icon: Wand2 },
];

function CommandPalette({ open, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query);
  const filtered = useMemo(() => {
    const list = [
      ...navItems.map((item) => ({ type: 'Page', ...item })),
      { to: '/ram', label: 'SharedSubnet', type: 'Resource' },
      { to: '/accounts', label: 'Sravanthi management account', type: 'Resource' },
      { to: '/accounts', label: 'Chaitu member account', type: 'Resource' },
      { to: '/network', label: 'RAM-Shared-Subnet', type: 'Resource' },
      { to: '/ec2', label: 'i-0a1b2c3d4e5f67890', type: 'Resource' },
      { to: '/security-groups', label: 'RAM-Test-SG', type: 'Resource' },
      { to: '/dashboard', label: 'Export report', type: 'Action' },
      { to: '/dashboard', label: 'Toggle theme', type: 'Action' },
    ];
    if (!debouncedQuery) return list;
    return list.filter((item) => item.label.toLowerCase().includes(debouncedQuery.toLowerCase()));
  }, [debouncedQuery]);

  if (!open) return null;

  return (
    <div role="presentation" className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Global search and command palette" className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <Command className="h-5 w-5 text-indigo-500" />
          <input
            aria-label="Search pages, resources, or actions"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
            placeholder="Search pages or actions..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="max-h-80 overflow-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">No matches</p>
          ) : (
            filtered.map((item) => (
              <button
                key={`${item.type}-${item.label}`}
                onClick={() => {
                  if (item.label === 'Toggle theme') {
                    onSelect('toggle-theme');
                  } else if (item.label === 'Export report') {
                    onSelect('export-report');
                  } else if (item.label === 'Presentation mode') {
                    onSelect('/presentation');
                  } else {
                    onSelect(item.to);
                  }
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-xs uppercase tracking-wide text-slate-400">{item.type}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function OptionNavigation({ pathname }) {
  const currentIndex = navItems.findIndex((item) => item.to === pathname);
  if (currentIndex < 0) return null;

  const previous = navItems[currentIndex - 1];
  const next = navItems[currentIndex + 1];

  return (
    <nav aria-label="Project option navigation" className="no-print mb-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
      {previous ? (
        <Link to={previous.to} aria-label={`Go to previous option: ${previous.label}`} className="text-indigo-600 hover:underline dark:text-indigo-300">← {previous.label}</Link>
      ) : <span />}
      <span className="text-xs text-slate-500">{currentIndex + 1} of {navItems.length} options</span>
      {next ? (
        <Link to={next.to} aria-label={`Go to next option: ${next.label}`} className="text-indigo-600 hover:underline dark:text-indigo-300">{next.label} →</Link>
      ) : <span />}
    </nav>
  );
}

export function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [health, setHealth] = useState({ mode: 'mock' });
  const { theme, toggleTheme } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/health')
      .then((response) => setHealth(response.data.data || { mode: 'mock' }))
      .catch(() => setHealth({ mode: 'unavailable' }));
  }, []);

  useEffect(() => {
    const showError = (event) => {
      const message = event.detail?.message || 'Request failed.';
      setToast({ message, retry: event.detail?.retry });
      window.setTimeout(() => setToast((current) => current?.message === message ? '' : current), 5000);
    };
    const showNotice = (event) => {
      const message = event.detail?.message || 'Done.';
      setToast({ message });
      window.setTimeout(() => setToast((current) => current?.message === message ? '' : current), 3000);
    };
    window.addEventListener('cloudshare:error', showError);
    window.addEventListener('cloudshare:notice', showNotice);
    return () => {
      window.removeEventListener('cloudshare:error', showError);
      window.removeEventListener('cloudshare:notice', showNotice);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === 'Escape') {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAction = async (action) => {
    if (action === 'toggle-theme') {
      toggleTheme();
      return;
    }
    if (action === 'export-report') {
      try {
        const response = await api.get('/dashboard');
        const payload = { exportedAt: new Date().toISOString(), mode: health.mode, report: response.data.data };
        const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cloudshare-dashboard-report.json';
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        window.alert(error.response?.data?.error?.message || 'Could not export the dashboard report.');
      }
      return;
    }
    if (action) navigate(action);
  };

  const signOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen flex-col">
        <header className="no-print border-b border-slate-200 bg-white/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Link to="/showcase" className="text-xl font-bold text-indigo-600">CloudShare Manager</Link>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    {health.mode === 'mock' ? 'Demo Mode' : health.mode === 'live' ? 'Live Mode' : health.mode === 'unavailable' ? 'API unavailable' : 'Checking mode…'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="hidden items-center gap-2 rounded-full border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600 md:flex dark:border-slate-700 dark:text-slate-300"
              >
                <Command className="h-4 w-4" /> Ctrl+K
              </button>
              <div className="relative">
                <button type="button" aria-label="Open notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)} className="rounded-full border border-slate-200 p-2 dark:border-slate-700">
                  <Bell className="h-4 w-4" />
                </button>
                {notificationsOpen && <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <p className="font-semibold">Recent notifications · DEMO DATA</p>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">CreateResourceShare completed</p>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">Instance status checks: 3/3 passed</p>
                  <p className="mt-2 text-amber-700">Security: SSH is open to 0.0.0.0/0</p>
                </div>}
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-full border border-slate-200 p-2 dark:border-slate-700"
              >
                {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-indigo-600"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
          <aside className="no-print hidden w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:block">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Navigation</p>
            <nav className="space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="no-print mb-3 flex items-center gap-2 text-xs text-slate-500">
              <Link to="/dashboard">Home</Link><span>/</span><span className="font-semibold capitalize">{location.pathname.slice(1).replaceAll('-', ' ') || 'Dashboard'}</span>
            </div>
            <OptionNavigation pathname={location.pathname} />
            <div className="no-print mb-3 flex items-center gap-3 lg:hidden">
              <button type="button" onClick={() => setMobileNavOpen((open) => !open)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Menu</button>
              <Link to="/presentation" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Viva / Presentation</Link>
            </div>
            {mobileNavOpen && <nav className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3">{navItems.map((item) => <Link key={item.to} to={item.to} onClick={() => setMobileNavOpen(false)} className="rounded-lg px-2 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">{item.label}</Link>)}</nav>}
            <main className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {children}
            </main>
            {(() => { const i = navItems.findIndex((n) => n.to === location.pathname); if (i < 0) return null; const p = navItems[i - 1]; const n = navItems[i + 1]; return (<div className="no-print mt-4 flex justify-between gap-3 text-sm">{p ? <Link to={p.to} className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">← {p.label}</Link> : <span />}{n ? <Link to={n.to} className="rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white">{n.label} →</Link> : <span />}</div>); })()}
          </section>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onSelect={handleAction} />
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"><span>{toast.message}</span>{toast.retry && <button type="button" onClick={() => toast.retry().catch(() => {})} className="rounded border border-white/30 px-2 py-1">Retry</button>}<button type="button" aria-label="Dismiss notification" onClick={() => setToast('')} className="rounded border border-white/30 px-2 py-1">×</button></div>}
    </div>
  );
}
