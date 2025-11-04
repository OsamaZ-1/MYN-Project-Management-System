// app/api/clients/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prismadb";

export async function GET() {
  const clients = await prisma.client.findMany({
    select: { id: true, name: true}
  });
  return NextResponse.json(clients);
}

// export async function POST(req: Request) {
//   const body = await req.json();
//   const client = await prisma.client.create({
//     data: {
//       name: body.name,
//       role: body.role || null,
//     },
//   });
//   return NextResponse.json(client);
// }
