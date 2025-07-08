import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css"; // Polaris styles

// ✅ Import Tailwind as a URL so Remix can bundle it properly
import tailwindStylesheetUrl from "./styles/tailwind.css";

// ✅ Export links for Remix to inject styles
export const links = () => [
  { rel: "stylesheet", href: tailwindStylesheetUrl },
  {
    rel: "stylesheet",
    href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css",
  },
  {
    rel: "preconnect",
    href: "https://cdn.shopify.com/",
  },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider i18n={{}}>
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
