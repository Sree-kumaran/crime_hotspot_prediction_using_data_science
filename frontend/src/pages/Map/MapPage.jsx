import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Filter,
  RefreshCw,
  Calendar,
  ShieldAlert,
  Flame,
  Clock,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import LeafletInteractiveMap from "../../components/map/LeafletInteractiveMap";
import { getLast7DaysCrimes } from "../../services/incidentService";

export default function MapPage() {
  const [crimes, setCrimes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCrime, setSelectedCrime] = useState(null);

  // Filter states
  const [targetDate, setTargetDate] = useState("2024-03-25");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [boroughFilter, setBoroughFilter] = useState("all");
  const [selectedDayFilter, setSelectedDayFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadLast7DaysData = async (dateStr) => {
    setLoading(true);
    setError("");
    setSelectedCrime(null);
    setSelectedDayFilter(null);
    try {
      const res = await getLast7DaysCrimes({
        target_date: dateStr || targetDate,
        days: 7,
      });

      if (res?.data) {
        setCrimes(res.data);
        setSummary(res.summary);
        if (res.data.length > 0) {
          setSelectedCrime(res.data[0]);
        }
      } else if (Array.isArray(res)) {
        setCrimes(res);
      }
    } catch (err) {
      console.error("Failed to load last 7 days crime data:", err);
      setError(err?.message || "Failed to load 7-day crime records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLast7DaysData(targetDate);
  }, []);

  const handleDateChange = (newDate) => {
    setTargetDate(newDate);
    loadLast7DaysData(newDate);
  };

  const handleStepDay = (daysDelta) => {
    try {
      const curr = new Date(targetDate);
      curr.setDate(curr.getDate() + daysDelta);
      const formatted = curr.toISOString().split("T")[0];
      setTargetDate(formatted);
      loadLast7DaysData(formatted);
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered crime incidents
  const filteredCrimes = useMemo(() => {
    return crimes.filter((c) => {
      // Severity filter
      if (severityFilter !== "all") {
        const sev = (c.severity || "").toLowerCase();
        const target = severityFilter.toLowerCase();
        if (target === "high" && sev !== "high" && sev !== "critical") return false;
        if (target === "medium" && sev !== "moderate" && sev !== "medium") return false;
        if (target === "low" && sev !== "low") return false;
      }

      // Category filter
      if (categoryFilter !== "all") {
        const cat = (c.crime_type || c.category || "").toLowerCase();
        if (!cat.includes(categoryFilter.toLowerCase())) return false;
      }

      // Borough filter
      if (boroughFilter !== "all") {
        const boro = (c.borough || "").toLowerCase();
        if (boro !== boroughFilter.toLowerCase()) return false;
      }

      // Specific day in 7-day window filter
      if (selectedDayFilter) {
        if (c.date !== selectedDayFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const text = `${c.crime_type} ${c.location} ${c.area} ${c.borough} ${c.description}`.toLowerCase();
        if (!text.includes(query)) return false;
      }

      return true;
    });
  }, [crimes, severityFilter, categoryFilter, boroughFilter, selectedDayFilter, searchQuery]);

  return (
    <section className="space-y-6">
      {/* Header & Date Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#262c4d]">
        <div>
          <h2 className="section-title flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-palette-almond" />
            NYC Last 7 Days Crime Map & Spatiotemporal Plotter
          </h2>
          <p className="section-subtitle mt-0.5">
            Interactive Google-Maps-style spatial exploration of crime incidents recorded over the last 7 days across NYC
          </p>
        </div>

        {/* Date Anchor Navigation Stepper */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-[#141829] p-1.5 rounded-xl border border-[#262c4d] shadow-md">
          <button
            onClick={() => handleStepDay(-1)}
            disabled={loading}
            title="Step Back 1 Day"
            className="p-1.5 rounded-lg text-palette-lilac hover:text-palette-almond hover:bg-palette-grape/40 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={targetDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-[#0c0d16] text-palette-almond text-xs px-2.5 py-1 rounded-lg border border-[#2b3254] font-semibold focus:outline-none focus:border-palette-almond"
          />

          <button
            onClick={() => handleStepDay(1)}
            disabled={loading}
            title="Step Forward 1 Day"
            className="p-1.5 rounded-lg text-palette-lilac hover:text-palette-almond hover:bg-palette-grape/40 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <Button
            variant="outline"
            onClick={() => loadLast7DaysData(targetDate)}
            disabled={loading}
            className="text-xs px-2.5 py-1 h-7 ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* 7-Day Window Status Banner */}
      {summary && (
        <div className="bg-[#141829] border border-[#2b3254] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-palette-grape/40 border border-palette-grape flex items-center justify-center text-palette-almond">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-palette-almond uppercase tracking-wider">
                7-Day Observation Window
              </div>
              <div className="text-sm font-semibold text-white">
                {summary.start_date} <span className="text-palette-lilac">to</span> {summary.end_date}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#0c0d16] px-3 py-2 rounded-lg border border-[#262c4d]">
              <span className="text-palette-lilac block text-[10px]">Total Incidents</span>
              <strong className="text-sm font-bold text-white">{summary.total_crimes}</strong>
            </div>
            <div className="bg-[#0c0d16] px-3 py-2 rounded-lg border border-[#262c4d]">
              <span className="text-palette-lilac block text-[10px]">High Severity</span>
              <strong className="text-sm font-bold text-red-400">
                {summary.high_severity_count} ({summary.high_severity_pct}%)
              </strong>
            </div>
            <div className="bg-[#0c0d16] px-3 py-2 rounded-lg border border-[#262c4d]">
              <span className="text-palette-lilac block text-[10px]">Top Category</span>
              <strong className="text-sm font-bold text-amber-300">{summary.top_category}</strong>
            </div>
            <div className="bg-[#0c0d16] px-3 py-2 rounded-lg border border-[#262c4d]">
              <span className="text-palette-lilac block text-[10px]">Top Borough</span>
              <strong className="text-sm font-bold text-palette-almond">{summary.top_borough}</strong>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Timeline Bar Chart */}
      {summary?.daily_counts && summary.daily_counts.length > 0 && (
        <Card className="border-[#262c4d]">
          <CardHeader className="py-2.5 bg-palette-ink/40 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-palette-almond flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-palette-almond" />
              7-Day Crime Volume Timeline (Click a day to filter map)
            </h3>
            {selectedDayFilter && (
              <button
                onClick={() => setSelectedDayFilter(null)}
                className="text-[11px] text-palette-almond hover:underline font-semibold"
              >
                Reset Day Filter
              </button>
            )}
          </CardHeader>
          <CardBody className="p-3">
            <div className="grid grid-cols-7 gap-2">
              {summary.daily_counts.map((day) => {
                const isSelected = selectedDayFilter === day.date;
                const maxCount = Math.max(...summary.daily_counts.map((d) => d.count), 1);
                const heightPct = Math.max(20, Math.round((day.count / maxCount) * 100));

                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDayFilter(isSelected ? null : day.date)}
                    className={`flex flex-col items-center p-2 rounded-lg border transition-all text-center group ${
                      isSelected
                        ? "bg-palette-almond/20 border-palette-almond shadow-glow"
                        : "bg-[#0c0d16] border-[#262c4d] hover:border-palette-grape"
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-palette-lilac uppercase">
                      {day.short_day}
                    </span>
                    <span className="text-[9px] text-[#717493] mb-1">{day.date.slice(5)}</span>

                    {/* Bar visualization */}
                    <div className="w-full h-12 bg-[#141829] rounded-md flex items-end p-0.5 overflow-hidden my-1">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded transition-all duration-300 ${
                          isSelected
                            ? "bg-palette-almond"
                            : day.high_risk_count > 3
                            ? "bg-red-500"
                            : "bg-amber-400 group-hover:bg-palette-almond"
                        }`}
                      />
                    </div>

                    <strong className="text-xs font-bold text-white">{day.count}</strong>
                    <span className="text-[9px] text-red-400">{day.high_risk_count} high</span>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Multi-Dimensional Filter Bar */}
      <Card className="border-[#262c4d]">
        <CardBody className="p-3.5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-palette-lilac mb-1">
              Search Incident Details
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-palette-lilac absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search street, borough, type..."
                className="w-full bg-[#0c0d16] border border-[#262c4d] text-xs text-palette-almond pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-palette-almond"
              />
            </div>
          </div>

          <Select
            label="Severity Filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            options={[
              { value: "all", label: "All Severity Levels" },
              { value: "high", label: "High / Critical Only" },
              { value: "medium", label: "Moderate Severity" },
              { value: "low", label: "Low Severity" },
            ]}
          />

          <Select
            label="Category Filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: "all", label: "All Crime Categories" },
              { value: "theft", label: "Theft / Larceny" },
              { value: "assault", label: "Assault / Violence" },
              { value: "robbery", label: "Robbery" },
              { value: "burglary", label: "Burglary / Breaking" },
              { value: "vandalism", label: "Vandalism" },
              { value: "felony", label: "Felonies" },
              { value: "misdemeanor", label: "Misdemeanors" },
            ]}
          />

          <Select
            label="Borough Filter"
            value={boroughFilter}
            onChange={(e) => setBoroughFilter(e.target.value)}
            options={[
              { value: "all", label: "All 5 Boroughs" },
              { value: "manhattan", label: "Manhattan" },
              { value: "brooklyn", label: "Brooklyn" },
              { value: "queens", label: "Queens" },
              { value: "bronx", label: "Bronx" },
              { value: "staten island", label: "Staten Island" },
            ]}
          />
        </CardBody>
      </Card>

      {error && <Alert type="error" title="Spatial Map Error" message={error} />}

      {/* Main Map Viewport + Side Panel Inspector */}
      <div className="grid lg:grid-cols-3 gap-5 items-start">
        {/* Interactive Google-Maps-Style Zoomable Map */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-palette-lilac">
              Plotting <strong className="text-palette-almond font-semibold">{filteredCrimes.length}</strong> incidents from last 7 days on map
            </span>
            <span className="text-[11px] text-[#717493]">
              Tip: Click any marker or use +/- zoom buttons to inspect street level
            </span>
          </div>

          <LeafletInteractiveMap
            crimes={filteredCrimes}
            selectedCrime={selectedCrime}
            onSelectCrime={setSelectedCrime}
            mode="crimes"
            height="h-[580px]"
            targetDate={summary?.target_date || targetDate}
          />
        </div>

        {/* Side Panel: Selected Crime Inspector & Recent Incidents Feed */}
        <div className="space-y-4">
          {selectedCrime ? (
            <Card className="border-palette-grape bg-palette-prussian shadow-glow">
              <CardHeader className="py-3 bg-palette-ink/60 border-[#262c4d] flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-palette-almond flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Incident Inspector
                </h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedCrime.severity === "High" || selectedCrime.severity === "Critical"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : selectedCrime.severity === "Moderate"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                }`}>
                  {selectedCrime.severity}
                </span>
              </CardHeader>
              <CardBody className="p-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-palette-lilac block">
                    Offense Classification
                  </span>
                  <div className="text-base font-bold text-white capitalize">
                    {selectedCrime.crime_type || selectedCrime.category}
                  </div>
                </div>

                <div className="bg-[#0c0d16] p-3 rounded-lg border border-[#262c4d] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-palette-lilac">Location:</span>
                    <span className="font-semibold text-white text-right">
                      {selectedCrime.location || selectedCrime.area}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-palette-lilac">Borough:</span>
                    <span className="font-semibold text-palette-almond">
                      {selectedCrime.borough || "New York City"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-palette-lilac">Date & Time:</span>
                    <span className="font-semibold text-white">
                      {selectedCrime.date} at {selectedCrime.time || "12:00"}
                    </span>
                  </div>
                  {selectedCrime.status && (
                    <div className="flex justify-between items-center">
                      <span className="text-palette-lilac">Case Status:</span>
                      <span className="font-semibold text-amber-300">
                        {selectedCrime.status}
                      </span>
                    </div>
                  )}
                </div>

                {selectedCrime.description && (
                  <div>
                    <span className="text-[10px] font-semibold text-palette-lilac uppercase tracking-wider block mb-1">
                      Case Notes / Narrative
                    </span>
                    <p className="text-xs text-palette-lilac bg-[#0c0d16]/70 p-2.5 rounded border border-[#262c4d] italic">
                      "{selectedCrime.description}"
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-[#262c4d] flex justify-between text-[11px] text-palette-lilac/70">
                  <span>Coordinates:</span>
                  <span className="font-mono text-palette-almond">
                    {selectedCrime.latitude?.toFixed(4)}, {selectedCrime.longitude?.toFixed(4)}
                  </span>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="border-[#262c4d]">
              <CardBody className="p-6 text-center text-palette-lilac">
                <MapPin className="w-8 h-8 text-palette-almond/50 mx-auto mb-2" />
                <p className="text-xs">Click any crime pin on the map to inspect incident details.</p>
              </CardBody>
            </Card>
          )}

          {/* Incident Feed List */}
          <Card className="border-[#262c4d]">
            <CardHeader className="py-2.5 bg-palette-ink/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-palette-almond">
                Last 7 Days Incidents Feed ({filteredCrimes.length})
              </h4>
            </CardHeader>
            <CardBody className="p-2 max-h-[300px] overflow-y-auto space-y-1.5 custom-scrollbar">
              {filteredCrimes.slice(0, 30).map((c, i) => {
                const isSelected = selectedCrime && (selectedCrime.id === c.id || (selectedCrime.latitude === c.latitude && selectedCrime.longitude === c.longitude));
                return (
                  <button
                    key={c.id || i}
                    onClick={() => setSelectedCrime(c)}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-palette-almond/20 border-palette-almond"
                        : "bg-[#0c0d16] border-[#262c4d] hover:border-palette-grape"
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-bold text-white capitalize truncate">
                        {c.crime_type || c.category}
                      </div>
                      <div className="text-[10px] text-palette-lilac truncate">
                        {c.location || c.area} ({c.borough})
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-mono text-[#717493] block">{c.date}</span>
                      <span className={`text-[9px] font-bold ${
                        c.severity === "High" ? "text-red-400" : c.severity === "Moderate" ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {c.severity}
                      </span>
                    </div>
                  </button>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}
