import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const EXPRESS_URL = process.env.BACKEND_API_URL;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const { id, email, name, role } = session.user;

    const expressRes = await fetch(`${EXPRESS_URL}/api/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_SECRET,
      },
      body: JSON.stringify({ id, email, name, role }),
    });

    if (!expressRes.ok) {
      const text = await expressRes.text();
      console.error("[/api/auth/token] Express error:", text);
      return NextResponse.json({ message: "Failed to issue token" }, { status: 500 });
    }

    const { token } = await expressRes.json();

    if (!token) {
      console.error("[/api/auth/token] Express did not return a token in body");
      return NextResponse.json({ message: "No token received" }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("sf_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[/api/auth/token]", err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
