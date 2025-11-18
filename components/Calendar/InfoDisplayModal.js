"use client";

import React from "react";
import "./styles/info-display-modal.css";

export default function InfoDisplayModal({ info, openDisplayInfo, setOpenDisplayInfo, onEdit, allEmployees, allClients }) {
  if (!openDisplayInfo || !info) return null;

  const { title, start, end, extendedProps } = info.event;

  // Format date/time nicely
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="modal-overlay" onClick={() => setOpenDisplayInfo(false)}>
      <div className="modal-content-display" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={() => setOpenDisplayInfo(false)}
        >
          ✕
        </button>
        <div className="modal-body">
          <h2 className="modal-title">{title}</h2>

          {extendedProps?.client && (
            <div className="modal-client">
              <span className="client-label">Client:</span>
              <span className="client-name">
                  {allClients.find(c => c.id === extendedProps.client)?.name || "Unknown"}
              </span>
            </div>
          )}

          <div className="modal-dates">
            <div className="date-row">
              <span className="date-label">Start:</span>
              <span className="date-value">{formatDate(start)}</span>
            </div>
            <div className="date-row">
              <span className="date-label">End:</span>
              <span className="date-value">{formatDate(end)}</span>
            </div>
          </div>


          {extendedProps?.description && (
            <p className="modal-description">{extendedProps.description}</p>
          )}

          {extendedProps?.employees?.length > 0 && (
            <div className="modal-employees">
              <h3>Assigned Employees</h3>
              <div className="employee-list">
                {extendedProps.employees.map((empId) => {
                  const employee = allEmployees.find(e => e.id === empId);
                  return (
                    <span key={empId} className="employee-chip">
                      {employee ? employee.name : "Unknown"}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button
              className="modal-edit"
              onClick={() => {
                setOpenDisplayInfo(false);
                onEdit(info.event); // 👈 Trigger the edit modal with this event
              }}
            >
              Edit Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
