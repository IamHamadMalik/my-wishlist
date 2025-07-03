import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { Stack } from '@shopify/polaris/build/esm/components/Stack'; // ✅ Corrected path
import {
  Card,
  Page,
  TextField,
  Button,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
} from "@shopify/polaris";

export async function loader({ request }) {
  try {
    const { session, admin } = await authenticate.admin(request);
    if (!session) return json({ error: "Unauthorized" }, { status: 401 });

    const customerResponse = await admin.graphql(`#graphql
      query {
        customer(id: "gid://shopify/Customer/123") {
          id
        }
      }
    `);
    const customerData = await customerResponse.json();
    const customerId = customerData.data.customer?.id?.split("/").pop() || null;

    if (!customerId) return json({ error: "No customer logged in" }, { status: 401 });

    return json({ customerId });
  } catch (error) {
    console.error("Error loading wishlist page:", error);
    return json({ error: "Failed to load wishlist page" }, { status: 500 });
  }
}

export default function Wishlist() {
  const { customerId, error } = useLoaderData();
  const fetcher = useFetcher();
  const [wishlist, setWishlist] = useState([]);
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState({});

  useEffect(() => {
    if (customerId) {
      fetcher.load(`/api/wishlist/${customerId}`);
    }
  }, [customerId]);

  useEffect(() => {
    if (fetcher.data && !fetcher.data.error) {
      setWishlist(fetcher.data);
      const productIds = fetcher.data.map((item) => item.productId);
      if (productIds.length > 0) {
        fetcher.load(`/api/products?ids=${productIds.join(",")}`);
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (fetcher.data?.products) {
      const productMap = fetcher.data.products.reduce((acc, product) => {
        acc[product.id] = product.title;
        return acc;
      }, {});
      setProducts(productMap);
    }
  }, [fetcher.data?.products]);

  const addToWishlist = () => {
    if (!productId || !productId.startsWith("gid://shopify/Product/")) {
      alert("Please enter a valid Product ID");
      return;
    }
    fetcher.submit(
      { customerId, productId },
      { method: "post", action: "/api/wishlist", encType: "application/json" }
    );
    setProductId("");
  };

  const removeFromWishlist = (id) => {
    fetcher.submit(null, {
      method: "delete",
      action: `/api/wishlist/${id}/delete`,
    });
  };

  return (
    <Page title="Customer Wishlist">
      {error && <Text color="critical">{error}</Text>}

      <Card sectioned>
        <Stack spacing="tight">
          <TextField
            label="Product ID"
            placeholder="gid://shopify/Product/123"
            value={productId}
            onChange={setProductId}
            autoComplete="off"
          />
          <Button
            onClick={addToWishlist}
            primary
            disabled={fetcher.state !== "idle" || !productId}
          >
            Add to Wishlist
          </Button>
        </Stack>
      </Card>

      {wishlist.length === 0 ? (
        <Card sectioned>
          <Text>No items in your wishlist.</Text>
        </Card>
      ) : (
        <ResourceList
          resourceName={{ singular: "wishlist item", plural: "wishlist items" }}
          items={wishlist}
          renderItem={(item) => {
            const title = products[item.productId] || item.productId;
            return (
              <ResourceItem id={item.id}>
                <Stack alignment="center" distribution="equalSpacing">
                  <Text>{title}</Text>
                  <Badge>{item.productId}</Badge>
                  <Button destructive onClick={() => removeFromWishlist(item.id)}>
                    Remove
                  </Button>
                </Stack>
              </ResourceItem>
            );
          }}
        />
      )}

      {fetcher.data?.error && (
        <Text color="critical" variant="bodyMd">
          {fetcher.data.error}
        </Text>
      )}
    </Page>
  );
}