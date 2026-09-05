import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Select from "../../components/ui/Select/Select";
import Input from "../../components/ui/Input/Input";
import ChartContainer from "../../components/charts/ChartContainer";
import BarChartView from "../../components/charts/BarChartView";
import { getAnalytics } from "../../services/analyticsService";

function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAnalytics().then(setData);
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="section-title">Analytics</h2>
        <p className="section-subtitle">
          Crime trend and distribution analysis (mock data).
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3>Filters</h3>
        </CardHeader>
        <CardBody className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input label="From" type="date" />
          <Input label="To" type="date" />
          <Select
            label="Crime Type"
            options={[
              { value: "theft", label: "Theft" },
              { value: "assault", label: "Assault" },
            ]}
          />
          <Select
            label="Risk Level"
            options={[
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ]}
          />
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartContainer title="Crime Trend">
          <BarChartView data={data?.trendData || []} />
        </ChartContainer>
        <Card>
          <CardHeader>
            <h3>Crime Type Distribution</h3>
          </CardHeader>
          <CardBody className="space-y-2">
            {data?.crimeDistribution?.map((item) => (
              <div key={item.label} className="flex justify-between">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

export default AnalyticsPage;
