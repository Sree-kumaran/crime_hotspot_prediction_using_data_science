import {
  LayoutDashboard,
  MapPin,
  FileSpreadsheet,
  FilePlus,
  Sparkles,
  BarChart3,
  FileText,
  Settings,
  X,
  ShieldAlert,
} from "lucide-react";
import { cn } from "../../lib/utils";

const iconMap = {
  dashboard: LayoutDashboard,
  map: MapPin,
  incidents: FileSpreadsheet,
  addData: FilePlus,
  prediction: Sparkles,
  analytics: BarChart3,
  reports: FileText,
  settings: Settings,
};

function Sidebar({ open, onClose, items = [], activeId, onItemClick }) {
  return (
    <>
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-palette-ink text-palette-almond border-r border-[#262c4d] transition-transform duration-250 flex flex-col shrink-0 shadow-xl",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 border-b border-[#262c4d] flex items-center justify-between bg-palette-prussian/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-palette-grape/60 border border-palette-grape flex items-center justify-center text-palette-almond">
              <ShieldAlert size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-palette-lilac">
                Platform
              </p>
              <p className="text-xs font-bold text-palette-almond tracking-tight">
                Crime Hotspot Intel
              </p>
            </div>
          </div>
          <button
            className="md:hidden p-1.5 rounded-lg text-palette-lilac hover:bg-[#1e2444] hover:text-palette-almond"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto" aria-label="Sidebar navigation">
          <div className="px-3 pt-2 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-palette-lilac/60">
              Navigation
            </p>
          </div>
          {items.map((item) => {
            const active = activeId === item.id;
            const Icon = iconMap[item.id] || Sparkles;

            return (
              <button
                key={item.id}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-150 flex items-center gap-3 group",
                  active
                    ? "bg-palette-grape text-palette-almond shadow-grape font-semibold border-l-3 border-palette-almond"
                    : "text-palette-lilac hover:bg-[#161b33] hover:text-palette-almond",
                )}
                onClick={() => onItemClick?.(item.id)}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  size={17}
                  className={cn(
                    "transition-colors",
                    active
                      ? "text-palette-almond"
                      : "text-palette-lilac group-hover:text-palette-almond",
                  )}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-[#262c4d] bg-palette-prussian/40 text-[11px] text-palette-lilac">
          <div className="p-2.5 rounded-lg bg-palette-ink border border-[#262c4d]">
            <p className="font-semibold text-palette-almond">ConvLSTM 2D v1.0</p>
            <p className="text-[10px] text-palette-lilac/70 mt-0.5">NYC 20x20 Spatial Matrix</p>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-palette-ink/80 backdrop-blur-sm z-30 transition-opacity"
          onClick={onClose}
        />
      )}
    </>
  );
}

export default Sidebar;
