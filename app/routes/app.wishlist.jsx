import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import prisma from "../db.server";

// Load wishlist items for specific customer
export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");

  if (!customerId) {
    return json({ error: "Missing customer ID" }, { status: 400 });
  }

  try {
    const wishlist = await prisma.wishlistItem.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    return json({ wishlist });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ error: "Error loading wishlist" }, { status: 500 });
  }
}

// UI for Wishlist Page
export default function WishlistPage() {
  const data = useLoaderData();

  if (data.error) {
    return <p className="text-red-500 font-semibold">❌ {data.error}</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">❤️ My Wishlist</h1>

      {data.wishlist.length === 0 ? (
        <p className="text-gray-600 italic text-center">Your wishlist is empty.</p>
      ) : (
        <ul className="space-y-4">
          {data.wishlist.map((item) => (
            <li key={item.id} className="border p-4 rounded shadow">
              <p><strong>Product ID:</strong> {item.productId}</p>
              <p className="text-sm text-gray-400">Added: {new Date(item.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
