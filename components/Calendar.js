"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import InfoDisplayModal from "./InfoDisplayModal";
import InfoEditModal from "./InfoEditModal";

export default function Calendar() {

    // Information to be displayed when event is clicked
    const [displayInfo, setDisplayInfo] = useState(null);
    const [openDisplayInfo, setOpenDisplayInfo] = useState(false);
    
    // Add new Event or Edit old Event
    const [editInfo, setEditInfo] = useState(null);
    const [openEditInfo, setOpenEditInfo] = useState(false);

    // Eventully this will be edited to get information from the database
    const [events, setEvents] = useState([
    {
      id: 1,
      title: "Team Meeting",
      start: "2025-10-27T10:00:00",
      end: "2025-10-27T11:30:00",
      employees: ["Mohammed Sarout", "Yasser Dalli", "Malek Srouji"],
      client: "Bizim Eller",
      color: "#990088",
      description: "Weekly sync with the dev team",
    },
    {
      id: 2,
      title: "Project Deadline",
      start: "2025-10-30",
      end: "2025-10-31",
      employees: ["Sarout Mohammed", "Dalli Yasser", "Srouji Malek"],
      client: "Foods and Co.",
      description: "Final submission of project files",
    },
  ]);

  // Handle selecting a time range
  const handleSelect = (info) => {
    setEditInfo({
        id: null,               // No ID yet → new event
        title: "",
        start: info.startStr,   // prefill selected cell
        end: info.endStr,
        description: "",
        employees: [],
        client: "",
    });
    setOpenEditInfo(true);
  };

  // Handle clicking on an event
  const handleEventClick = (info) => {
    setDisplayInfo(info);
    setOpenDisplayInfo(true);
  };

  // Handle Editing already existing events
  const handlEventEdit = (info) => {
    setEditInfo({
        id: info.id.toString(),
        title: info.title,
        start: info.start,
        end: info.end,
        description: info.extendedProps?.description || "",
        employees: info.extendedProps?.employees || [],
        client: info.extendedProps?.client || "",
    });
    setOpenDisplayInfo(false);
    setOpenEditInfo(true);
  }

  const handleEventDrop = (info) => {
    const updatedEvent = {
        id: info.event.id,
        title: info.event.title,
        start: info.event.start,
        end: info.event.end,
        description: info.event.extendedProps?.description || "",
        employees: info.event.extendedProps?.employees || [],
        client: info.event.extendedProps?.client || "",
    };

    // Trigger your save function
    handleEventSave(updatedEvent, true); // true = update existing event
   };

  const handleEventSave = (newEvent, isUpdate) => {
    setEvents((prev) => {
        if (isUpdate) {
            return prev.map((ev) =>
                ev.id.toString() === newEvent.id.toString() ? { ...ev, ...newEvent } : ev
            );
        } else {
            return [...prev, { ...newEvent, id: Date.now().toString(), color: generateRandomHexColor() }];
        }
    });
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


  return (
    <div>
      <br/>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
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
        eventDrop={(info) => handleEventDrop(info)}
        eventResize={(info) => handleEventDrop(info)}
        events={events}
        editable={true}
        nowIndicator={true}
        allDaySlot={true}
        slotDuration="00:30:00"
        height="85vh"
      />

      <InfoDisplayModal openDisplayInfo={openDisplayInfo} setOpenDisplayInfo={setOpenDisplayInfo} info={displayInfo} onEdit={handlEventEdit}/>
      
      <InfoEditModal openEditInfo={openEditInfo} setOpenEditInfo={setOpenEditInfo} eventData={editInfo} onSave={handleEventSave} />
    </div>
  );
}
