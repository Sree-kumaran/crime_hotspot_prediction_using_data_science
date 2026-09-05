import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import Button from "../../components/ui/Button/Button";
import MapContainer from "../../components/map/MapContainer";
import RiskLegend from "../../components/map/RiskLegend";

function MapPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="section-title">Crime Map</h2>
        <p className="section-subtitle">
          Hotspot and marker visualization (mock data mode).
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3>Map Filters</h3>
        </CardHeader>
        <CardBody className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input label="Search location" placeholder="Enter location..." />
          <Select
            label="Crime type"
            options={[
              { value: "theft", label: "Theft" },
              { value: "assault", label: "Assault" },
            ]}
          />
          <Select
            label="Risk level"
            options={[
              { value: "low", label: "Low" },
              { value: "high", label: "High" },
            ]}
          />
          <Input label="Start date" type="date" />
          <div className="flex items-end">
            <Button className="w-full">Apply</Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MapContainer height="h-[420px]" />
        </div>
        <RiskLegend />
      </div>
    </section>
  );
}

export default MapPage;
