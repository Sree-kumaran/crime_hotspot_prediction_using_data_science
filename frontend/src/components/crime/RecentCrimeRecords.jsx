import { FileSpreadsheet, RefreshCw, Eye } from "lucide-react";
import { Card, CardBody, CardHeader } from "../ui/Card/Card";
import Table from "../ui/Table/Table";
import { RiskBadge } from "../ui/Badge/Badge";
import Button from "../ui/Button/Button";
import EmptyState from "../ui/EmptyState/EmptyState";

export default function RecentCrimeRecords({
  records = [],
  loading = false,
  onRefresh = () => {},
  onViewIncident = () => {},
}) {
  const columns = [
    { key: "id", title: "Record ID" },
    { key: "type", title: "Crime Type" },
    { key: "location", title: "Location Area" },
    { key: "coordinates", title: "GPS Coordinates" },
    { key: "date", title: "Date & Time" },
    { key: "severity", title: "Severity" },
    { key: "status", title: "Status" },
  ];

  const data = records.map((r) => {
    const incId = r.id || r._id || "-";
    const incType = r.crime_type || r.type || "theft";
    const incSeverity = r.severity || "Moderate";
    const lat = typeof r.latitude === "number" ? r.latitude.toFixed(4) : r.latitude || "-";
    const lon = typeof r.longitude === "number" ? r.longitude.toFixed(4) : r.longitude || "-";

    return {
      id: <span className="font-mono text-xs text-palette-almond">{incId}</span>,
      type: <span className="font-semibold capitalize text-palette-almond">{incType}</span>,
      location: r.location || r.area || "NYC Area",
      coordinates: (
        <span className="font-mono text-xs text-palette-lilac">
          {lat}, {lon}
        </span>
      ),
      date: (
        <div className="text-xs">
          <span className="font-medium text-palette-almond">{r.date || "-"}</span>
          {r.time && <span className="text-palette-lilac/70 ml-1.5 font-mono">{r.time}</span>}
        </div>
      ),
      severity: <RiskBadge level={incSeverity} />,
      status: (
        <span className="text-xs px-2 py-0.5 rounded bg-[#1e2444] border border-[#2b3254] text-palette-lilac">
          {r.status || "Reported"}
        </span>
      ),
    };
  });

  return (
    <Card className="border-[#262c4d]">
      <CardHeader className="flex justify-between items-center bg-palette-ink/40 py-3.5">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-palette-almond" />
          <h3 className="text-sm font-semibold text-palette-almond">
            Recently Added Crime Records in MongoDB
          </h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-palette-lilac hover:text-palette-almond"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Records
        </Button>
      </CardHeader>
      <CardBody className="p-0">
        {data.length ? (
          <Table columns={columns} data={data} />
        ) : (
          <div className="p-6">
            <EmptyState
              title="No recent crime records"
              description="Records added through this page will immediately appear here."
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
