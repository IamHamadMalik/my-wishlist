import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function action({ request }) {
  const { id, customerId, productId } = await request.json();

  if (!id || !customerId || !productId) {
    return json({ error: "Missing fields" }, { status: 400 });
  }

  const updated = await prisma.wishlistItem.update({
    where: { id },
    data: { customerId, productId },
  });

  return json({ message: "Updated", item: updated });
}
