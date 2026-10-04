import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  { t: 'AWS Organization', s: 'Management + member account', to: '/accounts', ev: ['CreateOrganization', 'Sravanthi'] },
  { t: 'VPC 10.0.0.0/16', s: 'Created in Account 1', to: '/network', ev: ['CreateVpc', 'Sravanthi'] },
  { t: 'Subnet 10.0.1.0/24', s: 'RAM-Shared-Subnet', to: '/network', ev: ['CreateSubnet', 'Sravanthi'] },
  { t: 'Share with AWS RAM', s: 'SharedSubnet → Chaitu', to: '/ram', ev: ['CreateResourceShare', 'Sravanthi'] },
  { t: 'Security Group + NACL', s: 'RAM-Test-SG', to: '/security-groups', ev: ['CreateSecurityGroup', 'Chaitu'] },
  { t: 'Launch EC2', s: 't3.micro in shared subnet', to: '/ec2', ev: ['RunInstances', 'Chaitu'] },
  { t: 'Audit & Monitor', s: 'CloudTrail + CloudWatch', to: '/cloudtrail', ev: ['LookupEvents', 'Chaitu'] },
];
const TONES = {
  indigo: 'border-indigo-400 bg-indigo-50',
  sky: 'border-sky-400 bg-sky-50',
  amber: 'border-amber-400 bg-amber-50',
  emerald: 'border-emerald-400 bg-emerald-50',
  violet: 'border-violet-400 bg-violet-50',
};
const Box = ({ show, children, tone = 'indigo' }) => (
  <div className={`rounded-xl border-2 px-3 py-2 text-sm transition-all duration-500 ${show ? 'scale-100 opacity-100' : 'pointer-events-none h-0 scale-90 overflow-hidden border-0 p-0 opacity-0'} ${TONES[tone]} text-slate-800`}>{children}</div>
);

export default function ShowcasePage() {
  const [done, setDone] = useState(0);
  const [play, setPlay] = useState(false);
  const [log, setLog] = useState([]);

  const advance = () => setDone((d) => {
    if (d >= STEPS.length) return d;
    const [event, account] = STEPS[d].ev;
    setLog((l) => [{ event, account, time: new Date().toLocaleTimeString() }, ...l]);
    return d + 1;
  });
  useEffect(() => {
    if (!play) return undefined;
    const id = setInterval(() => setDone((d) => {
      if (d >= STEPS.length) { setPlay(false); return d; }
      const [event, account] = STEPS[d].ev;
      setLog((l) => [{ event, account, time: new Date().toLocaleTimeString() }, ...l]);
      return d + 1;
    }), 1500);
    return () => clearInterval(id);
  }, [play]);
  const reset = () => { setPlay(false); setDone(0); setLog([]); };
  const finished = done === STEPS.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Cloud Resource Sharing with AWS RAM</h1>
          <p className="text-sm text-slate-500">Replay of the setup completed in AWS. Nothing here changes AWS.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => (finished ? reset() : setPlay(!play))} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">{finished ? '↺ Replay' : play ? '⏸ Pause' : '▶ Play project'}</button>
          <button onClick={reset} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Reset</button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <ol className="space-y-2">
          {STEPS.map((s, i) => (
            <li key={s.t} className={`flex items-center gap-3 rounded-xl border p-3 ${i < done ? 'border-emerald-300 bg-emerald-50 text-slate-800' : i === done ? 'border-indigo-400 bg-indigo-50 text-slate-800' : 'border-slate-200 opacity-60'}`}>
              <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${i < done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'}`}>{i < done ? '✓' : i + 1}</span>
              <div className="min-w-0 flex-1"><div className="font-semibold">{s.t}</div><div className="text-xs text-slate-500">{s.s}</div></div>
              {i === done && !play && <button onClick={advance} className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Run</button>}
              {i < done && <Link to={s.to} className="text-xs font-semibold text-indigo-600">Open →</Link>}
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-slate-200 p-4">
          <Box show={done >= 1}>🏢 <b>AWS Organization</b> · eu-north-1</Box>
          <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
            <div className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3">
              <div className="text-xs font-bold uppercase text-slate-500">Account 1 · Sravanthi · Management</div>
              <Box show={done >= 2}>🌐 VPC <b>10.0.0.0/16</b></Box>
              <Box show={done >= 3} tone="sky">🔷 RAM-Shared-Subnet <b>10.0.1.0/24</b></Box>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 text-xs font-bold text-indigo-600">
              <span className={`transition-opacity duration-700 ${done >= 4 ? 'animate-pulse opacity-100' : 'opacity-20'}`}>AWS RAM</span>
              <span className={`text-2xl transition-opacity duration-700 ${done >= 4 ? 'opacity-100' : 'opacity-20'}`}>➜</span>
            </div>
            <div className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3">
              <div className="text-xs font-bold uppercase text-slate-500">Account 2 · Chaitu · Member</div>
              <Box show={done >= 4} tone="sky">🔷 Shared subnet <b>visible</b></Box>
              <Box show={done >= 5} tone="amber">🛡️ RAM-Test-SG · NACL</Box>
              <Box show={done >= 6} tone="emerald">🖥️ EC2 t3.micro · <b>10.0.1.144</b> · Running</Box>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Box show={done >= 7} tone="violet">📜 CloudTrail · {log.length} events <span className="text-xs">(demo)</span></Box>
            <Box show={done >= 7} tone="emerald">📈 CloudWatch · CPU 23% · Healthy <span className="text-xs">(demo)</span></Box>
          </div>
          {done === 0 && <p className="py-10 text-center text-slate-500">Press <b>Play project</b> to build it step by step.</p>}
        </div>
      </div>

      {log.length > 0 && (
        <div className="rounded-xl border border-slate-200 p-3 text-sm">
          <div className="mb-1 font-semibold">Activity</div>
          {log.map((l, i) => <div key={i} className="flex justify-between border-t border-slate-100 py-1"><span>{l.event} · {l.account}</span><span className="text-slate-500">{l.time}</span></div>)}
        </div>
      )}

      {finished && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-slate-800">
          <div className="mb-2 text-lg font-bold">✅ Chaitu's EC2 is running inside Sravanthi's shared subnet</div>
          <div className="flex flex-wrap gap-2">{[['Accounts', '/accounts'], ['Network', '/network'], ['RAM', '/ram'], ['EC2', '/ec2'], ['Security', '/security-groups'], ['CloudTrail', '/cloudtrail'], ['CloudWatch', '/cloudwatch'], ['Architecture', '/architecture']].map(([l, to]) => <Link key={to} to={to} className="rounded-lg bg-white px-3 py-1 text-sm font-semibold text-indigo-600 shadow-sm">{l} →</Link>)}</div>
        </div>
      )}
    </div>
  );
}
