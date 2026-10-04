import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DataTable, ErrorState, StatCard, StatusBadge } from '../components/ui';
import { useFetch } from '../hooks';

const CpuChart = lazy(() => import('../components/Charts').then((module) => ({ default: module.CpuChart })));
const NetworkChart = lazy(() => import('../components/Charts').then((module) => ({ default: module.NetworkChart })));
const CloudWatchChart = lazy(() => import('../components/Charts').then((module) => ({ default: module.CloudWatchChart })));

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/showcase');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/showcase');
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 p-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
        <div className="bg-slate-950 p-10 text-white">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">CloudShare Manager</p>
          <h1 className="mt-4 text-4xl font-bold">AWS Multi-Account Resource Sharing & Network Monitoring</h1>
          <p className="mt-6 text-slate-300">Visualize RAM subnet sharing, member account networking, and demo CloudTrail/CloudWatch telemetry without AWS credentials.</p>
          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-200">Use the demo-only credentials documented in the project README. They are not AWS credentials.</p>
          </div>
        </div>
        <div className="p-10">
          <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-2 text-slate-500">Use the demo account to access the mock AWS environment.</p>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Email</span>
              <input type="email" required autoComplete="username" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Email address" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Password</span>
              <input type="password" required minLength={8} autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Password" />
            </label>
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? 'Signing in...' : 'Continue to dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const statCards = [
  { label: 'Accounts', value: '2', hint: 'Active accounts' },
  { label: 'Shared Subnets', value: '1', hint: 'RAM shared' },
  { label: 'EC2 Instances', value: '1', hint: 'Running' },
  { label: 'Security Risk', value: 'High', hint: 'Open SSH' },
];

export function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then((response) => setDashboard(response.data.data))
      .catch((requestError) => setError(requestError.response?.data?.error?.message || 'Unable to load dashboard.'));
  }, []);

  const cpuData = dashboard?.cloudWatchMetrics?.metrics?.CPU || [];
  const trafficData = dashboard?.cloudWatchMetrics?.metrics?.NetworkIn?.map((item, index) => ({
    time: item.time,
    inbound: item.value,
    outbound: dashboard.cloudWatchMetrics.metrics.NetworkOut[index]?.value || 0,
  })) || [];
  const exportReport = () => {
    if (!dashboard) return;
    const blobUrl = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data: dashboard }, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'cloudshare-dashboard-report.json';
    link.click();
    URL.revokeObjectURL(blobUrl);
    window.dispatchEvent(new CustomEvent('cloudshare:notice', { detail: { message: 'Dashboard JSON report exported.' } }));
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">Overview</p>
          <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
        </div>
        <button type="button" onClick={exportReport} disabled={!dashboard} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"><Download className="h-4 w-4" /> Export report</button>
      </div>

      {error ? <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p> : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} label={card.label} hint={card.hint} value={card.label === 'Accounts' ? dashboard?.summary?.totalAccounts ?? card.value : card.label === 'Shared Subnets' ? dashboard?.summary?.totalSubnets ?? card.value : card.label === 'EC2 Instances' ? dashboard?.summary?.totalInstances ?? card.value : card.value} />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
            <span className="font-semibold text-emerald-800">{dashboard?.summary?.status || 'System Status: Healthy'}</span>
            <span className="text-emerald-700">CloudWatch DEMO DATA</span>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">CPU Utilization</h3><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Healthy</span></div>
              <Suspense fallback={<p className="py-10 text-center text-sm text-slate-500">Loading chart…</p>}><CpuChart data={cpuData} /></Suspense>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">Network Throughput</h3><span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">DEMO DATA</span></div>
              <Suspense fallback={<p className="py-10 text-center text-sm text-slate-500">Loading chart…</p>}><NetworkChart data={trafficData} /></Suspense>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function AccountsPage() {
  const { data: accountData, error, loading, refetch } = useFetch('/accounts');
  const accounts = accountData || [];
  const [maskIds, setMaskIds] = useState(() => localStorage.getItem('cloudshare-mask-accounts') === 'true');
  const toggleMask = () => {
    setMaskIds((current) => {
      localStorage.setItem('cloudshare-mask-accounts', String(!current));
      return !current;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Accounts</h1><button type="button" onClick={toggleMask} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">{maskIds ? 'Show account IDs' : 'Mask account IDs'}</button></div>
      {error && <div className="mt-4"><ErrorState message={error} onRetry={refetch} /></div>}
      {loading && <p role="status" className="mt-4 text-sm text-slate-500">Loading accounts…</p>}
      <div className="mt-6">
        <DataTable
          label="Accounts"
          rows={accounts}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'id', label: 'Account ID', render: (account) => maskIds ? `${account.id.slice(0, 4)}****${account.id.slice(-4)}` : account.id },
            { key: 'accountType', label: 'Type' },
            { key: 'status', label: 'Status', render: (account) => <StatusBadge>{account.status}</StatusBadge> },
          ]}
        />
      </div>
      <div className="mt-5 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900">
        <p className="font-semibold">Account relationship</p>
        <p className="mt-1">Sravanthi (management / subnet owner) <span aria-label="shares with">→ AWS RAM →</span> Chaitu (member / subnet consumer).</p>
        <Link to="/architecture" className="mt-2 inline-block underline">View interactive account topology</Link>
      </div>
    </div>
  );
}

export function NetworkPage() {
  const vpcRequest = useFetch('/vpcs');
  const subnetRequest = useFetch('/subnets');
  const vpcs = vpcRequest.data || [];
  const subnets = subnetRequest.data || [];

  return (
    <div>
      <h1 className="text-3xl font-bold">VPC & Network</h1>
      {vpcRequest.error && <div className="mt-4"><ErrorState message={vpcRequest.error} onRetry={vpcRequest.refetch} /></div>}
      {subnetRequest.error && <div className="mt-4"><ErrorState message={subnetRequest.error} onRetry={subnetRequest.refetch} /></div>}
      {(vpcRequest.loading || subnetRequest.loading) && <p role="status" className="mt-4 text-sm text-slate-500">Loading network resources…</p>}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold">VPCs</h3>
          {vpcs.map((vpc) => (
            <div key={vpc.id} className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="font-semibold">{vpc.name}</p>
              <p className="text-sm text-slate-500">{vpc.id} · {vpc.cidr}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold">Subnets</h3>
          {subnets.map((subnet) => (
            <div key={subnet.id} className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="font-semibold">{subnet.name}</p>
              <p className="text-sm text-slate-500">{subnet.id} · {subnet.cidr} · {subnet.state}</p>
            </div>
          ))}
        </div>
      </div>
      <Link to="/architecture" className="mt-4 inline-block text-sm text-indigo-600 underline">Explore interactive network topology</Link>
    </div>
  );
}

export function RamPage() {
  const { data, error, loading, refetch } = useFetch('/ram/resource-shares');
  const shares = data || [];

  return (
    <div>
      <h1 className="text-3xl font-bold">RAM</h1>
      {error && <div className="mt-4"><ErrorState message={error} onRetry={refetch} /></div>}
      {loading && <p role="status" className="mt-4 text-sm text-slate-500">Loading resource shares…</p>}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        {shares.map((share) => (
          <div key={share.id} className="flex items-center justify-between border-b border-slate-200 p-4">
            <div>
              <p className="text-lg font-semibold">{share.name}</p>
              <p className="text-sm text-slate-500">Owner: {share.owner} · Shared with: {share.sharedWith}</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{share.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
        <p className="font-semibold">Illustrative share flow</p>
        <p className="mt-1">Sravanthi owns the subnet <span aria-label="shares through">→</span> AWS RAM <span aria-label="shares with">→</span> Chaitu launches workloads in the shared subnet.</p>
        <Link to="/ram-explainer" className="mt-2 inline-block underline">Walk through the share lifecycle</Link>
      </div>
    </div>
  );
}

export function EC2Page() {
  const { data, error, loading, refetch } = useFetch('/ec2/instances');
  const instances = data || [];

  return (
    <div>
      <h1 className="text-3xl font-bold">EC2</h1>
      {error && <div className="mt-4"><ErrorState message={error} onRetry={refetch} /></div>}
      {loading && <p role="status" className="mt-4 text-sm text-slate-500">Loading EC2 instances…</p>}
      <div className="mt-6 rounded-2xl border border-slate-200 p-4">
        {instances.map((instance) => (
          <div key={instance.id} className="rounded-xl bg-slate-50 p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="text-xl font-semibold">{instance.name}</h3>
                <p className="text-sm text-slate-500">{instance.id}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">{instance.state}</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Type:</span> {instance.instanceType}</p>
              <p><span className="font-semibold text-slate-900">Private IP:</span> {instance.privateIp}</p>
              <p><span className="font-semibold text-slate-900">Status checks:</span> {instance.statusChecks}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SecurityGroupsPage() {
  const { data, error, loading, refetch } = useFetch('/security-groups');
  const groups = data || [];

  return (
    <div>
      <h1 className="text-3xl font-bold">Security Groups</h1>
      {error && <div className="mt-4"><ErrorState message={error} onRetry={refetch} /></div>}
      {loading && <p role="status" className="mt-4 text-sm text-slate-500">Loading security groups…</p>}
      <div className="mt-6 space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{group.name}</h3><span className="rounded-full bg-amber-200 px-2 py-1 text-xs font-semibold text-amber-800">Warning</span></div>
            <p className="mt-3 text-sm text-slate-700">Inbound TCP 22 from 0.0.0.0/0 is open. This creates a high-risk SSH exposure.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NetworkAclsPage() {
  const { data, error, loading, refetch } = useFetch('/network-acls');
  const acls = data || [];

  return (
    <div>
      <h1 className="text-3xl font-bold">Network ACLs</h1>
      {error && <div className="mt-4"><ErrorState message={error} onRetry={refetch} /></div>}
      {loading && <p role="status" className="mt-4 text-sm text-slate-500">Loading network ACLs…</p>}
      <div className="mt-6 space-y-4">
        {acls.map((acl) => (
          <div key={acl.id} className="rounded-2xl border border-slate-200 p-4">
            <p className="text-lg font-semibold">{acl.name}</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-medium">Inbound Rules</p>
                {acl.inboundRules.map((rule) => <p key={rule.ruleNumber} className="text-sm text-slate-600">#{rule.ruleNumber} {rule.protocol} {rule.portRange} from {rule.cidr}</p>)}
              </div>
              <div>
                <p className="font-medium">Outbound Rules</p>
                {acl.outboundRules.map((rule) => <p key={rule.ruleNumber} className="text-sm text-slate-600">#{rule.ruleNumber} {rule.protocol} {rule.portRange} to {rule.cidr}</p>)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <section className="mt-5 rounded-2xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold">Network ACL vs Security Group</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm text-slate-600">
          <p><strong className="text-slate-900">Network ACL:</strong> stateless subnet-level rules; inbound and outbound responses require explicit rules.</p>
          <p><strong className="text-slate-900">Security group:</strong> stateful network interface rules; return traffic is automatically allowed for permitted connections.</p>
        </div>
        <Link to="/security-groups" className="mt-3 inline-block text-sm text-indigo-600 underline">Review demo security group findings</Link>
      </section>
    </div>
  );
}

export function IpAddressingPage() {
  const [loadError, setLoadError] = useState('');
  const [details, setDetails] = useState({
    cidr: '10.0.1.0/24',
    network: '10.0.1.0',
    broadcast: '10.0.1.255',
    firstHost: '10.0.1.1',
    lastHost: '10.0.1.254',
    usableHosts: 251,
    reservedHosts: 5,
    freeIps: 250,
  });

  useEffect(() => {
    api.get('/ip-addressing').then((response) => setDetails(response.data.data)).catch((requestError) => setLoadError(requestError.response?.data?.error?.message || 'Unable to load IP data.'));
  }, []);
  const ipGrid = Array.from({ length: 256 }, (_, index) => {
    if (index < 4 || index === 255) return { index, category: 'Reserved' };
    if (index === 144) return { index, category: 'Used' };
    return { index, category: 'Free' };
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">IP Addressing</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold">CIDR Summary</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">CIDR:</span> {details.cidr}</p>
            <p><span className="font-semibold text-slate-900">Network:</span> {details.network}</p>
            <p><span className="font-semibold text-slate-900">Broadcast:</span> {details.broadcast}</p>
            <p><span className="font-semibold text-slate-900">Usable hosts:</span> {details.usableHosts}</p>
            <p><span className="font-semibold text-slate-900">AWS reserved:</span> {details.reservedHosts}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold">Subnet usage</h3>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-[0.4%] min-w-1 bg-emerald-500" />
          </div>
          <p className="mt-3 text-sm text-slate-600">Used: 10.0.1.144 · Free IPs: {details.freeIps}</p>
          <div className="mt-5 grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1" role="img" aria-label="Subnet address heatmap, reserved addresses in amber, used address in blue, and available addresses in green">
            {ipGrid.map(({ index, category }) => <span key={index} title={`10.0.1.${index} · ${category}`} className={`h-3 rounded-sm ${category === 'Reserved' ? 'bg-amber-400' : category === 'Used' ? 'bg-indigo-600' : 'bg-emerald-200'}`} />)}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500"><span><i className="mr-1 inline-block h-2 w-2 bg-amber-400" />Reserved</span><span><i className="mr-1 inline-block h-2 w-2 bg-indigo-600" />Used</span><span><i className="mr-1 inline-block h-2 w-2 bg-emerald-200" />Free</span></div>
        </div>
      </div>
      {loadError && <p role="alert" className="mt-3 text-sm text-red-700">{loadError}</p>}
      <p className="mt-4 text-sm text-slate-500">Need another network? Open the <Link to="/cidr-calculator" className="text-indigo-600 underline">CIDR calculator</Link>.</p>
    </div>
  );
}

export function CloudTrailPage() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ eventName: '', account: '', status: '', from: '', to: '' });
  const [error, setError] = useState('');
  const refresh = useCallback(async (notify = false) => {
    setError('');
    try {
      const response = await api.get('/cloudtrail/events', { params: filters });
      setEvents(response.data.data || []);
      if (notify) window.dispatchEvent(new CustomEvent('cloudshare:notice', { detail: { message: 'Demo events refreshed.' } }));
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'Unable to load demo events.');
    }
  }, [filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const exportCsv = () => {
    const columns = ['eventName', 'account', 'status', 'timestamp', 'source', 'resource'];
    const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const content = [columns.join(','), ...events.map((event) => columns.map((column) => escapeCsv(event[column])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cloudtrail-demo-events.csv';
    link.click();
    URL.revokeObjectURL(url);
    window.dispatchEvent(new CustomEvent('cloudshare:notice', { detail: { message: 'CloudTrail CSV exported.' } }));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">CloudTrail</h1>
      <div className="mt-6 rounded-2xl border border-slate-200 p-4">
        <div className="mb-4 flex items-center justify-between gap-3"><span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">DEMO DATA</span><div className="flex gap-2"><button type="button" onClick={() => refresh(true)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"><RefreshCw className="h-4 w-4" /> Refresh</button><button type="button" onClick={exportCsv} disabled={!events.length} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"><Download className="h-4 w-4" /> Export CSV</button></div></div>
        <div className="grid gap-3 md:grid-cols-5">
          <input value={filters.eventName} onChange={(event) => setFilters({ ...filters, eventName: event.target.value })} placeholder="Event name" className="rounded-xl border border-slate-200 px-3 py-2" />
          <input value={filters.account} onChange={(event) => setFilters({ ...filters, account: event.target.value })} placeholder="Account" className="rounded-xl border border-slate-200 px-3 py-2" />
          <label className="text-xs text-slate-500">From <input aria-label="From date" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" /></label>
          <label className="text-xs text-slate-500">To <input aria-label="To date" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" /></label>
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2">
            <option value="">Any status</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-4">
          <DataTable label="CloudTrail events" rows={events} columns={[
            { key: 'eventName', label: 'Event' },
            { key: 'account', label: 'Account' },
            { key: 'status', label: 'Status' },
            { key: 'timestamp', label: 'Timestamp', render: (event) => new Date(event.timestamp).toLocaleString() },
          ]} />
        </div>
      </div>
    </div>
  );
}

export function CloudWatchPage() {
  const [metrics, setMetrics] = useState({ metrics: { CPU: [], NetworkIn: [], NetworkOut: [] } });
  const [range, setRange] = useState('1h');
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState('');
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await api.get('/cloudwatch/metrics', { params: { range } });
      const base = response.data.data;
      const varied = (points, delta) => points.map((point) => ({ ...point, value: Math.max(0, point.value + Math.round((Math.random() * 2 - 1) * delta)) }));
      setMetrics({ ...base, metrics: { ...base.metrics, CPU: varied(base.metrics.CPU, 2), NetworkIn: varied(base.metrics.NetworkIn, 120), NetworkOut: varied(base.metrics.NetworkOut, 100) } });
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'Unable to load demo metrics.');
    }
  }, [range]);
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);
  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(fetchMetrics, 8000);
    return () => window.clearInterval(timer);
  }, [paused, fetchMetrics]);

  const chartData = metrics.metrics.CPU.map((entry, index) => ({
    time: entry.time,
    cpu: entry.value,
    inbound: metrics.metrics.NetworkIn[index]?.value || 0,
    outbound: metrics.metrics.NetworkOut[index]?.value || 0,
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold">CloudWatch</h1>
      <div className="mt-6 rounded-2xl border border-slate-200 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">DEMO DATA · simulated variation</span><span className="text-sm text-slate-500">Current CPU: {chartData[2]?.cpu ?? 23}% ({metrics.summary?.status || 'Healthy'})</span><div className="flex gap-2"><select aria-label="Metric time range" value={range} onChange={(event) => setRange(event.target.value)} className="rounded-lg border px-2 py-1 text-sm"><option value="1h">1 hour</option><option value="6h">6 hours</option><option value="24h">24 hours</option></select><button type="button" onClick={() => setPaused((value) => { window.dispatchEvent(new CustomEvent('cloudshare:notice', { detail: { message: value ? 'Metric refresh resumed.' : 'Metric refresh paused.' } })); return !value; })} className="rounded-lg border px-3 py-1 text-sm">{paused ? 'Resume refresh' : 'Pause refresh'}</button></div></div>
        {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
        <Suspense fallback={<p className="py-10 text-center text-sm text-slate-500">Loading chart…</p>}><CloudWatchChart data={chartData} /></Suspense>
      </div>
    </div>
  );
}

export function ArchitecturePage() {
  const [architecture, setArchitecture] = useState({ resources: [], links: [] });
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/architecture').then((response) => setArchitecture(response.data.data || { resources: [], links: [] })).catch((requestError) => setError(requestError.response?.data?.error?.message || 'Unable to load architecture.'));
  }, []);
  const destination = (resource) => {
    if (resource.type === 'Account' || resource.type === 'Org') return '/accounts';
    if (resource.type === 'VPC' || resource.type === 'Subnet' || resource.type === 'NetworkACL') return resource.type === 'NetworkACL' ? '/network-acls' : '/network';
    if (resource.type === 'RAM') return '/ram';
    if (resource.type === 'EC2') return '/ec2';
    if (resource.type === 'SecurityGroup') return '/security-groups';
    if (resource.type === 'CloudTrail') return '/cloudtrail';
    if (resource.type === 'CloudWatch') return '/cloudwatch';
    return '/dashboard';
  };
  const detailFor = (resource) => {
    if (resource.type === 'Org') return 'CloudShare Org · shared-network example organization.';
    if (resource.type === 'Account') return resource.id === 'acct-1' ? 'Sravanthi · Management Account · 183079729972' : 'Chaitu · Member Account · 818034793325';
    if (resource.type === 'VPC') return 'vpc-07a9c1d2e3f4a5b6c · 10.0.0.0/16 · eu-north-1';
    if (resource.type === 'Subnet') return 'RAM-Shared-Subnet · subnet-0f2a2ee2bf32d17a1 · 10.0.1.0/24 · eu-north-1a';
    if (resource.type === 'RAM') return 'SharedSubnet · ACTIVE · ec2:Subnet · owner Sravanthi, shared with Chaitu';
    if (resource.type === 'EC2') return 'i-0a1b2c3d4e5f67890 · t3.micro · Running · private IP 10.0.1.144';
    if (resource.type === 'SecurityGroup') return 'RAM-Test-SG · TCP/22 is open to 0.0.0.0/0 (high-risk demo finding).';
    if (resource.type === 'NetworkACL') return 'Subnet-associated network ACL with inbound and outbound allow rules.';
    return `${resource.type} · DEMO DATA`;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Architecture & topology</h1>
      <p className="mt-2 text-sm text-slate-500">Select a node to inspect details and navigate to its page. Flow lines are illustrative, not live telemetry.</p>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 rounded-2xl border border-slate-200 p-4">
        <svg viewBox="0 0 1200 430" className="h-[420px] w-full rounded-xl bg-slate-50">
          {architecture.links.map(([source, target], index) => {
            const from = architecture.resources.find((item) => item.id === source);
            const to = architecture.resources.find((item) => item.id === target);
            if (!from || !to) return null;
            return <line key={`${source}-${target}-${index}`} x1={from.x + 60} y1={from.y + 26} x2={to.x + 60} y2={to.y + 26} stroke={source === 'ram-1' || target === 'ram-1' ? '#0f9f8f' : '#4f46e5'} strokeDasharray="8 6" strokeWidth="2" />;
          })}
          {architecture.resources.map((resource) => (
            <g key={resource.id} role="button" tabIndex={0} aria-label={`View ${resource.label} details`} onClick={() => setSelected(resource)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(resource); } }} style={{ cursor: 'pointer' }}>
              <rect x={resource.x} y={resource.y} width={120} height={52} rx={12} fill={resource.type === 'RAM' ? '#ccfbf1' : '#e0e7ff'} stroke={resource.type === 'RAM' ? '#0f9f8f' : '#6366f1'} />
              <text x={resource.x + 60} y={resource.y + 28} textAnchor="middle" fontSize="12" fill="#111827">{resource.label}</text>
            </g>
          ))}
        </svg>
        <p className="mt-2 text-xs text-slate-500">Teal dashed path indicates the RAM share flow from owner account toward the member account.</p>
      </div>
      {selected && <aside role="dialog" aria-label="Resource details" className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start justify-between"><h2 className="text-xl font-bold">{selected.label}</h2><button type="button" onClick={() => setSelected(null)} aria-label="Close details" className="rounded-lg border px-2 py-1">Close</button></div><p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{detailFor(selected)}</p><Link to={destination(selected)} onClick={() => setSelected(null)} className="mt-5 inline-flex rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Open resource page</Link></aside>}
      <p className="mt-4 text-sm text-slate-500"><Link to="/ram-explainer" className="text-indigo-600 underline">View the RAM sharing walkthrough</Link></p>
    </div>
  );
}

export function DocumentationPage() {
  const sections = [
    ['Problem Statement', 'Separate AWS accounts may need to consume shared networking while preserving account-level ownership. The project illustrates cross-account subnet sharing through AWS Resource Access Manager (RAM).'],
    ['Objectives', 'Visualize the management and member accounts, shared subnet, consuming EC2 instance, security controls, and mock monitoring data. Provide educational tools without making AWS changes.'],
    ['Architecture', 'Sravanthi’s management account owns VPC 10.0.0.0/16 and subnet 10.0.1.0/24. An active RAM share makes the subnet available to Chaitu’s member account, which launches a demo t3.micro instance.'],
    ['Technologies', 'React, Vite, React Router, Axios, Tailwind CSS, Recharts, lucide-react, Node.js, Express, Zod, JSON Web Token, and an in-memory repository interface.'],
    ['AWS Services', 'AWS RAM for resource sharing; Amazon VPC for VPC, subnet, route table, and network ACL; Amazon EC2 for instances and security groups; AWS Organizations for account relationships; CloudTrail and CloudWatch for illustrative audit and metrics views.'],
    ['Implementation Steps', 'Create an AWS Organization, owner VPC and subnet, route table and network ACL, RAM resource share and principal association, then launch a member-account EC2 instance into the shared subnet. Verify CloudTrail events and CloudWatch metrics in the console.'],
    ['Security Considerations', 'This demo flags SSH from 0.0.0.0/0 as a high-risk finding. Restrict management ingress to known administrative networks. Security groups are stateful; network ACLs are stateless. The UI and simulation do not change rules.'],
    ['Testing', 'Run npm --prefix backend test, npm --prefix frontend test, npm --prefix frontend run lint, and npm --prefix frontend run build. API route tests use the Node test runner and mock data.'],
    ['Expected Output', 'A management/member account view, active subnet resource share, running mock EC2 instance, AWS-style security warnings, and clearly labeled DEMO DATA for CloudTrail and CloudWatch.'],
    ['Conclusion', 'RAM enables eligible resources such as VPC subnets to be shared with accounts or organizations. This demo explains the flow and its boundaries; the application does not perform AWS resource operations.'],
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Documentation</h1>
        <button type="button" onClick={() => window.print()} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">Print / Save as PDF</button>
      </div>
      <div className="space-y-6">
        {sections.map(([title, text]) => (
          <section key={title} className="rounded-2xl border border-slate-200 p-5">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-slate-600">{text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">404</p>
        <h1 className="mt-3 text-4xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-500">The page you requested does not exist in the CloudShare Manager app.</p>
        <Link to="/dashboard" className="mt-5 inline-block text-indigo-600 underline">Return to dashboard</Link>
      </div>
    </div>
  );
}
