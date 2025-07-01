import { json } from "@remix-run/node";
import prisma from "../db.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export async function action({ request }) {
  // ✅ Handle CORS preflight request
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

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
