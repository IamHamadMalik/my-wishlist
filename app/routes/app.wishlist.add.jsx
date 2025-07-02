// app/routes/app.wishlist.add.jsx
import { json } from "@remix-run/node";
import prisma from "../db.server";

// Handle POST requests to add a wishlist item
export async function action({ request }) {
  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      {
        status: 405,
        headers: {
          "Access-Control-Allow-Origin": "https://www.luxuriawomen.com", // or "*"
        },
      }
    );
  }

  try {
    const { customerId, productId, productHandle } = await request.json();
    console.log("📩 Incoming Add Request:", { customerId, productId, productHandle });

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

// Handle preflight OPTIONS requests for CORS
export async function loader() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
