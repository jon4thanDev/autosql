import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import "./index.css";
import { ThemeButton } from "./components/ui/Button/theme-button";
import Home from "./pages/page";
import Sidebar from "./components/ui/Sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "./components/ui/Breadcrumb";
import { Toaster } from "./components/ui/Toast/toaster";
import Scheduler from "./pages/scheduler/page";
import { BreadcrumbTitle } from "./components/ui/Breadcrumb/breadcrumb-title";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Sidebar>
          <div className="flex justify-between">
            <Breadcrumb className="flex align-center">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbTitle />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <ThemeButton />
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scheduler" element={<Scheduler />} />
          </Routes>
        </Sidebar>

        <Toaster />
      </ThemeProvider>
    </HashRouter>
  </StrictMode>
);

console.log("React application is rendering");
