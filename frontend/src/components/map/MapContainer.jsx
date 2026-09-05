function MapContainer({ children, height = "h-80" }) {
  return (
    <div className={`card-base ${height} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-slate-100 grid place-items-center text-text-secondary">
        Map placeholder (library integration in Phase 2)
      </div>
      {children}
    </div>
  );
}
export default MapContainer;
