import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set("sf_token", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("[/api/auth/logout]", err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
