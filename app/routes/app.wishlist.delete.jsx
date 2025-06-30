import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function action({ request }) {
  const { customerId, productId } = await request.json();

  if (!customerId || !productId) {
    return json({ error: "Missing fields" }, { status: 400 });
  }

  const deleted = await prisma.wishlistItem.deleteMany({
    where: { customerId, productId },
  });

  return json({ message: "Deleted", count: deleted.count });
}
