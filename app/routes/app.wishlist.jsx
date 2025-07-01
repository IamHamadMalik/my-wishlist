// app/routes/app.wishlist.jsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import prisma from "../db.server";

// ✅ Loader: Fetch wishlist for this customer
export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");

  if (!customerId) {
    return json({ wishlist: [], error: "Missing customer ID" });
  }

  const wishlist = await prisma.wishlistItem.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });

  return json({ wishlist });
}

// ✅ UI: Show wishlist or error
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
              <p><strong>Product:</strong> {item.productId}</p>
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