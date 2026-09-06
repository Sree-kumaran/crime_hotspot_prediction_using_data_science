import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import PageContainer from "../components/layout/PageContainer";

const navItems = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard" },
  { id: "map", label: "Crime Map", path: "/map" },
  { id: "incidents", label: "Incidents", path: "/incidents" },
  { id: "addData", label: "Add Crime Data", path: "/add-data" },
  { id: "prediction", label: "Prediction", path: "/prediction" },
  { id: "analytics", label: "Analytics", path: "/analytics" },
  { id: "reports", label: "Reports", path: "/reports" },
  { id: "settings", label: "Settings", path: "/settings" },
];

function getPageTitle(pathname) {
  if (pathname.startsWith("/incidents/")) return "Incident Details";
  if (pathname.startsWith("/add-data")) return "Add Crime Data";
  const hit = navItems.find((i) => pathname.startsWith(i.path));
  return hit ? hit.label : "Crime Analytics";
}

function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeId = useMemo(() => {
    if (location.pathname.startsWith("/incidents/")) return "incidents";
    if (location.pathname.startsWith("/add-data")) return "addData";
    const hit = navItems.find((i) => location.pathname.startsWith(i.path));
    return hit?.id || "dashboard";
  }, [location.pathname]);

  return (
    <div className="page-shell flex">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        items={navItems}
        activeId={activeId}
        onItemClick={(id) => {
          const item = navItems.find((n) => n.id === id);
          if (item) navigate(item.path);
          setOpen(false);
        }}
      />
      <div className="flex-1 min-w-0">
        <Navbar
          appName="Crime Hotspot Intelligence"
          pageTitle={getPageTitle(location.pathname)}
          onMenuClick={() => setOpen(true)}
        />
        <PageContainer>
          <Outlet />
        </PageContainer>
      </div>
    </div>
  );
}

export default AppLayout;
