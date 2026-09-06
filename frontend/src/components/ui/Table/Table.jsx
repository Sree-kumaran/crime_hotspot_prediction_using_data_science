import { cn } from "../../../lib/utils";

function Table({ columns = [], data = [], emptyText = "No data available", className }) {
  return (
    <div className={cn("card-base overflow-hidden border-[#262c4d]", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm text-left">
          <thead className="bg-palette-ink/90 border-b border-[#262c4d] text-[11px] uppercase tracking-wider text-palette-lilac">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3.5 font-semibold">
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262c4d]">
            {!data.length ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-palette-lilac/70 bg-[#12162a]/40"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-[#1c2242] transition-colors duration-150 text-palette-almond/90"
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3.5 align-middle">
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
