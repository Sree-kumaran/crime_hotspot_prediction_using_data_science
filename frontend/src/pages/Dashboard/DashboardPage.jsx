import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, BarChart3, MapPin, RefreshCw, Layers } from "lucide-react";

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
      setError(err?.message || "Unable to load crime intelligence dashboard data.");
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

  const recentIncidentRows = incidents.slice(0, 8).map((i) => ({
    id: <span className="font-mono text-palette-almond text-xs">{i.id || i._id || "-"}</span>,
    type: <span className="font-semibold text-palette-almond capitalize">{i.crime_type || i.type || "-"}</span>,
    location: i.location || i.area || "-",
    date: i.date || "-",
    risk: <RiskBadge level={i.severity || i.riskLevel || "Moderate"} />,
    status: (
      <span className="text-xs px-2 py-0.5 rounded bg-[#1e2444] border border-[#2b3254] text-palette-lilac">
        {i.status || "Open"}
      </span>
    ),
  }));

  const tableColumns = [
    { key: "id", title: "Incident ID" },
    { key: "type", title: "Crime Type" },
    { key: "location", title: "Location Area" },
    { key: "date", title: "Date" },
    { key: "risk", title: "Risk Level" },
    { key: "status", title: "Status" },
  ];

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="pb-1 border-b border-[#262c4d]">
          <h2 className="section-title">Crime Intelligence Dashboard</h2>
          <p className="section-subtitle">Aggregating live NYC incident and hotspot data...</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <h2 className="section-title">Crime Intelligence Dashboard</h2>
        <Alert type="error" title="Dashboard Load Failure" message={error} />
        <Button variant="secondary" onClick={loadDashboard}>Retry Connection</Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#262c4d]">
        <div>
          <h2 className="section-title">Crime Intelligence Dashboard</h2>
          <p className="section-subtitle">
            Operational overview of geospatial incidents, hotspot risk indicators, and neural predictions
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={loadDashboard}
          className="flex items-center gap-1.5 self-start sm:self-auto text-xs"
        >
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Crime Incidents"
          value={totalIncidents}
          icon={<Activity size={18} />}
          description="Logged incidents in database"
        />
        <StatCard
          title="High-Risk Incidents"
          value={highRiskCount}
          icon={<AlertTriangle size={18} className="text-red-400" />}
          description="Assault, robbery & violent felonies"
        />
        <StatCard
          title="Neural Predictions Logged"
          value={predictionStats.totalPredictions}
          icon={<BarChart3 size={18} className="text-palette-almond" />}
          description="ConvLSTM spatiotemporal runs"
        />
        <StatCard
          title="Active Hotspots Monitored"
          value={predictionStats.activeHotspots}
          icon={<MapPin size={18} className="text-palette-almond" />}
          description="Top-20 density clusters"
        />
      </div>

      {/* Analytics Charts & Risk Breakdown */}
      <div className="grid lg:grid-cols-2 gap-5">
        <ChartContainer title="14-Day Crime Incident Trend">
          {analytics.trendData.length ? (
            <BarChartView data={analytics.trendData} />
          ) : (
            <EmptyState
              title="No trend data recorded"
              description="Incident trend history will appear as records are logged."
            />
          )}
        </ChartContainer>

        <Card className="border-[#262c4d]">
          <CardHeader className="bg-palette-ink/40">
            <h3 className="text-sm font-semibold text-palette-almond">
              Severity & Risk Level Breakdown
            </h3>
          </CardHeader>
          <CardBody className="space-y-3 p-5">
            {analytics.riskOverview.length ? (
              analytics.riskOverview.map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between p-3 rounded-lg bg-palette-ink border border-[#262c4d]"
                >
                  <div className="flex items-center gap-2">
                    <RiskBadge level={r.label} />
                  </div>
                  <span className="font-bold text-palette-almond text-sm">{r.value} Incidents</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-palette-lilac">
                No risk breakdown data available.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Incidents Table */}
      <Card className="border-[#262c4d]">
        <CardHeader className="flex justify-between items-center bg-palette-ink/40">
          <h3 className="text-sm font-semibold text-palette-almond">
            Recent Crime Incidents Registry
          </h3>
          <span className="text-[11px] text-palette-lilac">Showing latest recorded incidents</span>
        </CardHeader>
        <CardBody className="p-0">
          {recentIncidentRows.length ? (
            <Table columns={tableColumns} data={recentIncidentRows} />
          ) : (
            <div className="p-5">
              <EmptyState
                title="No crime incident records"
                description="The crimes collection currently has no active records."
              />
            </div>
          )}
        </CardBody>
      </Card>
    </section>
  );
}

export default DashboardPage;
