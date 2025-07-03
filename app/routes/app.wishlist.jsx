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
    <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-semibold text-gray-900">
            <span className="text-pink-600">❤️</span> Customer Wishlists
        </h1>
        <div className="text-lg font-medium text-pink-600 bg-pink-50 px-4 py-2 rounded-full">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
        </div>
        </div>

        {error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-600 font-medium">
            {error}
        </div>
        ) : wishlist.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
            <p className="text-gray-400 italic">No wishlist items found.</p>
        </div>
        ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Brand</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Added</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200" style={{ width: '200px' }}>
                {wishlist.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                        <img 
                            className="h-12 w-12 object-cover rounded-md border border-gray-200" 
                            src={item.image} 
                            alt={item.title} 
                            onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                            }}
                        />
                        </div>
                        <div className="ml-4">
                        <a
                            href={`https://www.luxuriawomen.com/products/${item.handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-medium text-pink-600 hover:underline"
                        >
                            {item.title || 'Product not available'}
                        </a>
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                    {new Intl.NumberFormat('en-PK', {
                        style: 'currency',
                        currency: 'PKR',
                        minimumFractionDigits: 0
                    }).format(item.price / 100)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.customerId}
                    </span>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        )}
    </div>
    );

}
