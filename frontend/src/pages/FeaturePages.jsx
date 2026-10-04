import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useLocalStorage } from '../hooks';
import { CopyButton } from '../components/ui';

const steps = [
  { title: 'Create a resource share', description: 'The owner account defines the share and chooses which resources may be consumed.', command: 'aws ram create-resource-share --name SharedSubnet --no-allow-external-principals --region eu-north-1' },
  { title: 'Associate the subnet', description: 'A subnet is an eligible VPC resource that can be shared through AWS RAM.', command: 'aws ram associate-resource-share --resource-share-arn <share-arn> --resource-arns <subnet-arn> --region eu-north-1' },
  { title: 'Invite a principal', description: 'The owner targets a member account or an AWS Organization. Organization shares can be auto-accepted when sharing is enabled.', command: 'aws ram associate-resource-share --resource-share-arn <share-arn> --principals 818034793325 --region eu-north-1' },
  { title: 'Accept or auto-accept', description: 'An external account accepts an invitation. A principal in the same organization can see the shared subnet without invitation acceptance when RAM organization sharing is enabled.', command: 'aws ram accept-resource-share-invitation --resource-share-invitation-arn <invitation-arn> --region eu-north-1' },
  { title: 'Launch into the shared subnet', description: 'The member account launches an instance in the shared subnet; network ownership remains with the subnet owner.', command: 'aws ec2 run-instances --image-id <ami-id> --instance-type t3.micro --subnet-id subnet-0f2a2ee2bf32d17a1 --security-group-ids <security-group-id> --region eu-north-1' },
];

export function RamExplainerPage() {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState({ orgSharingEnabled: true, principalInSameOrg: true, subnetShared: true, sgAllowsSsh: false });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const current = steps[step];

  const simulate = async () => {
    setError('');
    try {
      const response = await api.post('/simulations/ram-share-check', inputs);
      setResult(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'Unable to run the local simulation.');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">Educational walkthrough</p>
        <h1 className="mt-2 text-3xl font-bold">How AWS RAM sharing works</h1>
        <p className="mt-2 text-sm text-slate-500">This stepper explains the real workflow. Nothing on this page changes AWS resources.</p>
      </header>
      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((item, index) => (
          <button key={item.title} type="button" onClick={() => setStep(index)} aria-current={step === index ? 'step' : undefined} className={`rounded-xl border p-3 text-left text-sm ${step === index ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-200 hover:bg-slate-50'}`}>
            <span className="block text-xs font-bold uppercase tracking-wide">Step {index + 1}</span>
            <span className="mt-1 block font-semibold">{item.title}</span>
          </button>
        ))}
      </div>
      <section className="rounded-2xl border border-slate-200 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Step {step + 1} of {steps.length}</p>
        <h2 className="mt-2 text-xl font-semibold">{current.title}</h2>
        <p className="mt-2 text-slate-600">{current.description}</p>
        <pre className="mt-4 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100"><code>{current.command}</code></pre>
        <div className="mt-3"><CopyButton value={current.command} /></div>
        <div className="mt-5 flex justify-between">
          <button type="button" onClick={() => setStep((index) => Math.max(index - 1, 0))} disabled={step === 0} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button>
          <button type="button" onClick={() => setStep((index) => Math.min(index + 1, steps.length - 1))} disabled={step === steps.length - 1} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40">Next</button>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 p-5">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-xl font-semibold">RAM what-if simulator</h2><p className="text-sm text-slate-500">Pure local check via the demo API. No AWS changes are made.</p></div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">Simulation – no AWS changes made</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ['orgSharingEnabled', 'Org sharing enabled?'],
            ['principalInSameOrg', 'Principal in same Org?'],
            ['subnetShared', 'Subnet shared?'],
            ['sgAllowsSsh', 'Security group allows SSH?'],
          ].map(([key, label]) => <label key={key} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><input type="checkbox" checked={inputs[key]} onChange={(event) => setInputs({ ...inputs, [key]: event.target.checked })} /><span>{label}</span></label>)}
        </div>
        <button type="button" onClick={simulate} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Run local simulation</button>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        {result && <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4"><p className="font-semibold">{result.outcome}</p><p className="mt-1 text-sm">{result.recommendation}</p></div>}
      </section>
    </div>
  );
}

const setupItems = [
  { label: 'Create the AWS Organization', path: 'AWS Organizations → AWS accounts → Add an AWS account', command: 'aws organizations create-organization --feature-set ALL' },
  { label: 'Create the owner VPC and subnet', path: 'VPC → Your VPCs → Create VPC; Subnets → Create subnet', command: 'aws ec2 create-vpc --cidr-block 10.0.0.0/16 --region eu-north-1\naws ec2 create-subnet --vpc-id <vpc-id> --cidr-block 10.0.1.0/24 --availability-zone eu-north-1a --region eu-north-1' },
  { label: 'Configure route table and network ACL', path: 'VPC → Route tables / Network ACLs', command: 'aws ec2 create-route-table --vpc-id <vpc-id> --region eu-north-1\naws ec2 associate-route-table --route-table-id <route-table-id> --subnet-id subnet-0f2a2ee2bf32d17a1 --region eu-north-1\naws ec2 create-network-acl --vpc-id <vpc-id> --region eu-north-1\naws ec2 create-network-acl-entry --network-acl-id <acl-id> --ingress --rule-number 100 --protocol 6 --port-range From=22,To=22 --cidr-block 0.0.0.0/0 --rule-action allow --region eu-north-1' },
  { label: 'Create the RAM share and associate subnet', path: 'AWS RAM → Resource shares → Create resource share', command: 'aws ram create-resource-share --name SharedSubnet --principals 818034793325 --resource-arns <subnet-arn> --region eu-north-1' },
  { label: 'Launch member-account EC2 instance', path: 'EC2 → Instances → Launch instance → Network settings', command: 'aws ec2 run-instances --image-id <ami-id> --instance-type t3.micro --subnet-id subnet-0f2a2ee2bf32d17a1 --region eu-north-1' },
  { label: 'Review security group rules', path: 'EC2 → Network & Security → Security Groups → Inbound rules', command: 'aws ec2 describe-security-groups --region eu-north-1' },
  { label: 'Review CloudTrail and CloudWatch', path: 'CloudTrail → Event history; CloudWatch → Metrics → EC2', command: 'aws cloudtrail lookup-events --region eu-north-1' },
];

export function SetupChecklistPage() {
  const [checked, setChecked] = useLocalStorage('cloudshare-setup-checklist', {});
  const [expanded, setExpanded] = useState(0);
  const completeCount = setupItems.filter((_, index) => checked[index]).length;
  const progress = Math.round((completeCount / setupItems.length) * 100);
  return (
    <div className="space-y-6">
      <header><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">Manual console work</p><h1 className="mt-2 text-3xl font-bold">Setup verification checklist</h1><p className="mt-2 text-sm text-slate-500">This records your review progress in this browser only. Commands are displayed for reference and are never executed.</p></header>
      <div className="flex items-center gap-5 rounded-2xl border border-slate-200 p-5">
        <div className="grid h-20 w-20 place-items-center rounded-full" style={{ background: `conic-gradient(#4f46e5 ${progress}%, #e2e8f0 ${progress}% 100%)` }}><div className="grid h-14 w-14 place-items-center rounded-full bg-white font-bold">{progress}%</div></div>
        <div><p className="text-lg font-semibold">{completeCount} of {setupItems.length} steps reviewed</p><p className="text-sm text-slate-500">Checklist state persists in local storage.</p></div>
      </div>
      <div className="space-y-3">
        {setupItems.map((item, index) => (
          <section key={item.label} className="rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3 p-4">
              <input aria-label={`Mark ${item.label} complete`} type="checkbox" checked={Boolean(checked[index])} onChange={(event) => setChecked({ ...checked, [index]: event.target.checked })} />
              <button type="button" className="flex flex-1 items-center justify-between text-left font-semibold" onClick={() => setExpanded(expanded === index ? -1 : index)} aria-expanded={expanded === index}>{item.label}<ChevronDown className={`h-4 w-4 transition ${expanded === index ? 'rotate-180' : ''}`} /></button>
            </div>
            {expanded === index && <div className="border-t border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">AWS Console navigation</p><p className="mt-1">{item.path}</p><pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100"><code>{item.command}</code></pre><div className="mt-2"><CopyButton value={item.command} /></div></div>}
          </section>
        ))}
      </div>
    </div>
  );
}

const commandLibrary = [
  ...setupItems,
  { label: 'Create RAM resource share', command: 'aws ram create-resource-share --name SharedSubnet --no-allow-external-principals --region eu-north-1' },
  { label: 'Associate the subnet resource', command: 'aws ram associate-resource-share --resource-share-arn <share-arn> --resource-arns <subnet-arn> --region eu-north-1' },
  { label: 'Share with the member account', command: 'aws ram associate-resource-share --resource-share-arn <share-arn> --principals 818034793325 --region eu-north-1' },
  { label: 'Accept a resource-share invitation', command: 'aws ram accept-resource-share-invitation --resource-share-invitation-arn <invitation-arn> --region eu-north-1' },
];

export function CliLibraryPage() {
  return (
    <div className="space-y-5">
      <header><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">Reference only</p><h1 className="mt-2 text-3xl font-bold">AWS CLI command library</h1><p className="mt-2 text-sm text-slate-500">Copying a command only places text on your clipboard. This application never executes AWS CLI commands.</p></header>
      <div className="space-y-3">{commandLibrary.map((item) => <section key={item.label} className="rounded-2xl border border-slate-200 p-4"><h2 className="font-semibold">{item.label}</h2><pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100"><code>{item.command}</code></pre><div className="mt-2"><CopyButton value={item.command} /></div></section>)}</div>
    </div>
  );
}

export function SecurityPosturePage() {
  const [groups, setGroups] = useState([]);
  const [acls, setAcls] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const loadPosture = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [securityGroups, networkAcls] = await Promise.all([
        api.get('/security-groups'),
        api.get('/network-acls'),
      ]);
      setGroups(securityGroups.data.data || []);
      setAcls(networkAcls.data.data || []);
    } catch (requestError) {
      setGroups([]);
      setAcls([]);
      setError(requestError.response?.data?.error?.message || 'Unable to calculate security posture from demo resources.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { loadPosture(); }, [loadPosture]);
  const openSsh = groups.some((group) => group.inbound?.some((rule) => rule.protocol === 'tcp' && rule.fromPort <= 22 && rule.toPort >= 22 && rule.cidr === '0.0.0.0/0'));
  const openNaclSsh = acls.some((acl) => acl.inboundRules?.some((rule) => rule.protocol === 'tcp' && rule.portRange === '22' && rule.cidr === '0.0.0.0/0' && rule.action === 'ALLOW'));
  const findings = [
    ...(openSsh ? [{ severity: 'Critical', points: 35, title: 'SSH open to the internet', detail: 'TCP/22 permits 0.0.0.0/0 in a security group.', recommendation: 'Restrict SSH to a trusted bastion or VPN CIDR.' }] : []),
    ...(openNaclSsh ? [{ severity: 'Medium', points: 10, title: 'Broad NACL ingress', detail: 'A subnet network ACL permits TCP/22 from 0.0.0.0/0.', recommendation: 'Narrow the CIDR range and confirm security group and NACL intent.' }] : []),
  ];
  const score = Math.max(0, 100 - findings.reduce((total, item) => total + item.points, 0));
  return (
    <div className="space-y-6">
      <header><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">Read-only assessment</p><h1 className="mt-2 text-3xl font-bold">Security posture</h1><p className="mt-2 text-sm text-slate-500">Score is derived from displayed demo configuration. It does not modify any security controls.</p></header>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="button" onClick={loadPosture} disabled={loading} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh assessment'}</button>
      <section className="flex flex-wrap items-center gap-6 rounded-2xl border border-slate-200 p-6">
        <div className="grid h-32 w-32 place-items-center rounded-full border-[14px] border-amber-400 text-3xl font-bold">{loading || error ? '—' : score}</div>
        <div><p className="text-xl font-semibold">{error ? 'Assessment unavailable' : findings.length ? 'Needs attention' : 'No flagged issues'}</p><p className="mt-1 text-sm text-slate-500">Starts at 100; each finding deducts risk points.</p><p className="mt-2 text-sm">Findings: {loading || error ? '—' : findings.length} · Recommendations: {loading || error ? '—' : findings.length}</p></div>
      </section>
      {error ? null : loading ? <p role="status" className="text-sm text-slate-500">Calculating from demo security group and NACL rules…</p> : findings.length ? <div className="space-y-3">{findings.map((item) => <section key={item.title} className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-amber-700" /><span className="text-xs font-bold uppercase text-amber-800">{item.severity}</span></div><h2 className="mt-2 text-lg font-semibold">{item.title}</h2><p className="mt-1 text-sm text-slate-700">{item.detail}</p><p className="mt-2 text-sm font-semibold">Recommendation: {item.recommendation}</p></section>)}</div> : <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">No matching high-risk SSH findings were detected in the loaded demo rules.</p>}
    </div>
  );
}

export function CidrCalculatorPage() {
  const [cidr, setCidr] = useState('10.0.1.0/24');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const calculate = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await api.post('/tools/cidr-calc', { cidr });
      setResult(response.data.data);
    } catch (requestError) {
      setResult(null);
      setError(requestError.response?.data?.error?.message || 'Enter a valid IPv4 CIDR, for example 10.0.1.0/24.');
    }
  };
  return (
    <div className="space-y-6">
      <header><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">Pure calculation</p><h1 className="mt-2 text-3xl font-bold">CIDR calculator</h1><p className="mt-2 text-sm text-slate-500">AWS reserves the first four and last IPv4 addresses in every subnet.</p></header>
      <form onSubmit={calculate} className="flex flex-wrap gap-3"><label htmlFor="cidr-input" className="sr-only">CIDR notation</label><input id="cidr-input" value={cidr} onChange={(event) => setCidr(event.target.value)} required className="min-w-64 flex-1 rounded-xl border border-slate-300 px-4 py-3" placeholder="10.0.1.0/24" /><button type="submit" className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white">Calculate</button></form>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {result && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[['Network', result.network], ['Broadcast', result.broadcast], ['First host', result.firstHost], ['Last host', result.lastHost], ['Usable IPs before AWS reservation', result.usableHosts], ['Available after AWS reservation', result.availableInstanceIps]].map(([title, value]) => <div key={title} className="rounded-2xl border border-slate-200 p-4"><p className="text-sm text-slate-500">{title}</p><p className="mt-1 font-mono text-lg font-semibold">{value}</p></div>)}</div>}
      {result && <section className="rounded-2xl border border-slate-200 p-5"><div className="flex justify-between text-sm"><span>Reserved (first 4 + last 1)</span><span>{result.reservedHosts} addresses</span></div><div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-emerald-500" style={{ width: `${Math.max(1, result.availableInstanceIps / result.totalAddresses * 100)}%` }} /></div><p className="mt-2 text-xs text-slate-500">Available to instances after AWS subnet reservations: {result.availableInstanceIps} of {result.totalAddresses} addresses.</p></section>}
    </div>
  );
}

const quizQuestions = [
  { question: 'What does AWS RAM allow you to share across accounts?', options: ['Selected AWS resources', 'IAM user passwords', 'Root credentials'], answer: 0 },
  { question: 'Who owns a shared VPC subnet?', options: ['The account that launched an instance', 'The account that created the subnet', 'AWS RAM'], answer: 1 },
  { question: 'What is the network address of 10.0.1.0/24?', options: ['10.0.1.1', '10.0.1.0', '10.0.1.255'], answer: 1 },
  { question: 'Which control is stateful?', options: ['Security group', 'Network ACL', 'Route table'], answer: 0 },
  { question: 'Which control is stateless and subnet-associated?', options: ['Security group', 'Network ACL', 'RAM share'], answer: 1 },
  { question: 'How many IPv4 addresses does AWS reserve per subnet?', options: ['2', '5', '8'], answer: 1 },
  { question: 'Which service records AWS API activity?', options: ['CloudWatch', 'CloudTrail', 'AWS RAM'], answer: 1 },
  { question: 'Does this project create real AWS resources?', options: ['Yes', 'No, it visualizes demo data only', 'Only when exporting'], answer: 1 },
];

export function QuizPage() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const score = quizQuestions.reduce((sum, item, index) => sum + (answers[index] === item.answer ? 1 : 0), 0);
  return (
    <div className="space-y-6">
      <header><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">Knowledge check</p><h1 className="mt-2 text-3xl font-bold">Cloud networking mini quiz</h1><p className="mt-2 text-sm text-slate-500">Eight questions. Feedback appears after you check your answers.</p></header>
      {quizQuestions.map((item, index) => <fieldset key={item.question} className="rounded-2xl border border-slate-200 p-4"><legend className="px-1 font-semibold">{index + 1}. {item.question}</legend><div className="mt-2 space-y-2">{item.options.map((option, choice) => <label key={option} className="flex items-center gap-2 rounded-lg p-2 hover:bg-slate-50"><input type="radio" name={`quiz-${index}`} checked={answers[index] === choice} onChange={() => setAnswers({ ...answers, [index]: choice })} />{option}{submitted && answers[index] === choice && <span className={choice === item.answer ? 'text-emerald-700' : 'text-red-700'}>{choice === item.answer ? 'Correct' : 'Review'}</span>}</label>)}</div></fieldset>)}
      <button type="button" onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length !== quizQuestions.length} className="rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-40">Check answers</button>
      {submitted && <p role="status" className="font-semibold">Score: {score} / {quizQuestions.length}</p>}
    </div>
  );
}

const slides = [
  { title: 'CloudShare Manager', body: 'A transparent demo for cross-account AWS subnet sharing and network monitoring.', href: '/dashboard', label: 'Overview' },
  { title: 'Architecture', body: 'A management account owns a VPC and subnet. AWS RAM shares the subnet with a member account.', href: '/architecture', label: 'Open architecture' },
  { title: 'AWS RAM', body: 'A resource share associates a subnet with a principal. Sharing grants use of the subnet; the owner retains ownership.', href: '/ram', label: 'Open RAM share' },
  { title: 'EC2 and security', body: 'The member account instance uses the shared subnet. The demo also highlights SSH open to the internet.', href: '/ec2', label: 'Open EC2' },
  { title: 'Monitoring', body: 'CloudTrail and CloudWatch panels are clearly marked DEMO DATA and are not live AWS telemetry.', href: '/cloudwatch', label: 'Open monitoring' },
];

export function PresentationPage() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') setIndex((value) => Math.min(value + 1, slides.length - 1));
      if (event.key === 'ArrowLeft') setIndex((value) => Math.max(value - 1, 0));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const slide = slides[index];
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col justify-between bg-slate-950 p-6 text-white md:p-14">
      <div className="flex items-center justify-between"><Link to="/dashboard" className="text-sm text-slate-300 underline">Exit presentation</Link><span className="text-sm text-slate-400">Slide {index + 1} / {slides.length}</span></div>
      <main className="mx-auto w-full max-w-4xl"><p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">CloudShare Manager · Viva mode</p><h1 className="mt-6 text-4xl font-bold md:text-6xl">{slide.title}</h1><p className="mt-6 max-w-3xl text-xl leading-relaxed text-slate-300">{slide.body}</p><Link to={slide.href} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold">{slide.label}<ArrowRight className="h-4 w-4" /></Link></main>
      <div className="flex items-center justify-between"><button type="button" aria-label="Previous slide" onClick={() => setIndex((value) => Math.max(value - 1, 0))} disabled={index === 0} className="rounded-xl border border-slate-700 p-3 disabled:opacity-30"><ArrowLeft /></button><div className="flex gap-2">{slides.map((item, dot) => <button key={item.title} type="button" aria-label={`Go to slide ${dot + 1}`} onClick={() => setIndex(dot)} className={`h-2.5 w-8 rounded-full ${index === dot ? 'bg-indigo-400' : 'bg-slate-700'}`} />)}</div><button type="button" aria-label="Next slide" onClick={() => setIndex((value) => Math.min(value + 1, slides.length - 1))} disabled={index === slides.length - 1} className="rounded-xl border border-slate-700 p-3 disabled:opacity-30"><ArrowRight /></button></div>
    </div>
  );
}

export function NotFoundDetails() {
  return <div className="mt-6"><Link to="/dashboard" className="text-indigo-600 underline">Return to dashboard</Link></div>;
}
