// app/routes/app.wishlist.jsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import prisma from "../db.server";

// ✅ Loader: Fetch wishlist for this customer
export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  console.log("🧪 Incoming Customer ID:", customerId);

  if (!customerId) {
    return json({ wishlist: [], error: "Missing customer ID" });
  }

  const wishlist = await prisma.wishlistItem.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });

  return json({ wishlist });
}

// ✅ Action: Add item to wishlist with productHandle
export async function action({ request }) {
  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      {
        status: 405,
        headers: {
          "Access-Control-Allow-Origin": "*", // Replace * with store domain if needed
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

// ✅ UI: Show wishlist
export default function WishlistPage() {
  const { wishlist, error } = useLoaderData();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-pink-600">💖 My Wishlist</h1>

      {error ? (
        <p className="text-red-500 font-semibold">{error}</p>
      ) : wishlist.length === 0 ? (
        <p className="text-gray-500 italic">Your wishlist is empty.</p>
      ) : (
        <ul className="space-y-4">
          {wishlist.map((item) => (
            <li key={item.id} className="border p-4 rounded shadow">
              <p><strong>Product ID:</strong> {item.productId}</p>
              <p><strong>Handle:</strong> {item.productHandle}</p>
              <p className="text-sm text-gray-500">
                Added on: {new Date(item.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
