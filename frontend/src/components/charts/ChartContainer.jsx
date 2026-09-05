function ChartContainer({ title, children }) {
  return (
    <div className="card-base p-4">
      <h3 className="text-h3 mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}
export default ChartContainer;
