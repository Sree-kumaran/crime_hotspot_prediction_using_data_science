const wait = (ms = 700) => new Promise((r) => setTimeout(r, ms));

export async function generateReport(filters) {
  await wait();
  return {
    id: `RPT-${Date.now()}`,
    status: "Generated",
    summary: "Mock report generated successfully.",
    filters,
  };
}
