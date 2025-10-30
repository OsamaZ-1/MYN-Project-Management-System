"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./styles/info-edit-modal.css";

export default function InfoEditModal({
  openEditInfo,
  setOpenEditInfo,
  onSave,
  eventData
}) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");
  const [employees, setEmployees] = useState([]);
  const [client, setClient] = useState("");

  const [isUpdate, setIsUpdate] = useState(false);         

  // Eventully this will be edited to get information from the database
  const allEmployees = {
    "1": "Sarout",
    "2": "Yasser",
    "3": "Abdlurahim",
    "4": "Steve",
    "5": "Sarah",
    "6": "Nour",
  };

  const allClients = {
    "1": "Acme Corp",
    "2": "Globex",
    "3": "Initech",
    "4": "Umbrella Inc",
    "5": "Wayne Enterprises",
    "6": "Stark Industries",
  };

  // Format date to be put in Calendar Input
  const formatDate = (date) => {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");

    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());

    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  };

  // Populate fields if editing an existing event
  useEffect(() => {
  if (eventData) {
    setIsUpdate(!!eventData.id); // true if editing existing event
    setTitle(eventData.title || "");
    setStart(formatDate(eventData.start));
    setEnd(formatDate(eventData.end));
    setDescription(eventData.description || "");
    setEmployees((eventData.employees || []));
    setClient(eventData.client || "")
  } else {
    setIsUpdate(false);
    setTitle("");
    setStart("");
    setEnd("");
    setDescription("");
    setEmployees([]);
    setClient("");
  }
}, [eventData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      id: isUpdate ? eventData.id : Date.now(),
      title,
      start,
      end,
      description,
      employees: employees,
      client: client,
    };
    onSave(newEvent, isUpdate);
    setOpenEditInfo(false);
  };

  if (!openEditInfo) return null;

  return (
    <div className="modal-overlay" onClick={() => setOpenEditInfo(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setOpenEditInfo(false)}>
          ✕
        </button>
        <h2 className="modal-title">{!!eventData.id ? "Edit Event" : "Add New Event"}</h2>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-columns">
            {/* Left Column */}
            <div className="modal-column">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label>Client</label>
              <Select
                options={Object.values(allClients).map(c => ({ value: c, label: c }))}
                value={client ? { value: client, label: client } : null} // clients is a string
                onChange={(selectedOption) => setClient(selectedOption.value)}
                closeMenuOnSelect={true}
                maxMenuHeight={150} // scroll if too many
                styles={{
                  multiValue: (base) => ({
                    ...base,
                    maxWidth: "calc(25% - 4px)", // show up to 4 selected per line
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }),
                  control: (base) => ({
                    ...base,
                    borderRadius: "8px",
                    borderColor: "#d1d5db",
                    boxShadow: "none",
                    "&:hover": { borderColor: "#6366f1" },
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#eef2ff" : "white",
                    color: "#111827",
                    cursor: "pointer",
                  }),
                }}
                placeholder="Select client"
              />

              <label>Start Date & Time</label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />

              <label>End Date & Time</label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                min={start}
                required
              />
            </div>

            {/* Right Column */}
            <div className="modal-column">
              <label>Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label>Employees</label>
              <Select
                isMulti
                options={Object.values(allEmployees).map(name => ({ value: name, label: name }))}
                value={employees.map(name => ({ value: name, label: name }))}
                onChange={(selectedOptions) => setEmployees(selectedOptions.map(o => o.value))}
                closeMenuOnSelect={false}      // keep menu open when selecting multiple
                maxMenuHeight={150}            // dropdown menu max height (scroll if longer)
                styles={{
                  multiValue: (base, state) => ({
                    ...base,
                    maxWidth: "calc(25% - 4px)", // show up to 4 selected items per line
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }),
                }}
                placeholder="Select employees"
              />

              <button type="submit" className="modal-save">
                Save Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
