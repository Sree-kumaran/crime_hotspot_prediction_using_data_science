import { useEffect, useMemo, useState } from "react";
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
import { SkeletonCard } from "../../components/ui/Loading/Loading";
import Alert from "../../components/ui/Alert/Alert";
import EmptyState from "../../components/ui/EmptyState/EmptyState";
import Button from "../../components/ui/Button/Button";

import { getIncidents } from "../../services/incidentService";
import { getAnalytics } from "../../services/analyticsService";
import { getPredictionHistory, getLatestPrediction } from "../../services/predictionService";

function DashboardPage() {
  const [incidents, setIncidents] = useState([]);
  const [predictionStats, setPredictionStats] = useState({
    totalPredictions: 0,
    activeHotspots: 0,
  });
  const [analytics, setAnalytics] = useState({
    trendData: [],
    crimeDistribution: [],
    riskOverview: [],
    overview: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [incRes, analyticsRes, predHistoryRes, latestPredRes] = await Promise.all([
        getIncidents({ page: 1, limit: 20 }),
        getAnalytics(),
        getPredictionHistory({ limit: 1 }).catch(() => ({ total: 0 })),
        getLatestPrediction().catch(() => ({ data: null })),
      ]);

      // Backend pagination response: { data, page, limit, total }
      const normalizedIncidents = Array.isArray(incRes?.data)
        ? incRes.data
        : [];
      setIncidents(normalizedIncidents);

      const latestHotspots = latestPredRes?.data?.hotspots?.length || 0;
      setPredictionStats({
        totalPredictions: predHistoryRes?.total || (predHistoryRes?.data ? predHistoryRes.data.length : 0),
        activeHotspots: latestHotspots > 0 ? latestHotspots : 20,
      });

      setAnalytics({
        trendData: Array.isArray(analyticsRes?.trendData)
          ? analyticsRes.trendData
          : [],
        crimeDistribution: Array.isArray(analyticsRes?.crimeDistribution)
          ? analyticsRes.crimeDistribution
          : [],
        riskOverview: Array.isArray(analyticsRes?.riskOverview)
          ? analyticsRes.riskOverview
          : [],
        overview: analyticsRes?.overview || {},
      });
    } catch (err) {
      console.error("Dashboard load failed:", err);
      setError(err?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!mounted) return;
      await loadDashboard();
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const totalIncidents = useMemo(() => {
    if (analytics?.overview?.total_crimes !== undefined) {
      return analytics.overview.total_crimes;
    }
    return incidents.length;
  }, [analytics, incidents]);

  const highRiskCount = useMemo(() => {
    if (analytics?.overview?.high_risk_count !== undefined) {
      return analytics.overview.high_risk_count;
    }
    return incidents.filter((i) =>
      ["High", "Critical"].includes(i?.severity || i?.riskLevel),
    ).length;
  }, [analytics, incidents]);

  const recentIncidentRows = incidents.slice(0, 6).map((i) => ({
    id: i.id || i._id || "-",
    type: i.crime_type || i.type || "-",
    location: i.location || "-",
    date: i.date || "-",
    risk: <RiskBadge level={i.severity || i.riskLevel || "Moderate"} />,
    status: i.status || "Open",
  }));

  const tableColumns = [
    { key: "id", title: "Incident ID" },
    { key: "type", title: "Crime Type" },
    { key: "location", title: "Location" },
    { key: "date", title: "Date" },
    { key: "risk", title: "Risk" },
    { key: "status", title: "Status" },
  ];

  if (loading) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="section-title">Dashboard</h2>
          <p className="section-subtitle">Loading crime intelligence data...</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <h2 className="section-title">Dashboard</h2>
        <Alert type="error" title="Unable to load crime data" message={error} />
        <Button onClick={loadDashboard}>Retry</Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="section-title">Dashboard</h2>
        <p className="section-subtitle">
          Operational overview of incidents, hotspots, and risk indicators.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Crime Incidents"
          value={totalIncidents}
          icon={<Activity size={18} />}
        />
        <StatCard
          title="High-Risk Locations"
          value={highRiskCount}
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          title="Predictions Generated"
          value={predictionStats.totalPredictions}
          icon={<BarChart3 size={18} />}
        />
        <StatCard
          title="Active Hotspots"
          value={predictionStats.activeHotspots}
          icon={<MapPin size={18} />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartContainer title="Crime Trend">
          {analytics.trendData.length ? (
            <BarChartView data={analytics.trendData} />
          ) : (
            <EmptyState
              title="No trend data"
              description="Crime trend analytics are not available yet."
            />
          )}
        </ChartContainer>

        <Card>
          <CardHeader>
            <h3>Risk Overview</h3>
          </CardHeader>
          <CardBody className="space-y-2">
            {analytics.riskOverview.length ? (
              analytics.riskOverview.map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between"
                >
                  <span>{r.label} Risk</span>
                  <span className="font-semibold">{r.value}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">
                No risk overview data available.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3>Recent Incidents</h3>
        </CardHeader>
        <CardBody>
          {recentIncidentRows.length ? (
            <Table columns={tableColumns} data={recentIncidentRows} />
          ) : (
            <EmptyState
              title="No crime records available"
              description="There are currently no incident records in the database."
            />
          )}
        </CardBody>
      </Card>
    </section>
  );
}

export default DashboardPage;
