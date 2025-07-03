import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import './styles/globals.css';


export async function loader({ request }) {
  try {
    // Authenticate the Shopify admin request
    const { session, admin } = await authenticate.admin(request);
    if (!session) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Replace with actual customer ID logic (e.g., from session or Storefront API)
    const customerResponse = await admin.graphql(
      `#graphql
        query {
          customer(id: "gid://shopify/Customer/123") {
            id
          }
        }
      `
    );
    const customerData = await customerResponse.json();
    const customerId = customerData.data.customer?.id?.split("/").pop() || null;

    if (!customerId) {
      return json({ error: "No customer logged in" }, { status: 401 });
    }

    return json({ customerId });
  } catch (error) {
    console.error("Error loading wishlist page:", error);
    return json({ error: "Failed to load wishlist page" }, { status: 500 });
  }
}

export default function Wishlist() {
  const { customerId, error } = useLoaderData();
  const fetcher = useFetcher();
  const [wishlist, setWishlist] = useState([]);
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState({}); // Store product details

  // Fetch wishlist items
  useEffect(() => {
    if (customerId) {
      fetcher.load(`/api/wishlist/${customerId}`);
    }
  }, [customerId]);

  // Update wishlist and fetch product details
  useEffect(() => {
    if (fetcher.data && !fetcher.data.error) {
      setWishlist(fetcher.data);
      // Fetch product details for each wishlist item
      const productIds = fetcher.data.map((item) => item.productId);
      if (productIds.length > 0) {
        fetcher.load(`/api/products?ids=${productIds.join(",")}`);
      }
    }
  }, [fetcher.data]);

  // Store product details
  useEffect(() => {
    if (fetcher.data?.products) {
      const productMap = fetcher.data.products.reduce((acc, product) => {
        acc[product.id] = product.title;
        return acc;
      }, {});
      setProducts(productMap);
    }
  }, [fetcher.data?.products]);

  // Add to wishlist
  const addToWishlist = async () => {
    if (!productId || !productId.startsWith("gid://shopify/Product/")) {
      alert("Please enter a valid Product ID (e.g., gid://shopify/Product/123)");
      return;
    }
    fetcher.submit(
      { customerId, productId },
      { method: "post", action: "/api/wishlist", encType: "application/json" }
    );
    setProductId("");
  };

  // Remove from wishlist
  const removeFromWishlist = async (id) => {
    fetcher.submit(null, {
      method: "delete",
      action: `/api/wishlist/${id}/delete`,
    });
  };

  if (error) {
    return <div style={{ color: "red", padding: "20px" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>My Wishlist</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter Product ID (e.g., gid://shopify/Product/123)"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", width: "300px" }}
        />
        <button
          onClick={addToWishlist}
          disabled={fetcher.state !== "idle" || !productId}
          style={{
            padding: "8px 16px",
            backgroundColor: productId ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            cursor: productId ? "pointer" : "not-allowed",
          }}
        >
          Add to Wishlist
        </button>
      </div>
      {wishlist.length === 0 ? (
        <p>No items in your wishlist.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {wishlist.map((item) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                borderBottom: "1px solid #ddd",
              }}
            >
              <span>
                {products[item.productId] || item.productId}
              </span>
              <button
                onClick={() => removeFromWishlist(item.id)}
                disabled={fetcher.state !== "idle"}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {fetcher.data?.error && (
        <p style={{ color: "red", marginTop: "10px" }}>{fetcher.data.error}</p>
      )}
    </div>
  );
}