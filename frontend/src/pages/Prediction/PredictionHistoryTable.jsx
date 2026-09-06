import { useEffect, useState } from "react";
import { History, Eye, RefreshCw, Calendar, ShieldAlert } from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import Table from "../../components/ui/Table/Table";
import { getPredictionHistory } from "../../services/predictionService";
import Alert from "../../components/ui/Alert/Alert";

export default function PredictionHistoryTable({ onSelectPrediction }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getPredictionHistory({ page: pageNum, limit: 10 });
      setHistory(res?.data || []);
      setTotal(res?.total || 0);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to load history:", err);
      setError(err?.message || "Failed to load prediction history from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const columns = [
    { key: "prediction_date", title: "Target Date" },
    { key: "generated_at", title: "Timestamp" },
    { key: "total_hotspots", title: "Hotspots" },
    { key: "high_risk", title: "High Risk" },
    { key: "risk_breakdown", title: "Risk Distribution" },
    { key: "actions", title: "Actions" },
  ];

  const tableData = history.map((item) => {
    const genDate = item.generated_at
      ? new Date(item.generated_at).toLocaleString()
      : "-";
    const summary = item.summary || {};

    return {
      prediction_date: (
        <span className="font-semibold text-palette-almond flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-palette-lilac" />
          {item.prediction_date}
        </span>
      ),
      generated_at: <span className="text-xs text-palette-lilac">{genDate}</span>,
      total_hotspots: (
        <span className="font-bold text-palette-almond">
          {summary.total_hotspots ?? item.hotspots?.length ?? 0}
        </span>
      ),
      high_risk: (
        <span className="font-bold text-red-400">
          {summary.high_risk ?? 0}
        </span>
      ),
      risk_breakdown: (
        <div className="flex gap-1.5 items-center">
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-950/60 text-red-300 border border-red-800/50">
            {summary.high_risk ?? 0} H
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800/50">
            {summary.medium_risk ?? 0} M
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
            {summary.low_risk ?? 0} L
          </span>
        </div>
      ),
      actions: (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSelectPrediction(item)}
          className="flex items-center gap-1 text-xs"
        >
          <Eye className="w-3 h-3" /> Inspect Map
        </Button>
      ),
    };
  });

  return (
    <Card className="border-[#262c4d]">
      <CardHeader className="flex justify-between items-center bg-palette-ink/40">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-palette-almond" />
          <h3 className="text-sm font-semibold text-palette-almond">
            Prediction Audit Log (MongoDB)
          </h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fetchHistory(page)}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardBody className="p-4 space-y-4">
        {error && <Alert type="error" title="Audit Error" message={error} />}

        <Table
          columns={columns}
          data={tableData}
          emptyText="No historical predictions recorded in database. Run a prediction to create an audit record."
        />

        {total > 10 && (
          <div className="flex justify-between items-center pt-2 text-xs text-palette-lilac">
            <span>
              Showing {tableData.length} of {total} records
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => fetchHistory(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page * 10 >= total || loading}
                onClick={() => fetchHistory(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
