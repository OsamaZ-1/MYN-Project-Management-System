"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./styles/info-edit-modal.css";

export default function InfoEditModal({
  openEditInfo,
  setOpenEditInfo,
  onSave,
  eventData,
  allEmployees,
  allClients,
  saveEventDB
}) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");
  const [employees, setEmployees] = useState([]);
  const [client, setClient] = useState("");
  const [color, setColor] = useState("");

  const [isUpdate, setIsUpdate] = useState(false);

  // Recurring Event Options
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("");
  const [weekdays, setWeekdays] = useState([]);
  const [endType, setEndType] = useState(null); // "until" | "count" | null
  const [until, setUntil] = useState("");
  const [count, setCount] = useState("");
  const [baseEvent, setBaseEvent] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [exdate, setExdate] = useState([]);
  
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
    setColor(eventData.color || generateRandomHexColor());
    setBaseEvent(eventData.baseEvent || null);
    setParentId(eventData.parentId);

    // Recurring Events Options
    if (eventData.rrule != null) {
      setIsRecurring(true);
      setFrequency(eventData.rrule.freq || "");
      setWeekdays(eventData.rrule.byweekday || []);
      setUntil(eventData.rrule.until || "");
      setCount(eventData.rrule.count || "");
      const hasUntil = eventData.rrule.until;
      const hasCount = eventData.rrule.count;
      setEndType(hasUntil ? "until" : hasCount ? "count" : null);
      setExdate(eventData.exdate || []);      
    }
    else{
      setIsRecurring(false);
      setFrequency("");
      setWeekdays([]);
      setUntil("");
      setCount("");
      setEndType(null);
      setExdate([]);
    }

  } else {
    setIsUpdate(false);
    setTitle("");
    setStart("");
    setEnd("");
    setDescription("");
    setEmployees([]);
    setClient("");
    setColor(generateRandomHexColor());
    setBaseEvent(null);

    // Recurring Events Options
    setIsRecurring(false);
    setFrequency("");
    setWeekdays([]);
    setUntil("");
    setCount("");
    setEndType(null);
    setExdate([]);
    setParentId(null);
  }
}, [eventData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const weekdayMap = {
      Mon: "MO",
      Tue: "TU",
      Wed: "WE",
      Thu: "TH",
      Fri: "FR",
      Sat: "SA",
      Sun: "SU",
    };

    let recurrence = null;

    if (isRecurring && frequency) {
      recurrence = {
        dtstart: new Date(start).toISOString(), // ISO string
        freq: frequency.toUpperCase(), // FullCalendar requires uppercase
      };

      if (frequency === "WEEKLY" && weekdays.length > 0) {
        recurrence.byweekday = weekdays.map((d) => weekdayMap[d]);
      }

      if (endType === "until" && until) {
        recurrence.until = new Date(until).toISOString();
      }

      if (endType === "count" && count) {
        recurrence.count = Number(count);
      }
    }

    const newEvent = {
      id: isUpdate ? eventData.id : null,
      title,
      start,
      isRecurring,
      ...(isRecurring
        ? {
            rrule: recurrence,
            duration: new Date(end) - new Date(start),
            exdate,
          }
        : {
            end,
          }),
      description,
      employees,  // Employee IDs
      client,     // Client ID
      color,
      parentId,
    };

    // save copy in of new event on DB
    const savedEvent = await saveEventDB(newEvent);

    // save new event in local calendar to display it
    onSave(newEvent, savedEvent.id, isUpdate);

    // update Base Event in the DB in case of Exception saving
    let savedBaseEvent = null;
    if (baseEvent != null)
        savedBaseEvent = await saveEventDB(baseEvent);

    // update Base Event locally in case of Exception saving
    if (savedBaseEvent != null)
        onSave(baseEvent, savedBaseEvent.id, true);

    // close event editor
    setOpenEditInfo(false);
  };

  // Random Color Generator
  function generateRandomHexColor() {
      // Keep RGB values between 50 and 200 for bright, not too dark colors
      const r = Math.floor(Math.random() * 150 + 50);
      const g = Math.floor(Math.random() * 150 + 50);
      const b = Math.floor(Math.random() * 150 + 50);

      // Convert to hex
      const hex = (n) => n.toString(16).padStart(2, "0");
      return `#${hex(r)}${hex(g)}${hex(b)}`;
  }

  const toggleWeekday = (day) => {
    setWeekdays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
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
                options={allClients.map(c => ({ value: c.id, label: c.name }))}  // show name, store ID
                value={
                  client
                    ? (() => {
                        const selected = allClients.find(c => c.id === client);
                        return selected ? { value: selected.id, label: selected.name } : null;
                      })()
                    : null
                }
                onChange={(selectedOption) => setClient(selectedOption ? selectedOption.value : null)} // store ID
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
              <label>Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label>Employees</label>
              <Select
                isMulti
                options={allEmployees.map(emp => ({ value: emp.id, label: emp.name }))}   // show name, store ID
                value={employees.map(id => {
                  const emp = allEmployees.find(e => e.id === id);
                  return emp ? { value: emp.id, label: emp.name } : null;
                }).filter(Boolean)}   // ensure consistent display when editing
                onChange={(selectedOptions) => setEmployees(selectedOptions.map(o => o.value))}  // store IDs only
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

            {/* Right Column */}
            <div className="modal-column">
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

              {/* Recurring Event Toggle */}
              <div className="recurring-toggle">
                <span>Recurring Event</span>
                <div
                  className={`toggle-switch ${isRecurring ? "active" : ""}`}
                  onClick={() => setIsRecurring(!isRecurring)}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>

              {/* Recurrence Options */}
              {isRecurring && (
                <div className="recurrence-options">
                  <h3>Recurrence Settings</h3>

                  <div className="form-group">
                    <label>Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      required
                    >
                      <option value="">Select Frequency</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>

                  {/* Weekly */}
                  {frequency === "weekly" && (
                    <div className="weekdays">
                      <label>Repeat On:</label>
                      <div className="weekday-buttons">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day) => (
                            <button
                              type="button"
                              key={day}
                              onClick={() => toggleWeekday(day)}
                              className={
                                weekdays.includes(day) ? "weekday active" : "weekday"
                              }
                            >
                              {day[0]}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Monthly */}
                  {frequency === "monthly" && (
                    <div className="form-group">
                      <label>This event will repeat monthly on the same day.</label>
                    </div>
                  )}

                  {/* Until & Count */}
                  <div className="recurrence-end-section">
                    <label className="section-title">End of Recurrence</label>
                    <div className="end-type-buttons">
                      <button
                        type="button"
                        className={endType === "until" ? "end-btn active" : "end-btn"}
                        onClick={() => setEndType(endType === "until" ? null : "until")}
                      >
                        Until
                      </button>
                      <button
                        type="button"
                        className={endType === "count" ? "end-btn active" : "end-btn"}
                        onClick={() => setEndType(endType === "count" ? null : "count")}
                      >
                        Count
                      </button>
                    </div>

                    {endType === "until" && (
                      <div className="input-group">
                        <label>End Date</label>
                        <input
                          type="date"
                          value={until}
                          onChange={(e) => setUntil(e.target.value)}
                        />
                      </div>
                    )}

                    {endType === "count" && (
                      <div className="input-group">
                        <label>Number of Occurrences</label>
                        <input
                          type="number"
                          min="1"
                          value={count}
                          onChange={(e) => setCount(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
