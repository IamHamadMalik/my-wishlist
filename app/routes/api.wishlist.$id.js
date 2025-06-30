import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function action({ request, params }) {
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  const { id } = params;
  if (!id) {
    return json({ error: "Missing id" }, { status: 400 });
  }
  try {
    await prisma.wishlistItem.delete({ where: { id } });
    return json({ success: true });
  } catch (error) {
    return json({ error: "Delete failed" }, { status: 500 });
  }
}