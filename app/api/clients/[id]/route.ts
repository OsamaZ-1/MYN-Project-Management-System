import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prismadb";

// PUT - update client
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params; // <-- unwrap the Promise
  const { id } = params;

  const data = await req.json();
  const safeData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );

  const updatedClient = await prisma.client.update({
    where: { id: Number(id) },
    data: safeData,
  });

  return NextResponse.json(updatedClient);
}

// DELETE - delete client
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params; // <-- unwrap the Promise
  const { id } = params;

  await prisma.client.delete({ where: { id: Number(id) } });

  return NextResponse.json({ success: true });
}
