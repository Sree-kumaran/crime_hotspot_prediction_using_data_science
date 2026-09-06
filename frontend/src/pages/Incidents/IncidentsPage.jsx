import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import Button from "../../components/ui/Button/Button";
import Table from "../../components/ui/Table/Table";
import { RiskBadge } from "../../components/ui/Badge/Badge";
import { getIncidents } from "../../services/incidentService";

function IncidentsPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("");
  const [type, setType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getIncidents({ limit: 100 }).then((res) => {
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setRows(list);
    }).catch((err) => {
      console.error("Failed to fetch incidents:", err);
      setRows([]);
    });
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const id = r.id || r._id || "";
      const loc = r.location || r.area || "";
      const t = r.crime_type || r.type || "";
      const sev = r.severity || r.riskLevel || "";

      const matchSearch = [id, loc, t]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchRisk = risk ? sev.toLowerCase() === risk.toLowerCase() : true;
      const matchType = type ? t.toLowerCase() === type.toLowerCase() : true;
      return matchSearch && matchRisk && matchType;
    });
  }, [rows, search, risk, type]);

  const columns = [
    { key: "id", title: "Incident ID" },
    { key: "type", title: "Crime Type" },
    { key: "location", title: "Location" },
    { key: "date", title: "Date" },
    { key: "time", title: "Time" },
    { key: "risk", title: "Risk" },
    { key: "status", title: "Status" },
    { key: "actions", title: "Actions" },
  ];

  const data = filtered.map((r) => {
    const incId = r.id || r._id;
    const incType = r.crime_type || r.type || "-";
    const incRisk = r.severity || r.riskLevel || "Moderate";

    return {
      id: incId,
      type: incType,
      location: r.location || r.area || "-",
      date: r.date || "-",
      time: r.time || "-",
      risk: <RiskBadge level={incRisk} />,
      status: r.status || "Open",
      actions: (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/incidents/${incId}`)}
          >
            View
          </Button>
        </div>
      ),
    };
  });


  return (
    <section className="space-y-6">
      <div>
        <h2 className="section-title">Incidents</h2>
        <p className="section-subtitle">
          Manage and inspect incident records (mock mode).
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3>Filters</h3>
        </CardHeader>
        <CardBody className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label="Search incidents"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ID, location, type..."
          />
          <Select
            label="Crime type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: "theft", label: "Theft" },
              { value: "assault", label: "Assault" },
              { value: "burglary", label: "Burglary" },
              { value: "robbery", label: "Robbery" },
              { value: "vandalism", label: "Vandalism" },
            ]}
          />
          <Select
            label="Risk level"
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            options={[
              { value: "low", label: "Low" },
              { value: "moderate", label: "Moderate" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ]}
          />
          <Input label="Date" type="date" />
        </CardBody>
      </Card>

      <Table columns={columns} data={data} emptyText="No incidents found." />
    </section>
  );
}

export default IncidentsPage;
