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
    if (!id) {
      return json({ error: "Missing id" }, { status: 400 });
    }

    // Delete wishlist item
    await prisma.wishlistItem.delete({
      where: { id: id.toString() },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting wishlist item:", error);
    return json({ error: "Failed to delete wishlist item" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}