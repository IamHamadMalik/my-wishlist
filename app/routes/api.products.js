import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function loader({ request }) {
  try {
    // Authenticate the Shopify admin request
    const { session, admin } = await authenticate.admin(request);
    if (!session) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get product IDs from query parameter
    const url = new URL(request.url);
    const ids = url.searchParams.get("ids")?.split(",") || [];
    if (!ids.length) {
      return json({ error: "No product IDs provided" }, { status: 400 });
    }

    // Fetch product details
    const response = await admin.graphql(
      `#graphql
        query ($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Product {
              id
              title
            }
          }
        }
      `,
      { variables: { ids } }
    );
    const data = await response.json();
    const products = data.data.nodes.filter((node) => node);

    return json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return json({ error: "Failed to fetch products" }, { status: 500 });
  }
}