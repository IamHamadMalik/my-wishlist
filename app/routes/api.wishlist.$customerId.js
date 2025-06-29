import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import prisma from "~/db.server";

export async function loader({ request, params }) {
  try {
    // Authenticate the Shopify admin request
    const { session } = await authenticate.admin(request);
    if (!session) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = params;
    if (!customerId) {
      return json({ error: "Missing customerId" }, { status: 400 });
    }

    // Fetch wishlist items
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { customerId: customerId.toString() },
    });

    return json(wishlistItems);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return json({ error: "Failed to fetch wishlist" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}