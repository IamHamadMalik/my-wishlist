import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function action({ request }) {
  const { id } = await request.json();

  if (!id) {
    return json({ error: "Missing ID" }, {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  await prisma.wishlistItem.delete({
    where: { id },
  });

  return json({ message: "Deleted" }, {
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  });
}
