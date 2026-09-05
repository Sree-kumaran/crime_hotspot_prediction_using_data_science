import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import { RiskBadge } from "../../components/ui/Badge/Badge";
import MapContainer from "../../components/map/MapContainer";
import { getIncidentById } from "../../services/incidentService";
import ErrorState from "../../components/ui/ErrorState/ErrorState";

function IncidentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(undefined);

  useEffect(() => {
    getIncidentById(id).then(setIncident);
  }, [id]);

  if (incident === undefined) return <p>Loading incident...</p>;
  if (!incident)
    return (
      <ErrorState
        title="Incident not found"
        message={`No record found for ${id}.`}
        onRetry={() => navigate("/incidents")}
      />
    );

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <h2 className="section-title">Incident Details</h2>
      </div>

      <Card>
        <CardHeader>
          <h3>{incident.id}</h3>
        </CardHeader>
        <CardBody className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p>
              <strong>Crime Type:</strong> {incident.type}
            </p>
            <p>
              <strong>Location:</strong> {incident.location}
            </p>
            <p>
              <strong>Date:</strong> {incident.date}
            </p>
            <p>
              <strong>Time:</strong> {incident.time}
            </p>
            <p>
              <strong>Coordinates:</strong> {incident.latitude},{" "}
              {incident.longitude}
            </p>
            <p>
              <strong>Status:</strong> {incident.status}
            </p>
            <p>
              <strong>Risk:</strong> <RiskBadge level={incident.riskLevel} />
            </p>
            <p>
              <strong>Description:</strong> {incident.description}
            </p>
          </div>
          <MapContainer height="h-72" />
        </CardBody>
      </Card>

      <div className="flex gap-2">
        <Button variant="ghost">Edit</Button>
        <Button variant="danger">Delete</Button>
      </div>
    </section>
  );
}

export default IncidentDetailsPage;
