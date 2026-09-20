import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const volunteerSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(40).optional(),
  country: z.string().max(60).optional(),
  interest: z.string().max(60).optional(),
  message: z.string().max(4000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Preview safety: never write form submissions to the database from a
    // non-production deployment (Vercel preview/branch). Production unaffected.
    if (process.env.VERCEL_ENV !== "production") {
      return NextResponse.json(
        { error: "Form submissions are disabled on preview deployments." },
        { status: 403 }
      );
    }
    const body = await request.json();
    const data = volunteerSchema.parse(body);

    const application = await prisma.volunteerApplication.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        country: data.country?.trim() || null,
        interest: data.interest?.trim() || null,
        message: data.message?.trim() || null,
        status: "new",
      },
    });

    return NextResponse.json(
      { success: true, id: application.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Volunteer application error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
