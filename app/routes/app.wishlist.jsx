import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import prisma from "../db.server";

// Load all wishlist items
export async function loader() {
  const wishlist = await prisma.wishlistItem.findMany({
    orderBy: { createdAt: "desc" },
  });
  return json({ wishlist });
}

// Handle actions: add, update, delete
export async function action({ request }) {
  const form = await request.formData();
  const actionType = form.get("_action");

  const id = form.get("id");
  const customerId = form.get("customerId");
  const productId = form.get("productId");

  try {
    if (actionType === "add") {
      await prisma.wishlistItem.create({
        data: { customerId, productId },
      });
    } else if (actionType === "update" && id) {
      await prisma.wishlistItem.update({
        where: { id },
        data: { customerId, productId },
      });
    } else if (actionType === "delete" && id) {
      await prisma.wishlistItem.delete({
        where: { id },
      });
    }
    return redirect("/admin/wishlist");
  } catch (error) {
    console.error("Action error:", error);
    throw new Response("Error processing request", { status: 500 });
  }
}

// UI
export default function WishlistAdminPage() {
  const { wishlist } = useLoaderData();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <h1 className="text-4xl font-bold text-blue-800">🎁 Wishlist Admin</h1>

      {/* Add New Wishlist Item */}
      <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Add New Wishlist Item</h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="_action" value="add" />
          <div className="grid grid-cols-2 gap-4">
            <input
              name="customerId"
              placeholder="Customer ID"
              required
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
            <input
              name="productId"
              placeholder="Product ID"
              required
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition-transform transform hover:scale-105 shadow"
          >
            ➕ Add to Wishlist
          </button>
        </Form>
      </div>

      {/* Wishlist Records */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">📋 Wishlist Records</h2>
        {wishlist.length === 0 ? (
          <p className="text-gray-500 italic">No wishlist records found.</p>
        ) : (
          <div className="space-y-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl shadow-md p-5 transition hover:shadow-lg hover:border-blue-400"
              >
                <div className="mb-4 space-y-1">
                  <p><strong className="text-gray-600">Customer:</strong> {item.customerId}</p>
                  <p><strong className="text-gray-600">Product:</strong> {item.productId}</p>
                  <p className="text-sm text-gray-400">📅 {new Date(item.createdAt).toLocaleString()}</p>
                </div>

                {/* Update Form */}
                <Form method="post" className="space-y-2">
                  <input type="hidden" name="_action" value="update" />
                  <input type="hidden" name="id" value={item.id} />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="customerId"
                      defaultValue={item.customerId}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-300 focus:outline-none transition"
                    />
                    <input
                      name="productId"
                      defaultValue={item.productId}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-300 focus:outline-none transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-1 rounded-md transition-transform transform hover:scale-105 shadow"
                  >
                    ✏️ Update
                  </button>
                </Form>

                {/* Delete Form — outside of update form */}
                <Form method="post" className="mt-2">
                  <input type="hidden" name="_action" value="delete" />
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-800 font-medium text-sm underline underline-offset-2 transition"
                  >
                    🗑️ Delete
                  </button>
                </Form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
