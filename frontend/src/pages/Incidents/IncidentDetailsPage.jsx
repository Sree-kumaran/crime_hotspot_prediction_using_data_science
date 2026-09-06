import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, AlertTriangle, Shield } from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import { RiskBadge } from "../../components/ui/Badge/Badge";
import MapContainer from "../../components/map/MapContainer";
import { getIncidentById } from "../../services/incidentService";
import ErrorState from "../../components/ui/ErrorState/ErrorState";
import { SkeletonCard } from "../../components/ui/Loading/Loading";

function IncidentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getIncidentById(id)
      .then((res) => setIncident(res))
      .catch(() => setIncident(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <section className="space-y-6">
        <SkeletonCard />
      </section>
    );
  }

  if (!incident) {
    return (
      <ErrorState
        title="Incident Record Not Found"
        message={`No incident found matching registry ID "${id}".`}
        onRetry={() => navigate("/incidents")}
      />
    );
  }

  const crimeType = incident.crime_type || incident.type || "-";
  const location = incident.location || incident.area || "-";
  const severity = incident.severity || incident.riskLevel || "Moderate";

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 pb-1 border-b border-[#262c4d]">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Registry
        </Button>
        <h2 className="section-title text-lg">Incident Details: #{id}</h2>
      </div>

      <Card className="border-[#262c4d]">
        <CardHeader className="flex justify-between items-center bg-palette-ink/40">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-palette-almond" />
            <h3 className="text-sm font-semibold text-palette-almond capitalize">
              {crimeType} Incident Record
            </h3>
          </div>
          <RiskBadge level={severity} />
        </CardHeader>
        <CardBody className="grid lg:grid-cols-2 gap-6 p-6">
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-palette-ink border border-[#262c4d]">
                <p className="text-[10px] uppercase font-semibold text-palette-lilac">Crime Category</p>
                <p className="font-bold text-palette-almond mt-0.5 capitalize">{crimeType}</p>
              </div>
              <div className="p-3 rounded-lg bg-palette-ink border border-[#262c4d]">
                <p className="text-[10px] uppercase font-semibold text-palette-lilac">Investigation Status</p>
                <p className="font-bold text-palette-almond mt-0.5">{incident.status || "Open"}</p>
              </div>
            </div>

            <div className="space-y-2.5 p-4 rounded-xl bg-palette-ink border border-[#262c4d] text-xs">
              <div className="flex justify-between">
                <span className="text-palette-lilac flex items-center gap-1.5">
                  <MapPin size={13} className="text-palette-almond" /> Location Area:
                </span>
                <span className="font-semibold text-palette-almond">{location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-palette-lilac flex items-center gap-1.5">
                  <Calendar size={13} className="text-palette-almond" /> Incident Date:
                </span>
                <span className="font-semibold text-palette-almond">{incident.date || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-palette-lilac flex items-center gap-1.5">
                  <Clock size={13} className="text-palette-almond" /> Recorded Time:
                </span>
                <span className="font-semibold text-palette-almond">{incident.time || "-"}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-2 border-t border-[#262c4d]">
                <span className="text-palette-lilac">Coordinates:</span>
                <span className="font-mono text-palette-almond">{incident.latitude}, {incident.longitude}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-palette-ink border border-[#262c4d]">
              <p className="text-xs font-semibold text-palette-almond mb-1">Official Incident Notes</p>
              <p className="text-xs text-palette-lilac/90 leading-relaxed">
                {incident.description || "No supplementary description provided for this incident report."}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-palette-almond mb-2 flex items-center gap-1.5">
              <MapPin size={13} className="text-palette-almond" /> Spatial Location Pin
            </p>
            <MapContainer
              hotspots={[
                {
                  latitude: incident.latitude || 40.75,
                  longitude: incident.longitude || -73.98,
                  predicted_intensity: 1.0,
                  risk_score: severity === "High" ? 0.9 : 0.6,
                  risk_level: severity === "High" ? "High" : "Medium",
                },
              ]}
              height="h-72"
            />
          </div>
        </CardBody>
      </Card>
    </section>
  );
}

export default IncidentDetailsPage;
