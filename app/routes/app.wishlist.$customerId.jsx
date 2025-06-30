import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ params }) {
  const { customerId } = params;

  if (!customerId) {
    return json({ error: "Missing customerId" }, { status: 400 });
  }

  const items = await prisma.wishlistItem.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });

  return json({ items });
}
