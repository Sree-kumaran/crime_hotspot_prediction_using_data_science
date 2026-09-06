import { useState } from "react";
import {
  ShieldAlert,
  MapPin,
  Calendar,
  Clock,
  Navigation,
  FilePlus,
  AlertCircle,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../ui/Card/Card";
import Input from "../ui/Input/Input";
import Select from "../ui/Select/Select";
import Textarea from "../ui/Input/Textarea";
import Button from "../ui/Button/Button";

// NYC Coordinate presets for instant testing
const NYC_LOCATIONS = [
  { name: "Midtown Manhattan", area: "Manhattan", lat: 40.7580, lon: -73.9855, district: "Precinct 14" },
  { name: "Downtown Brooklyn", area: "Brooklyn", lat: 40.6932, lon: -73.9858, district: "Precinct 84" },
  { name: "Harlem", area: "Manhattan", lat: 40.8116, lon: -73.9465, district: "Precinct 28" },
  { name: "Flushing Queens", area: "Queens", lat: 40.7675, lon: -73.8331, district: "Precinct 109" },
  { name: "South Bronx", area: "Bronx", lat: 40.8162, lon: -73.9184, district: "Precinct 40" },
  { name: "Staten Island North", area: "Staten Island", lat: 40.6415, lon: -74.0776, district: "Precinct 120" },
];

export default function CrimeDataForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    crime_type: "theft",
    date: "2024-03-25",
    time: "14:30",
    latitude: "40.7580",
    longitude: "-73.9855",
    location: "Midtown Manhattan Area",
    area: "Manhattan",
    district: "Precinct 14",
    severity: "Moderate",
    status: "Reported",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.crime_type) errs.crime_type = "Crime type is required.";
    if (!formData.date) errs.date = "Incident date is required.";
    if (!formData.time) errs.time = "Incident time is required.";

    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      errs.latitude = "Valid latitude between -90 and 90 is required.";
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      errs.longitude = "Valid longitude between -180 and 180 is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleLocationPreset = (loc) => {
    setFormData((prev) => ({
      ...prev,
      latitude: loc.lat.toString(),
      longitude: loc.lon.toString(),
      location: `${loc.name} Area`,
      area: loc.area,
      district: loc.district,
    }));
    setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    });
  };

  return (
    <Card className="border-[#262c4d]">
      <CardHeader className="flex justify-between items-center bg-palette-ink/40 py-3.5">
        <div className="flex items-center gap-2">
          <FilePlus className="w-4 h-4 text-palette-almond" />
          <h3 className="text-sm font-semibold text-palette-almond">
            New Crime Record Ingestion Form
          </h3>
        </div>
        <span className="text-[11px] font-mono text-palette-lilac bg-[#1e2444] px-2.5 py-0.5 rounded border border-[#2b3254]">
          MongoDB Pipeline Entry
        </span>
      </CardHeader>
      <CardBody className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Crime Category, Date, Time */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Select
              label="Crime Category *"
              value={formData.crime_type}
              onChange={(e) => handleChange("crime_type", e.target.value)}
              error={errors.crime_type}
              required
              options={[
                { value: "theft", label: "Theft & Larceny" },
                { value: "assault", label: "Assault & Battery" },
                { value: "robbery", label: "Robbery" },
                { value: "burglary", label: "Burglary & Breaking" },
                { value: "vandalism", label: "Vandalism & Property Damage" },
                { value: "grand larceny", label: "Grand Larceny" },
                { value: "misdemeanor", label: "General Misdemeanor" },
                { value: "other", label: "Other Offense" },
              ]}
            />

            <Input
              label="Incident Date *"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              error={errors.date}
              required
            />

            <Input
              label="Incident Time *"
              type="time"
              value={formData.time}
              onChange={(e) => handleChange("time", e.target.value)}
              error={errors.time}
              required
            />
          </div>

          {/* Row 2: Location Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-palette-lilac mb-1.5 flex items-center gap-1.5">
              <Navigation size={13} className="text-palette-almond" />
              NYC Location Quick Presets (Auto-fills Coordinates & Area)
            </label>
            <div className="flex flex-wrap gap-2">
              {NYC_LOCATIONS.map((loc) => (
                <button
                  type="button"
                  key={loc.name}
                  onClick={() => handleLocationPreset(loc)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-150 font-medium ${
                    formData.latitude === loc.lat.toString() &&
                    formData.longitude === loc.lon.toString()
                      ? "bg-palette-almond text-palette-ink border-palette-almond font-semibold shadow-glow"
                      : "bg-palette-ink border-[#262c4d] text-palette-lilac hover:text-palette-almond hover:border-palette-grape"
                  }`}
                >
                  {loc.name} ({loc.area})
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Latitude, Longitude, Location Description */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Latitude *"
              type="number"
              step="0.000001"
              value={formData.latitude}
              onChange={(e) => handleChange("latitude", e.target.value)}
              error={errors.latitude}
              helperText="NYC Bounds: 40.496 to 40.915"
              required
            />

            <Input
              label="Longitude *"
              type="number"
              step="0.000001"
              value={formData.longitude}
              onChange={(e) => handleChange("longitude", e.target.value)}
              error={errors.longitude}
              helperText="NYC Bounds: -74.258 to -73.695"
              required
            />

            <Input
              label="Location / Landmark Name"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="e.g., 42nd St & 7th Ave"
            />
          </div>

          {/* Row 4: Borough/Area, Severity, Status */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Borough / Area"
              value={formData.area}
              onChange={(e) => handleChange("area", e.target.value)}
              placeholder="e.g. Manhattan, Brooklyn"
            />

            <Select
              label="Severity Level"
              value={formData.severity}
              onChange={(e) => handleChange("severity", e.target.value)}
              options={[
                { value: "High", label: "High Severity (Violent/Felony)" },
                { value: "Moderate", label: "Moderate Severity" },
                { value: "Low", label: "Low Severity" },
              ]}
            />

            <Select
              label="Record Status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={[
                { value: "Reported", label: "Reported" },
                { value: "Open", label: "Open Investigation" },
                { value: "Closed", label: "Closed / Resolved" },
              ]}
            />
          </div>

          {/* Row 5: Description */}
          <Textarea
            label="Incident Description / Field Notes"
            placeholder="Provide context, officer notes, or details regarding the incident..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="min-h-[70px]"
          />

          {/* Action CTA */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              variant="primary"
              className="w-full h-11 text-sm font-bold shadow-glow"
            >
              {loading ? "Saving Record & Triggering ConvLSTM Inference..." : "Add Crime Record"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
