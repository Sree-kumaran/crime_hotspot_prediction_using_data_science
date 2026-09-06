function ChartContainer({ title, children }) {
  return (
    <div className="card-base p-5 space-y-4 border-[#262c4d]">
      <h3 className="text-sm font-semibold tracking-tight text-palette-almond">
        {title}
      </h3>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}
export default ChartContainer;
