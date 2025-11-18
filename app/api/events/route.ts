import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prismadb";

export async function GET() {
  // Get events from the database
  const events = await prisma.event.findMany({
    include: {
      employees: true, // array of Employee objects
      client: true,    // single Client object
    },
  });

  // Reshape events to match old frontend structure
  const formattedEvents = events.map((info: any) => ({
    id: info.id,
    title: info.title,
    start: info.start,
    end: info.end,
    rrule: info.rrule,
    exdate: info.exdate,
    duration: info.duration,
    description: info.description || "",
    employees: info.employees.map((e: any) => e.id), // array of string IDs
    client: info.client?.id || "",              // string ID
    color: info.color,
    parentId: info.parentEventId,
  }));

  // Return as JSON
  return NextResponse.json(formattedEvents);
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    let {
      id,
      title,
      start,
      end,
      duration,
      isRecurring,
      rrule,
      exdate,
      description,
      color,
      employees,   // array of employee IDs
      client,      // client ID
      parentId, // parent event ID for exceptions
    } = body;

    let event;

    if (id != null) {
      // UPDATE EXISTING EVENT
      id = Number(id);
      event = await prisma.event.update({
        where: { id },
        data: {
          title,
          start: new Date(start),
          end: end ? new Date(end) : new Date(start),
          duration,
          isRecurring,
          rrule,
          exdate,
          description,
          color,
          client: { connect: { id: client } },
          employees: {
            set: [],
            connect: employees.map((empId: number) => ({ id: empId })),
          },
          ...(parentId
            ? { parentEvent: { connect: { id: parentId } } }
            : {}),
        },
        include: {
          client: true,
          employees: true,
          parentEvent: true,
        },
      });
    } else {
      // CREATE NEW EVENT
      event = await prisma.event.create({
        data: {
          title,
          start: new Date(start),
          end: end ? new Date(end) : new Date(start),
          duration,
          isRecurring,
          rrule,
          exdate,
          description,
          color,
          client: { connect: { id: client } },
          employees: {
            connect: employees.map((empId: number) => ({ id: empId })),
          },
          ...(parentId
            ? { parentEvent: { connect: { id: parentId } } }
            : {}),
        },
        include: {
          client: true,
          employees: true,
          parentEvent: true,
        },
      });
    }

    return NextResponse.json(event);
  } catch (error: any) {
    console.error("Error saving event:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
