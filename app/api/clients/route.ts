import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prismadb";

// GET all clients
export async function GET() {
  try {
    const clients = await prisma.client.findMany();
    return NextResponse.json(clients);
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

// POST create a new client
export async function POST(req: any) {
  try {
    const data = await req.json();
    const newClient = await prisma.client.create({ data });
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("POST /api/clients error:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
