import { NextResponse } from "next/server";

// The Next.js logout route is a no-op for the sf_token cookie since
// that cookie now lives on the Express domain (cleared by the client directly).
// This route exists so Navbar/Sidebar can call it as part of their logout flow.
export async function POST() {
  return NextResponse.json({ success: true });
}
