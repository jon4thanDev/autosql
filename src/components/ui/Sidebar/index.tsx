import React, { useState } from "react";
import { Menu, X, LayoutDashboard, SquarePen } from "lucide-react";
import { cn } from "../../../lib/utils";
import styles from "./styles.module.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../Tooltip/tooltip";
import { Link } from "react-router-dom";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  const sidebarItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/" },
    { icon: <SquarePen size={20} />, label: "Scheduler", path: "/scheduler" },
  ];

  return (
    <div className="flex">
      <aside
        className={cn(
          `h-screen text-white p-2 flex flex-col transition-all ${styles.navContainer}`,
          isOpen ? "w-64" : "w-20"
        )}
      >
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`mb-2 p-2 rounded-md flex items-center cursor-pointer ${
            !isOpen ? "justify-center w-auto" : "w-fit"
          } ${styles.toggleButton}`}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Sidebar Navigation */}
        <TooltipProvider>
          <nav className="flex flex-col">
            {sidebarItems.map(({ icon, label, path }) =>
              isOpen ? (
                /* When sidebar is open, no tooltip */
                <button key={label} className="w-full">
                  <SidebarItem
                    icon={icon}
                    label={label}
                    isOpen={isOpen}
                    path={path}
                  />
                </button>
              ) : (
                /* When sidebar is closed, wrap SidebarItem in Tooltip */
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <button className="w-full">
                      <SidebarItem
                        icon={icon}
                        label={label}
                        isOpen={isOpen}
                        path={path}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    className={`${styles.tooltipContent} show`}
                    side="right"
                  >
                    <p>{label}</p>
                  </TooltipContent>
                </Tooltip>
              )
            )}
          </nav>
        </TooltipProvider>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5">{children}</main>
    </div>
  );
};

/* Sidebar Item Component */
const SidebarItem = ({
  icon,
  label,
  isOpen,
  path,
}: {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  path: string;
}) => {
  return (
    <Link
      to={path}
      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
        !isOpen ? "justify-center" : ""
      } ${styles.navButtons}`}
    >
      {icon}
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
};

export default Sidebar;
