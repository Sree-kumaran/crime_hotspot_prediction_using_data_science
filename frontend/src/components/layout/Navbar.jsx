import { Bell, Menu, Activity, Shield } from "lucide-react";

function Navbar({
  appName = "Crime Hotspot Intelligence",
  pageTitle = "Dashboard",
  onMenuClick,
  rightAction,
}) {
  return (
    <header className="h-16 bg-palette-prussian border-b border-[#262c4d] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg text-palette-lilac hover:bg-[#1e2444] hover:text-palette-almond transition"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1e2444] border border-palette-grape flex items-center justify-center text-palette-almond shadow-glow">
            <Shield size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-palette-lilac">
                {appName}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] bg-emerald-950/60 text-emerald-300 border border-emerald-700/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <h1 className="text-base md:text-lg font-bold text-palette-almond tracking-tight leading-tight">
              {pageTitle}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {rightAction}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-palette-ink border border-[#262c4d] text-xs text-palette-lilac">
          <Activity size={13} className="text-palette-almond animate-pulse" />
          <span className="text-[11px]">ConvLSTM Neural Matrix</span>
        </div>

        <button
          className="p-2 rounded-lg text-palette-lilac hover:bg-[#1e2444] hover:text-palette-almond border border-transparent hover:border-[#2b3254] transition"
          aria-label="System status"
          title="Neural network model online"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
