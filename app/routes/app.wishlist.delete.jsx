import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    const { customerId, productId } = await request.json();

    if (!customerId || !productId) {
      return json(
        { error: "Missing fields" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const deleted = await prisma.wishlistItem.deleteMany({
      where: { customerId, productId },
    });

    return json(
      { message: "Deleted", count: deleted.count },
      { headers: corsHeaders() }
    );
  } catch (err) {
    console.error("Delete error:", err);
    return json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
