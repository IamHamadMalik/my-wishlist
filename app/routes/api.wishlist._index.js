import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import prisma from "~/db.server";

export async function action({ request }) {
  try {
    // Authenticate the Shopify admin request
    const { session } = await authenticate.admin(request);
    if (!session) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const { customerId, productId } = await request.json();
    if (!customerId || !productId) {
      return json({ error: "Missing customerId or productId" }, { status: 400 });
    }

    // Validate productId format
    if (!productId.startsWith("gid://shopify/Product/")) {
      return json({ error: "Invalid productId format" }, { status: 400 });
    }

    // Create wishlist item
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        customerId: customerId.toString(),
        productId: productId.toString(),
      },
    });

    return json(wishlistItem, { status: 201 });
  } catch (error) {
    console.error("Error creating wishlist item:", error);
    return json({ error: "Failed to add item to wishlist" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}