// server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// Endpoint di test per sincronizzare un solo prodotto per handle
app.get("/sync-product/:handle", async (req, res) => {
  const handle = req.params.handle;

  try {
    const response = await axios.get(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2023-10/products.json?handle=${handle}`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN_PRODUCTS,
        },
      }
    );

    const product = response.data.products[0];
    if (!product) return res.status(404).send("Prodotto non trovato");

    const variant = product.variants[0];
    const metafields = await axios.get(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2023-10/products/${product.id}/metafields.json`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN_PRODUCTS,
        },
      }
    );

    // Esempio di estrazione di dati da metafield se servono
    // const bioCert = metafields.data.metafields.find(m => m.key === "cert_bio");

    const merchantFeed = {
      id: variant.id,
      title: product.title,
      description: product.body_html.replace(/<[^>]+>/g, ""), // testo pulito
      link: `https://${process.env.SHOPIFY_STORE}/products/${handle}`,
      image_link: product.image?.src || "",
      additional_image_link: product.images[1]?.src || "",
      availability: variant.inventory_quantity > 0 ? "in stock" : "out of stock",
      price: `${(variant.compare_at_price || variant.price)} EUR`,
      sale_price: variant.compare_at_price ? `${variant.price} EUR` : undefined,
      brand: "AmoreTerra",
      gtin: variant.barcode,
      mpn: variant.sku,
      condition: "new",
      google_product_category: "food, beverages & tobacco > food items > pasta & noodles",
      shipping_weight: `${variant.weight} ${variant.weight_unit}`,
      identifier_exists: true,
    };

    console.log("Feed pronto:", merchantFeed);
    return res.status(200).json(merchantFeed);
  } catch (error) {
    console.error("Errore durante la sincronizzazione:", error.response?.data || error.message);
    return res.status(500).send("Errore nella sincronizzazione");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Merchant feed server avviato sulla porta ${PORT}`);
});
