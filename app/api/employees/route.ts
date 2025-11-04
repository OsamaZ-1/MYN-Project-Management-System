// app/api/employees/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prismadb";

export async function GET() {
  const employees = await prisma.employee.findMany({
    select: { id: true, name: true}
  });
  return NextResponse.json(employees);
}

export async function POST(req: Request) {
  const body = await req.json();
  const employee = await prisma.employee.create({
    data: {
      name: body.name,
      role: body.role || null,
    },
  });
  return NextResponse.json(employee);
}
