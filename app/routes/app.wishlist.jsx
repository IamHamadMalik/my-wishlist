// app/routes/app.wishlist.jsx
import { json } from "@remix-run/node";
import prisma from "../db.server";

// ✅ Action: Add item to wishlist with productHandle
export async function action({ request }) {
  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      {
        status: 405,
        headers: {
          "Access-Control-Allow-Origin": "*", // Replace with store domain if needed
        },
      }
    );
  }

  try {
    const { customerId, productId, productHandle } = await request.json();

    if (!customerId || !productId || !productHandle) {
      return json(
        { error: "Missing fields" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const existing = await prisma.wishlistItem.findFirst({
      where: { customerId, productId },
    });

    if (existing) {
      return json(
        { message: "Already in wishlist" },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const newItem = await prisma.wishlistItem.create({
      data: { customerId, productId, productHandle },
    });

    return json(
      { message: "Added", item: newItem },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("❌ Error adding to wishlist:", error);
    return json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

// ✅ Handle OPTIONS (CORS preflight)
export function headers() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
