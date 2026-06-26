import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const EXPRESS_URL = process.env.NEXT_PUBLIC_API_URL;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ message: "Unauthenticated" }, { status: 401 });
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
      return Response.json({ message: "Failed to issue token" }, { status: 500 });
    }

    const setCookie = expressRes.headers.get("set-cookie");
    const response = Response.json({ success: true });

    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (err) {
    console.error("[/api/auth/token]", err);
    return Response.json({ message: "Internal error" }, { status: 500 });
  }
}
