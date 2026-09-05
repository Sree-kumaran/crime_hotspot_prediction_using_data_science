import { Bell, Menu, UserCircle2 } from "lucide-react";

function Navbar({
  appName = "Crime Hotspot Intelligence",
  pageTitle = "Design System",
  onMenuClick,
  rightAction,
}) {
  return (
    <header className="h-16 bg-[#24353c] border-b border-[#3f535c] px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-bg-muted"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <p className="text-caption text-text-muted">{appName}</p>
          <h1 className="text-h3">{pageTitle}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {rightAction}
        <button
          className="p-2 rounded-lg hover:bg-bg-muted"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          className="p-2 rounded-lg hover:bg-bg-muted"
          aria-label="User profile"
        >
          <UserCircle2 size={20} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
