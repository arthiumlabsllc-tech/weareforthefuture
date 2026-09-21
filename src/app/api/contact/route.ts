import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(40).optional(),
  subject: z.string().max(120).optional(),
  message: z.string().min(10, "Please tell us a little more (at least 10 characters)"),
});

export async function POST(request: NextRequest) {
  try {
    // Preview safety: never write form submissions to the database from a
    // non-production deployment (Vercel preview/branch). Production unaffected.
    // Covers both the /contact form and the partner-inquiry form, which POST here.
    if (process.env.VERCEL_ENV !== "production") {
      return NextResponse.json(
        { error: "This is a preview build - form submissions are disabled." },
        { status: 403 }
      );
    }
    const body = await request.json();
    const data = contactSchema.parse(body);

    const submission = await prisma.contactSubmission.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        subject: data.subject?.trim() || null,
        message: data.message.trim(),
        status: "unread",
      },
    });

    return NextResponse.json(
      { success: true, id: submission.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Contact submission error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
