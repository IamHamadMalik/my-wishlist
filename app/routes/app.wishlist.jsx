// app/routes/app.wishlist.jsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import prisma from "../db.server";

// ✅ Loader: Fetch wishlist with full product data from Shopify
export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");

  console.log("🧪 Incoming Customer ID:", customerId);

  const whereClause = customerId ? { customerId } : {}; // ← fetch all if not provided

  const wishlist = await prisma.wishlistItem.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  if (!wishlist.length) {
    return json({ wishlist: [] });
  }

  const enrichedWishlist = await Promise.all(
    wishlist.map(async (item) => {
      try {
        const productRes = await fetch(
          `https://www.luxuriawomen.com/products/${item.productHandle}.js`
        );
        const product = await productRes.json();

        return {
          ...item,
          title: product.title,
          vendor: product.vendor,
          price: product.price,
          image: product.featured_image,
          handle: product.handle,
        };
      } catch (err) {
        console.error("⚠️ Failed to load product for:", item.productHandle);
        return { ...item, title: null };
      }
    })
  );

  return json({ wishlist: enrichedWishlist });
}

// ✅ UI: Show full product details
export default function WishlistPage() {
  const { wishlist = [], error } = useLoaderData();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-pink-600">💖 My Wishlist</h1>

      {error ? (
        <p className="text-red-500 font-semibold">{error}</p>
      ) : wishlist.length === 0 ? (
        <p className="text-gray-500 italic">Your wishlist is empty.</p>
      ) : (
        <ul className="grid gap-6">
          {wishlist.map((item) =>
            item.title ? (
              <li key={item.id} className="flex items-center gap-4 border p-4 rounded shadow">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 object-contain border rounded"
                />
                <div className="flex-1">
                  <a
                    href={`/products/${item.handle}`}
                    className="text-lg font-semibold text-blue-600 hover:underline"
                  >
                    {item.title}
                  </a>
                  <p className="text-sm text-gray-500">{item.vendor}</p>
                  <p className="text-gray-800 font-bold mt-1">${(item.price / 100).toFixed(2)}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Added on: {new Date(item.createdAt).toLocaleString()}
                </p>
              </li>
            ) : (
              <li key={item.id} className="border p-4 rounded text-gray-400 italic">
                Product not found or removed.
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
