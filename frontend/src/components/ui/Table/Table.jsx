function Table({ columns = [], data = [], emptyText = "No data available" }) {
  return (
    <div className="card-base overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-small">
          <thead className="bg-bg-muted">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="text-left px-4 py-3 font-semibold">
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!data.length ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-text-muted"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-border hover:bg-slate-50"
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      {row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Table;
