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
    const rawItems = await prisma.wishlistItem.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    // 🔄 Enrich with full product info
    const enrichedItems = await Promise.all(
      rawItems.map(async (item) => {
        try {
          const res = await fetch(`https://www.luxuriawomen.com/products/${item.productHandle}.js`);
          const product = await res.json();

          return {
            ...item,
            title: product.title,
            price: product.price,
            vendor: product.vendor,
            image: product.featured_image,
            handle: product.handle,
          };
        } catch (err) {
          console.warn("❌ Failed to fetch product:", item.productHandle);
          return { ...item, title: null }; // fallback
        }
      })
    );

    return json(
      { items: enrichedItems },
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
