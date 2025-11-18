"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from '@fullcalendar/rrule'
import "./styles/calendar.css";

import InfoDisplayModal from "./InfoDisplayModal";
import InfoEditModal from "./InfoEditModal";

export default function Calendar() {

    // Information to be displayed when event is clicked
    const [displayInfo, setDisplayInfo] = useState(null);
    const [openDisplayInfo, setOpenDisplayInfo] = useState(false);
    
    // Add new Event or Edit old Event
    const [editInfo, setEditInfo] = useState(null);
    const [openEditInfo, setOpenEditInfo] = useState(false);

    // Get all events, employees, and clients from DB
    const [events, setEvents] = useState([])
    const [allEmployees, setAllEmployees] = useState([]);
    const [allClients, setAllClients] = useState([]);

    // Filtering Events
    const [showFilter, setShowFilter] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState(events);
    const [selectedClients, setSelectedClients] = useState([]);

    useEffect(() => {
      if (selectedClients.length === 0) {
        setFilteredEvents(events); // show all if none selected
      } else {
        setFilteredEvents(
          events.filter((e) => selectedClients.includes(String(e.client)))
        );
      }
    }, [selectedClients, events]);
    
    // Fetch everything from DB
    useEffect(() => {
      async function fetchEvents() {
        try {
          const res = await fetch("/api/events");
          const data = await res.json();
          setEvents(data);
        }
        catch (error) {
          console.error("Failed to fetch employees:", error);
        }
      }

      async function fetchEmployees() {
        try {
          const res = await fetch("/api/employees");
          const data = await res.json();
          setAllEmployees(data); // data is an array of {id, name}
        }
        catch (error) {
          console.error("Failed to fetch employees:", error);
        }
      }
  
      async function fetchClients(){
        try {
          const res = await fetch("/api/clients");
          const data = await res.json();
          setAllClients(data); // data is an array of {id, name}
        }
        catch (error) {
          console.error("Failed to fetch clients:", error);
        }
      }
  
      fetchEvents();
      fetchEmployees();
      fetchClients();
    }, []);

  async function saveEventDB(newEvent){
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });

    if (!res.ok) {
      throw new Error(`Failed to save event: ${res.statusText}`);
    }

    const savedEvent = await res.json();
    return savedEvent;
  }

  // Handle selecting a time range
  const handleSelect = (info) => {
    setEditInfo({
        id: null,
        title: "",
        start: info.startStr,
        end: info.endStr,
        rrule: null,
        exdate: [],
        duration: "",
        description: "",
        employees: [],
        client: "",
        color: "",
        parentId: null,
    });
    setOpenEditInfo(true);
  };

  // Handle clicking on an event
  const handleEventClick = (info, dragDrop = false) => {
    if (dragDrop){
      handleEventEdit(info.event);
    }
    else{
      setDisplayInfo(info);
      setOpenDisplayInfo(true);
    }
  };

  // Handle Editing already existing events
  const handleEventEdit = (info) => {
    let infoID = info._def.publicId;
    let infoParentID = info.extendedProps?.parentId;
    // let infoRrule = info._def.recurringDef?.typeData?.rrule || null;
    let baseEvent = null;

    // check if event is recurring
    if (info._def.recurringDef != null){
      // get original recurring event
      baseEvent = events.find(e => Number(e.id) === Number(info._def.publicId));

      // if current event is not the original one
      if (baseEvent.start != info.start){
        infoID = null;
        infoParentID = baseEvent.id;
        // infoRrule = null;

        // also add this event to the exceptions of the original
        baseEvent.exdate = [...(baseEvent.exdate || []), info.start.toISOString()];
      }
      else{
        baseEvent = null;
      }
    }
    
    setEditInfo({
        id: infoID,
        title: info.title,
        start: info.start,
        end: info.end,
        rrule: info.rrule, //infoRrule
        exdate: info.exdate,
        duration: info.duration,
        description: info.extendedProps?.description || "",
        employees: info.extendedProps?.employees || [],
        client: info.extendedProps?.client || "",
        color: info.backgroundColor,
        parentId: infoParentID,
        baseEvent,
    });
    setOpenDisplayInfo(false);
    setOpenEditInfo(true);
  }

  const handleEventSave = (newEvent, newEventId, isUpdate) => {
    setEvents((prev) => {
        if (isUpdate) {
            return prev.map((ev) =>
                Number(ev.id) === Number(newEvent.id) ? { ...ev, ...newEvent } : ev
            );
        } else {
            return [...prev, { ...newEvent, id: newEventId}];
        }
    });
   };

  return (
    <div>
      {/* ----- Toggle Filter Button ----- */}
      <button
        className="filter-toggle-btn"
        onClick={() => setShowFilter((prev) => !prev)}
      >
        {showFilter ? "Hide Filter" : "Show Filter"}
      </button>

      {/* ----- Client Filter Form ----- */}
      {showFilter && (
        <div className="filter-container">
          <label className="filter-label">Select Clients:</label>
          <Select
            isMulti
            options={allClients.map((client) => ({
              value: client.id.toString(),
              label: client.name,
            }))}
            value={allClients
              .filter((client) => selectedClients.includes(client.id.toString()))
              .map((client) => ({
                value: client.id.toString(),
                label: client.name,
              }))}
            onChange={(selectedOptions) => {
              const selected = selectedOptions.map((opt) => opt.value);
              setSelectedClients(selected);
            }}
            className="filter-select"
            classNamePrefix="select"
            placeholder="Choose clients..."
          />
        </div>
      )}
      <br/>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        initialView="timeGridWeek"
        selectable={true}
        selectMirror={true}
        select={handleSelect}
        eventClick={handleEventClick}
        eventDrop={(info) => handleEventClick(info, true)}
        eventResize={(info) => handleEventClick(info, true)}
        events={filteredEvents}
        editable={true}
        nowIndicator={true}
        allDaySlot={true}
        slotDuration="00:30:00"
        height="85vh"
      />

      <InfoDisplayModal openDisplayInfo={openDisplayInfo} setOpenDisplayInfo={setOpenDisplayInfo} info={displayInfo} onEdit={handleEventEdit} allEmployees={allEmployees} allClients={allClients} />
      
      <InfoEditModal openEditInfo={openEditInfo} setOpenEditInfo={setOpenEditInfo} eventData={editInfo} onSave={handleEventSave} allEmployees={allEmployees} allClients={allClients} saveEventDB={saveEventDB} />
    </div>
  );
}
