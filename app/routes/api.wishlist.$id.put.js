import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import prisma from "~/db.server";

export async function action({ request, params }) {
  try {
    // Authenticate the Shopify admin request
    const { session } = await authenticate.admin(request);
    if (!session) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { productId } = await request.json();
    if (!id || !productId) {
      return json({ error: "Missing id or productId" }, { status: 400 });
    }

    // Validate productId format
    if (!productId.startsWith("gid://shopify/Product/")) {
      return json({ error: "Invalid productId format" }, { status: 400 });
    }

    // Update wishlist item
    const updatedItem = await prisma.wishlistItem.update({
      where: { id: id.toString() },
      data: { productId: productId.toString(), updatedAt: new Date() },
    });

    return json(updatedItem);
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    return json({ error: "Failed to update wishlist item" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}