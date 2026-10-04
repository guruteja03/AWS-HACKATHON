import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function CpuChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="cpuFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="value" stroke="#4f46e5" fill="url(#cpuFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function NetworkChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="inbound" fill="#22c55e" name="NetworkIn" />
        <Bar dataKey="outbound" fill="#3b82f6" name="NetworkOut" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CloudWatchChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="cpu" stroke="#4f46e5" name="CPU %" />
        <Line type="monotone" dataKey="inbound" stroke="#22c55e" name="NetworkIn" />
        <Line type="monotone" dataKey="outbound" stroke="#f59e0b" name="NetworkOut" />
      </LineChart>
    </ResponsiveContainer>
  );
}
