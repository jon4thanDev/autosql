import React from "react";
import { useLocation } from "react-router-dom";
import styles from "./bread-crumb.module.css";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/scheduler": "Scheduler",
};

export function BreadcrumbTitle() {
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] || "Unknown Page";

  return <span className={styles.breadcrumbTitle}>{pageTitle}</span>;
}
