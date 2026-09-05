import { useState } from "react";
import { Activity } from "lucide-react";
import Layout from "./layout/Layout";
import Button from "./ui/Button/Button";
import { Card, CardBody, CardHeader, StatCard } from "./ui/Card/Card";
import Input from "./ui/Input/Input";
import Textarea from "./ui/Input/Textarea";
import Select from "./ui/Select/Select";
import { Badge, RiskBadge } from "./ui/Badge/Badge";
import Alert from "./ui/Alert/Alert";
import { Spinner, SkeletonCard } from "./ui/Loading/Loading";
import ErrorState from "./ui/ErrorState/ErrorState";
import EmptyState from "./ui/EmptyState/EmptyState";
import Modal from "./ui/Modal/Modal";
import Table from "./ui/Table/Table";
import MapContainer from "./map/MapContainer";
import RiskLegend from "./map/RiskLegend";
import ChartContainer from "./charts/ChartContainer";
import BarChartView from "./charts/BarChartView";

function DesignSystemShowcase() {
  const [open, setOpen] = useState(false);

  const tableColumns = [
    { key: "location", title: "Location" },
    { key: "risk", title: "Risk" },
    { key: "incidents", title: "Incidents" },
  ];
  const tableData = [
    { location: "Sector A", risk: <RiskBadge level="High" />, incidents: 24 },
    {
      location: "Sector B",
      risk: <RiskBadge level="Moderate" />,
      incidents: 12,
    },
  ];
  const chartData = [
    { name: "Mon", value: 14 },
    { name: "Tue", value: 20 },
    { name: "Wed", value: 11 },
    { name: "Thu", value: 18 },
  ];

  return (
    <Layout>
      <section className="space-y-6">
        <div>
          <h2 className="section-title">Design System Showcase</h2>
          <p className="section-subtitle">
            Reusable UI foundations for the Crime Hotspot system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            title="High Risk Zones"
            value="18"
            icon={<Activity size={18} />}
            description="Updated from mock data"
          />
          <SkeletonCard />
          <Card>
            <CardBody>
              <Spinner />
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h3>Buttons & Badges</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <RiskBadge level="Critical" />
            </div>
          </CardBody>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <h3>Inputs</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Input label="Search location" placeholder="Enter location..." />
              <Input label="Incidents count" type="number" />
              <Input label="Date" type="date" />
              <Select
                label="Risk level"
                options={[
                  { value: "high", label: "High" },
                  { value: "moderate", label: "Moderate" },
                ]}
              />
              <Textarea label="Notes" placeholder="Add analyst notes..." />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3>Alerts / States</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Alert
                type="warning"
                title="High Crime Risk"
                message="This area has a higher predicted crime probability."
              />
              <Alert
                type="success"
                title="Update Complete"
                message="Records processed successfully."
              />
              <ErrorState
                title="Unable to load data"
                message="Try again in a few moments."
                onRetry={() => {}}
              />
              <EmptyState
                title="No alerts"
                description="There are no active alerts for this selection."
              />
            </CardBody>
          </Card>
        </div>

        <Table columns={tableColumns} data={tableData} />

        <div className="grid lg:grid-cols-2 gap-4">
          <MapContainer />
          <RiskLegend />
        </div>

        <ChartContainer title="Incidents Trend (Mock)">
          <BarChartView data={chartData} />
        </ChartContainer>

        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Crime Details"
          footer={<Button onClick={() => setOpen(false)}>Close</Button>}
        >
          <p className="text-small text-text-secondary">
            Reusable modal component for future detail/confirmation flows.
          </p>
        </Modal>
      </section>
    </Layout>
  );
}

export default DesignSystemShowcase;
