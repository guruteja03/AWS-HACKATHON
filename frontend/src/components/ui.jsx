import { useMemo, useState } from 'react';

export function Card({ children, className = '' }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>{children}</section>;
}

export function StatCard({ label, value, hint }) {
  return <Card><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p><p className="mt-2 text-xs text-slate-400">{hint}</p></Card>;
}

export function StatusBadge({ children, tone = 'green' }) {
  const tones = {
    green: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-900',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-sky-100 text-sky-800',
    gray: 'bg-slate-100 text-slate-700',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.gray}`}>{children}</span>;
}

export function DataTable({ rows, columns, pageSize = 5, label = 'Data table' }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: '', direction: 'asc' });
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const matching = rows.filter((row) => !needle || columns.some(({ key }) => String(row[key] ?? '').toLowerCase().includes(needle)));
    if (!sort.key) return matching;
    return [...matching].sort((left, right) => {
      const a = String(left[sort.key] ?? '').toLowerCase();
      const b = String(right[sort.key] ?? '').toLowerCase();
      return (a.localeCompare(b, undefined, { numeric: true }) || 0) * (sort.direction === 'asc' ? 1 : -1);
    });
  }, [columns, rows, search, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleRows = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const sortBy = (key) => {
    setSort((old) => ({ key, direction: old.key === key && old.direction === 'asc' ? 'desc' : 'asc' }));
    setPage(0);
  };
  return (
    <div>
      <label className="mb-3 block text-sm">Search {label.toLowerCase()}<input aria-label={`Search ${label}`} value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50"><tr>{columns.map(({ key, label: title, sortable = true }) => <th key={key} scope="col" className="p-3">{sortable ? <button type="button" onClick={() => sortBy(key)} aria-label={`Sort by ${title}`} className="font-semibold">{title}{sort.key === key ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ''}</button> : title}</th>)}</tr></thead>
          <tbody>{visibleRows.map((row, index) => <tr key={row.id || index} className="border-t border-slate-200">{columns.map(({ key, render }) => <td key={key} className="p-3">{render ? render(row) : row[key]}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>{filtered.length ? `${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, filtered.length)} of ${filtered.length}` : 'No matching rows'}</span>
        <div className="flex gap-2"><button type="button" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-lg border px-3 py-1 disabled:opacity-40">Previous</button><button type="button" disabled={currentPage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} className="rounded-lg border px-3 py-1 disabled:opacity-40">Next</button></div>
      </div>
    </div>
  );
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return <div role="presentation" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"><div className="flex justify-between"><h2 className="text-lg font-bold">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="rounded border px-2">Close</button></div>{children}</section></div>;
}

export function Drawer({ open, title, onClose, children }) {
  if (!open) return null;
  return <aside role="dialog" aria-modal="true" aria-label={title} className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-auto bg-white p-5 shadow-2xl dark:bg-slate-900"><div className="flex justify-between"><h2 className="font-bold">{title}</h2><button type="button" onClick={onClose} className="rounded border px-2">Close</button></div>{children}</aside>;
}

export function Tabs({ tabs, selected, onChange }) {
  return <div role="tablist" className="flex flex-wrap gap-2">{tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={selected === tab.id} onClick={() => onChange(tab.id)} className={`rounded-lg px-3 py-2 text-sm ${selected === tab.id ? 'bg-indigo-600 text-white' : 'border'}`}>{tab.label}</button>)}</div>;
}

export function Stepper({ steps, activeStep, onChange }) {
  return <ol className="flex flex-wrap gap-2">{steps.map((step, index) => <li key={step}><button type="button" aria-current={index === activeStep ? 'step' : undefined} onClick={() => onChange(index)} className={`rounded-lg border px-3 py-2 text-sm ${index === activeStep ? 'border-indigo-500 bg-indigo-50' : ''}`}>{index + 1}. {step}</button></li>)}</ol>;
}

export function Toast({ message, onClose }) {
  if (!message) return null;
  return <div role="status" className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">{message}<button type="button" onClick={onClose} aria-label="Dismiss notification" className="rounded px-1">×</button></div>;
}

export function Skeleton({ className = 'h-5 w-full' }) {
  return <div aria-busy="true" className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export function EmptyState({ title, description }) {
  return <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>;
}

export function ErrorState({ message, onRetry }) {
  return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{message}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-2 rounded-lg border border-red-300 px-3 py-1">Retry</button>}</div>;
}

export function Breadcrumbs({ items }) {
  return <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-slate-500">{items.map((item, index) => <span key={`${item.label}-${index}`} className="flex items-center gap-2">{index > 0 && <span aria-hidden="true">/</span>}{item.href ? <a href={item.href} className="underline">{item.label}</a> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}

export function CopyButton({ value }) {
  const [feedback, setFeedback] = useState('');
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback('Copied');
    } catch {
      setFeedback('Clipboard unavailable');
    }
  };
  return <span><button type="button" onClick={handleCopy} className="rounded-lg border px-2 py-1 text-xs">Copy</button><span role="status" className="ml-2 text-xs">{feedback}</span></span>;
}

export function DemoBadge() {
  return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Demo Mode</span>;
}

export function CodeBlock({ children }) {
  return <pre className="overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100"><code>{children}</code></pre>;
}
