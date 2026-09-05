import { useEffect, useState } from "react";
import { Activity, AlertTriangle, BarChart3, MapPin } from "lucide-react";
import {
  StatCard,
  Card,
  CardBody,
  CardHeader,
} from "../../components/ui/Card/Card";
import Table from "../../components/ui/Table/Table";
import { RiskBadge } from "../../components/ui/Badge/Badge";
import ChartContainer from "../../components/charts/ChartContainer";
import BarChartView from "../../components/charts/BarChartView";
import { getIncidents } from "../../services/incidentService";
import { getAnalytics } from "../../services/analyticsService";
import { SkeletonCard } from "../../components/ui/Loading/Loading";

function DashboardPage() {
  const [incidents, setIncidents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getIncidents(), getAnalytics()]).then(([i, a]) => {
      setIncidents(i);
      setAnalytics(a);
      setLoading(false);
    });
  }, []);

  const highRiskCount = incidents.filter((i) =>
    ["High", "Critical"].includes(i.riskLevel),
  ).length;

  const columns = [
    { key: "id", title: "Incident ID" },
    { key: "type", title: "Crime Type" },
    { key: "location", title: "Location" },
    { key: "date", title: "Date" },
    { key: "risk", title: "Risk" },
    { key: "status", title: "Status" },
  ];

  const data = incidents.slice(0, 5).map((i) => ({
    id: i.id,
    type: i.type,
    location: i.location,
    date: i.date,
    risk: <RiskBadge level={i.riskLevel} />,
    status: i.status,
  }));

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="section-title">Dashboard</h2>
        <p className="section-subtitle">
          Operational overview of incidents and hotspot risk.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Crime Incidents"
          value={incidents.length}
          icon={<Activity size={18} />}
        />
        <StatCard
          title="High-Risk Locations"
          value={highRiskCount}
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          title="Predictions Generated"
          value="128"
          icon={<BarChart3 size={18} />}
        />
        <StatCard
          title="Active Hotspots"
          value="9"
          icon={<MapPin size={18} />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartContainer title="Crime Trend (Last 7 Days)">
          <BarChartView data={analytics?.trendData || []} />
        </ChartContainer>
        <Card>
          <CardHeader>
            <h3>Risk Overview</h3>
          </CardHeader>
          <CardBody className="space-y-2">
            {analytics?.riskOverview.map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <span>{r.label} Risk</span>
                <span className="font-semibold">{r.value}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3>Recent Incidents</h3>
        </CardHeader>
        <CardBody>
          <Table columns={columns} data={data} />
        </CardBody>
      </Card>
    </section>
  );
}

export default DashboardPage;
