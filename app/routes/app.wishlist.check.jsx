import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  const productId = url.searchParams.get("productId");

  if (!customerId || !productId) {
    return json({ exists: false }, {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const item = await prisma.wishlistItem.findFirst({
    where: { customerId, productId },
  });

  return json({ exists: !!item }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
