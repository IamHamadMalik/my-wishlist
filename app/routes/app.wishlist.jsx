// app/routes/app.wishlist.jsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import prisma from "../db.server";
import wishlistStyles from "../styles/wishlist.css";

export function links() {
  return [{ rel: "stylesheet", href: wishlistStyles }];
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");

  console.log("🧪 Incoming Customer ID:", customerId);

  const whereClause = customerId ? { customerId } : {};

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

export default function WishlistPage() {
  const { wishlist = [], error } = useLoaderData();

  return (
    <div className="wishlist-wrapper">
      <div className="wishlist-header">
        <h1 className="wishlist-title">
          <span className="wishlist-heart">❤️</span> Customer Wishlists
        </h1>
        <div className="wishlist-count">
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
        </div>
      </div>

      {error ? (
        <div className="wishlist-error">{error}</div>
      ) : wishlist.length === 0 ? (
        <div className="wishlist-empty">No wishlist items found.</div>
      ) : (
        <div className="wishlist-table-wrapper">
          <table className="wishlist-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Added</th>
                <th>Customer</th>
              </tr>
            </thead>
            <tbody>
              {wishlist.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="wishlist-product">
                      <img
                        className="wishlist-image"
                        src={item.image}
                        alt={item.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/48?text=No+Image";
                        }}
                      />
                      <a
                        href={`https://www.luxuriawomen.com/products/${item.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wishlist-product-link"
                      >
                        {item.title || "Product not available"}
                      </a>
                    </div>
                  </td>
                  <td>{item.vendor}</td>
                  <td>
                    {new Intl.NumberFormat("en-PK", {
                      style: "currency",
                      currency: "PKR",
                      minimumFractionDigits: 0,
                    }).format(item.price / 100)}
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className="wishlist-customer-id">{item.customerId}</span>
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
