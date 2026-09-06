import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-palette-prussian border border-palette-grape p-2.5 rounded-lg shadow-xl text-xs text-palette-almond">
        <p className="font-semibold text-palette-lilac">{label}</p>
        <p className="font-bold text-palette-almond mt-0.5">
          Count: <span className="text-palette-almond">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

function BarChartView({ data = [] }) {
  // Support both label/value and name/value
  const formattedData = data.map((d) => ({
    name: d.name || d.label || d.date || "-",
    value: d.value ?? d.count ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262c4d" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#a69cac"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: "#262c4d" }}
        />
        <YAxis
          stroke="#a69cac"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: "#262c4d" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" fill="#f1dac4" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default BarChartView;
