"use client";

import React, { useState } from "react";
import Calendar from "./Calendar/Calendar.js";
import ClientsPage from "./DB Data/Clients.js";
import "./sidebar.css"

export default function Sidebar() {
  const [activeView, setActiveView] = useState("calendar");
  const [collapsed, setCollapsed] = useState(false);

  const views = [
    { id: "calendar", label: "📆 Calendar" },
    { id: "clients", label: "👥 Clients" },
    { id: "employees", label: "💼 Employees" },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          {!collapsed && <h2>MYN PMS</h2>}
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {!collapsed && 
            (<nav className="sidebar-nav">
            {views.map((view) => (
                <button
                key={view.id}
                className={`sidebar-btn ${
                    activeView === view.id ? "active" : ""
                }`}
                onClick={() => setActiveView(view.id)}
                >
                {view.label}
                </button>
            ))}
            </nav>)
        }
      </div>

      {/* Main content */}
      <div className="main-content">
        {activeView === "calendar" && <Calendar />}
        {activeView === "clients" && <ClientsPage />}
        {activeView === "employees" && (
          <div className="placeholder">Tasks Section (coming soon)</div>
        )}
      </div>
    </div>
  );
}
