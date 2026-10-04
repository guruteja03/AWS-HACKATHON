import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(async (path) => {
      if (path === '/health') return { data: { data: { mode: 'mock' } } };
      if (path === '/dashboard') return { data: { data: { summary: {}, cloudWatchMetrics: { metrics: { CPU: [], NetworkIn: [], NetworkOut: [] } }, accounts: [], vpcs: [], subnets: [] } } };
      if (path === '/architecture') return { data: { data: { resources: [{ id: 'ram-1', type: 'RAM', label: 'RAM Share', x: 100, y: 100 }], links: [] } } };
      if (path === '/cloudwatch/metrics') return { data: { data: { metrics: { CPU: [], NetworkIn: [], NetworkOut: [] } } } };
      if (path === '/ip-addressing') return { data: { data: { cidr: '10.0.1.0/24', freeIps: 250, reservedHosts: 5, usableHosts: 251, network: '10.0.1.0', broadcast: '10.0.1.255' } } };
      return { data: { data: [] } };
    }),
    post: vi.fn(async () => ({ data: { data: { token: 'test-token', user: { email: 'demo@example.com' } } } })),
  },
}));

const routes = [
  ['/dashboard', 'Dashboard'],
  ['/accounts', 'Accounts'],
  ['/network', 'VPC & Network'],
  ['/ram', 'RAM'],
  ['/ec2', 'EC2'],
  ['/security-groups', 'Security Groups'],
  ['/network-acls', 'Network ACLs'],
  ['/ip-addressing', 'IP Addressing'],
  ['/cloudtrail', 'CloudTrail'],
  ['/cloudwatch', 'CloudWatch'],
  ['/architecture', 'Architecture & topology'],
  ['/documentation', 'Documentation'],
  ['/ram-explainer', 'How AWS RAM sharing works'],
  ['/setup', 'Setup verification checklist'],
  ['/cli-commands', 'AWS CLI command library'],
  ['/security-posture', 'Security posture'],
  ['/cidr-calculator', 'CIDR calculator'],
  ['/quiz', 'Cloud networking mini quiz'],
  ['/presentation', 'CloudShare Manager'],
];

afterEach(() => {
  window.history.replaceState({}, '', '/');
  api.get.mockImplementation(async (path) => {
    if (path === '/health') return { data: { data: { mode: 'mock' } } };
    if (path === '/dashboard') return { data: { data: { summary: {}, cloudWatchMetrics: { metrics: { CPU: [], NetworkIn: [], NetworkOut: [] } }, accounts: [], vpcs: [], subnets: [] } } };
    if (path === '/architecture') return { data: { data: { resources: [{ id: 'ram-1', type: 'RAM', label: 'RAM Share', x: 100, y: 100 }], links: [] } } };
    if (path === '/cloudwatch/metrics') return { data: { data: { metrics: { CPU: [], NetworkIn: [], NetworkOut: [] } } } };
    if (path === '/ip-addressing') return { data: { data: { cidr: '10.0.1.0/24', freeIps: 250, reservedHosts: 5, usableHosts: 251, network: '10.0.1.0', broadcast: '10.0.1.255' } } };
    if (path === '/accounts') return { data: { data: [{ id: '183079729972', name: 'Sravanthi', accountType: 'Management Account', status: 'Active' }, { id: '818034793325', name: 'Chaitu', accountType: 'Member Account', status: 'Active' }] } };
    return { data: { data: [] } };
  });
});

describe('route smoke tests', () => {
  it('renders the public login page', () => {
    window.history.replaceState({}, '', '/login');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it.each(routes)('renders %s without crashing', async (path, heading) => {
    localStorage.setItem('cloudshare-demo-token', 'mocked-token');
    window.history.replaceState({}, '', path);
    render(<App />);
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('shows the not-found page for unknown routes', () => {
    localStorage.setItem('cloudshare-demo-token', 'mocked-token');
    window.history.replaceState({}, '', '/not-a-route');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('logs in through the demo API and navigates to the dashboard', async () => {
    window.history.replaceState({}, '', '/login');
    render(<App />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'demo@example.test' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-only-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to dashboard' }));
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('opens a resource from the command palette', async () => {
    localStorage.setItem('cloudshare-demo-token', 'mocked-token');
    window.history.replaceState({}, '', '/dashboard');
    render(<App />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    fireEvent.click(await screen.findByRole('button', { name: /SharedSubnet/ }));
    expect(await screen.findByRole('heading', { name: 'RAM' })).toBeInTheDocument();
  });

  it('navigates between project options', async () => {
    localStorage.setItem('cloudshare-demo-token', 'mocked-token');
    window.history.replaceState({}, '', '/dashboard');
    render(<App />);
    fireEvent.click(await screen.findByRole('link', { name: 'Go to next option: Accounts' }));
    expect(await screen.findByRole('heading', { name: 'Accounts' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to previous option: Dashboard' })).toBeInTheDocument();
  });

  it('masks account identifiers and searches table rows', async () => {
    api.get.mockImplementation(async (path) => path === '/accounts'
      ? { data: { data: [{ id: '183079729972', name: 'Sravanthi', accountType: 'Management Account', status: 'Active' }] } }
      : { data: { data: { mode: 'mock' } } });
    localStorage.setItem('cloudshare-demo-token', 'mocked-token');
    window.history.replaceState({}, '', '/accounts');
    render(<App />);
    expect(await screen.findByText('183079729972')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mask account IDs' }));
    expect(screen.getByText('1830****9972')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search Accounts' }), { target: { value: 'not found' } });
    expect(screen.getByText('No matching rows')).toBeInTheDocument();
  });

  it('opens architecture details and runs a local RAM simulation', async () => {
    localStorage.setItem('cloudshare-demo-token', 'mocked-token');
    window.history.replaceState({}, '', '/architecture');
    const { unmount } = render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'View RAM Share details' }));
    expect(screen.getByRole('dialog', { name: 'Resource details' })).toBeInTheDocument();
    unmount();

    window.history.replaceState({}, '', '/ram-explainer');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Run local simulation' }));
    expect(await screen.findByText('Simulation – no AWS changes made')).toBeInTheDocument();
  });

  it('advances presentation slides with the keyboard', async () => {
    localStorage.setItem('cloudshare-demo-token', 'mocked-token');
    window.history.replaceState({}, '', '/presentation');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'CloudShare Manager' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Architecture' })).toBeInTheDocument());
  });
});
