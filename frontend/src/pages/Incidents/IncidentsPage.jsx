import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, Search, Filter, RefreshCw, Eye } from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import Button from "../../components/ui/Button/Button";
import Table from "../../components/ui/Table/Table";
import { RiskBadge } from "../../components/ui/Badge/Badge";
import { getIncidents } from "../../services/incidentService";
import Alert from "../../components/ui/Alert/Alert";

function IncidentsPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadIncidents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getIncidents({ limit: 100 });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setRows(list);
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
      setError(err?.message || "Failed to load incidents registry.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
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
    { key: "location", title: "Location Area" },
    { key: "date", title: "Date" },
    { key: "time", title: "Time" },
    { key: "risk", title: "Severity" },
    { key: "status", title: "Status" },
    { key: "actions", title: "Actions" },
  ];

  const data = filtered.map((r) => {
    const incId = r.id || r._id;
    const incType = r.crime_type || r.type || "-";
    const incRisk = r.severity || r.riskLevel || "Moderate";

    return {
      id: <span className="font-mono text-xs text-palette-almond">{incId}</span>,
      type: <span className="font-semibold capitalize text-palette-almond">{incType}</span>,
      location: r.location || r.area || "-",
      date: r.date || "-",
      time: r.time || "-",
      risk: <RiskBadge level={incRisk} />,
      status: (
        <span className="text-xs px-2 py-0.5 rounded bg-[#1e2444] border border-[#2b3254] text-palette-lilac">
          {r.status || "Open"}
        </span>
      ),
      actions: (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/incidents/${incId}`)}
          className="flex items-center gap-1 text-xs"
        >
          <Eye size={13} /> View Detail
        </Button>
      ),
    };
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#262c4d]">
        <div>
          <h2 className="section-title flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-palette-almond" />
            Crime Incident Registry
          </h2>
          <p className="section-subtitle">
            Historical incident logs, classification metadata, and spatial records
          </p>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={loadIncidents}
          disabled={loading}
          className="flex items-center gap-1.5 self-start sm:self-auto text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Records
        </Button>
      </div>

      <Card className="border-[#262c4d]">
        <CardHeader className="bg-palette-ink/40 py-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-palette-almond flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-palette-lilac" />
            Registry Filter Controls
          </h3>
        </CardHeader>
        <CardBody className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Search Registry"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, borough, or crime..."
          />
          <Select
            label="Crime Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: "", label: "All Crime Categories" },
              { value: "theft", label: "Theft" },
              { value: "assault", label: "Assault" },
              { value: "burglary", label: "Burglary" },
              { value: "robbery", label: "Robbery" },
              { value: "vandalism", label: "Vandalism" },
              { value: "grand larceny", label: "Grand Larceny" },
            ]}
          />
          <Select
            label="Severity Level"
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            options={[
              { value: "", label: "All Severity Levels" },
              { value: "high", label: "High Severity" },
              { value: "moderate", label: "Moderate Severity" },
              { value: "low", label: "Low Severity" },
            ]}
          />
        </CardBody>
      </Card>

      {error && <Alert type="error" title="Registry Error" message={error} />}

      <Table
        columns={columns}
        data={data}
        emptyText={loading ? "Loading incident records..." : "No matching incident records found."}
      />
    </section>
  );
}

export default IncidentsPage;
