import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import PageContainer from "./PageContainer";
import { navItems } from "../../lib/utils";

function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("dashboard");

  return (
    <div className="page-shell flex">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        items={navItems}
        activeId={active}
        onItemClick={(id) => {
          setActive(id);
          setOpen(false);
        }}
      />
      <div className="flex-1 min-w-0">
        <Navbar onMenuClick={() => setOpen(true)} />
        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}

export default Layout;
