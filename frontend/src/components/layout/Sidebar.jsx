import { X } from "lucide-react";
import { cn } from "../../lib/utils";

function Sidebar({ open, onClose, items = [], activeId, onItemClick }) {
  return (
    <>
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#1b2a30] text-gray-100 border-r border-[#3f535c] transition-transform duration-250",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="h-16 px-4 border-b border-[#3f535c] flex items-center justify-between">
          <div>
            <p className="text-xs text-[#a3a3a3]">System</p>
            <p className="text-sm font-semibold text-gray-100">
              Crime Analytics
            </p>
          </div>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#2a3d45]"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-3 space-y-1" aria-label="Sidebar navigation">
          {items.map((item) => {
            const active = activeId === item.id;
            return (
              <button
                key={item.id}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition",
                  active
                    ? "bg-[#2a3d45] text-white"
                    : "hover:bg-[#2a3d45] text-gray-300",
                )}
                onClick={() => onItemClick?.(item.id)}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}
    </>
  );
}

export default Sidebar;
