const EXPRESS_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST() {
  try {
    const expressRes = await fetch(`${EXPRESS_URL}/api/auth/logout`, {
      method: "POST",
    });

    const setCookie = expressRes.headers.get("set-cookie");
    const response = Response.json({ success: true });

    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (err) {
    console.error("[/api/auth/logout]", err);
    return Response.json({ message: "Internal error" }, { status: 500 });
  }
}
