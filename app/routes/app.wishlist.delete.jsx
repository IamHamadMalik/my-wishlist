import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function action({ request }) {
  try {
    const { customerId, productId } = await request.json();

    if (!customerId || !productId) {
      return json({ error: "Missing fields" }, {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const deleted = await prisma.wishlistItem.deleteMany({
      where: { customerId, productId },
    });

    return json({ message: "Deleted", count: deleted.count }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Delete error:", err);
    return json({ error: "Server error" }, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
