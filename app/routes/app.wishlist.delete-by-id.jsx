import { json } from "@remix-run/node";
import prisma from "../db.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ✅ Respond to CORS preflight via loader
export async function loader({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // If someone tries to GET this route, return an error
  return json({ error: "GET not supported" }, { status: 405, headers: corsHeaders });
}

// ✅ Handle actual DELETE request via POST
export async function action({ request }) {
  try {
    const { id } = await request.json();

    if (!id) {
      return json(
        { error: "Missing ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    await prisma.wishlistItem.delete({
      where: { id },
    });

    return json({ message: "Deleted" }, { headers: corsHeaders });
  } catch (err) {
    console.error("Delete by ID error:", err);
    return json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
