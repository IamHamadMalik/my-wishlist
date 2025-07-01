import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (!customerId) {
    return json(
      { error: "Missing customer ID", items: [] },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  try {
    const items = await prisma.wishlistItem.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    return json(
      { items },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    return json(
      { error: "Server error", items: [] },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
