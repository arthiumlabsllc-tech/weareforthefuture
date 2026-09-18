import { NextResponse } from "next/server";
import { getPublicProgrammes } from "@/lib/programmes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const programs = await getPublicProgrammes();
    const featured = programs.filter((program) => program.featured);
    const remaining = programs.filter((program) => !program.featured);
    return NextResponse.json({ programs: [...featured, ...remaining].slice(0, 6) });
  } catch {
    return NextResponse.json({ error: "Programmes are temporarily unavailable." }, { status: 503 });
  }
}
