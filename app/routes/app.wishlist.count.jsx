import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");

  if (!customerId) {
    return json({ count: 0 }, { status: 400 });
  }

  const count = await prisma.wishlistItem.count({
    where: { customerId },
  });

  return json({ count }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
