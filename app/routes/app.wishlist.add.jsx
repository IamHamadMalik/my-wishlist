import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function action({ request }) {
  const { customerId, productId } = await request.json();

  if (!customerId || !productId) {
    return json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.wishlistItem.findFirst({
    where: { customerId, productId },
  });

  if (existing) {
    return json({ message: "Already in wishlist" });
  }

  const newItem = await prisma.wishlistItem.create({
    data: { customerId, productId },
  });

  return json({ message: "Added", item: newItem });
}
