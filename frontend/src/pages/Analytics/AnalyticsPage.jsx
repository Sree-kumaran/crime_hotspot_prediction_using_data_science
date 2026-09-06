import { useEffect, useState } from "react";
import { BarChart3, Filter, RefreshCw, PieChart } from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Select from "../../components/ui/Select/Select";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import ChartContainer from "../../components/charts/ChartContainer";
import BarChartView from "../../components/charts/BarChartView";
import { getAnalytics } from "../../services/analyticsService";
import { SkeletonCard } from "../../components/ui/Loading/Loading";
import Alert from "../../components/ui/Alert/Alert";

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAnalytics();
      setData(res);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err?.message || "Failed to load crime analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#262c4d]">
        <div>
          <h2 className="section-title flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-palette-almond" />
            Spatiotemporal Analytics & Crime Trends
          </h2>
          <p className="section-subtitle">
            Longitudinal incident distribution and frequency analytics across NYC
          </p>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={loadAnalytics}
          disabled={loading}
          className="flex items-center gap-1.5 self-start sm:self-auto text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Analytics
        </Button>
      </div>

      {error && <Alert type="error" title="Analytics Error" message={error} />}

      {loading ? (
        <div className="grid lg:grid-cols-2 gap-5">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          <ChartContainer title="14-Day Crime Frequency Trend">
            <BarChartView data={data?.trendData || []} />
          </ChartContainer>

          <Card className="border-[#262c4d]">
            <CardHeader className="bg-palette-ink/40">
              <h3 className="text-sm font-semibold text-palette-almond flex items-center gap-2">
                <PieChart className="w-4 h-4 text-palette-almond" />
                Crime Category Distribution
              </h3>
            </CardHeader>
            <CardBody className="space-y-2.5 p-5">
              {data?.crimeDistribution?.length ? (
                data.crimeDistribution.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-lg bg-palette-ink border border-[#262c4d]"
                  >
                    <span className="font-semibold text-palette-almond capitalize text-xs md:text-sm">
                      {item.label}
                    </span>
                    <span className="font-bold text-palette-almond text-xs md:text-sm bg-[#1e2444] px-2.5 py-1 rounded border border-[#2b3254]">
                      {item.value} Incidents
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-palette-lilac">
                  No category distribution records available.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </section>
  );
}

export default AnalyticsPage;
