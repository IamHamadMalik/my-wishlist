import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");

  if (!customerId) {
    return json(
      { error: "Missing customer ID" },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*" // 👈 Allow CORS
        }
      }
    );
  }

  const items = await prisma.wishlistItem.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" }
  });

  return json(
    { items },
    {
      headers: {
        "Access-Control-Allow-Origin": "*" // 👈 Allow CORS
      }
    }
  );
}
