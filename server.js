// server.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { XMLBuilder } from 'fast-xml-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN_FEED;

app.get('/merchant/feed/:handle', async (req, res) => {
  const { handle } = req.params;

  try {
    const productResp = await axios.get(
      `https://${SHOPIFY_DOMAIN}/admin/api/2023-07/products.json?handle=${handle}`,
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    const product = productResp.data.products[0];
    if (!product) return res.status(404).send('Product not found');

    const variant = product.variants[0];
    const metafieldsResp = await axios.get(
      `https://${SHOPIFY_DOMAIN}/admin/api/2023-07/products/${product.id}/metafields.json`,
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
        },
      }
    );

    const metafields = metafieldsResp.data.metafields;
    const getMetafield = (namespace, key) => {
      const m = metafields.find(
        (m) => m.namespace === namespace && m.key === key
      );
      return m ? m.value : '';
    };

    const builder = new XMLBuilder({ ignoreAttributes: false });

    const xml = builder.build({
      rss: {
        '@_version': '2.0',
        channel: {
          title: product.title,
          link: `https://${SHOPIFY_DOMAIN}/products/${handle}`,
          description: product.body_html.replace(/<[^>]*>?/gm, ''),
          item: {
            id: variant.id,
            title: product.title,
            description: product.body_html.replace(/<[^>]*>?/gm, ''),
            link: `https://${SHOPIFY_DOMAIN}/products/${handle}`,
            image_link: product.image?.src,
            additional_image_link: product.images.slice(1).map((img) => img.src),
            availability: variant.available ? 'in stock' : 'out of stock',
            price: `${(variant.compare_at_price || variant.price)} ${variant.currency || 'EUR'}`,
            sale_price: variant.compare_at_price ? `${variant.price} EUR` : undefined,
            brand: 'AmoreTerra',
            gtin: variant.barcode,
            mpn: variant.sku,
            condition: 'new',
            google_product_category:
              'food, beverages & tobacco > food items > pasta & noodles',
            shipping_weight: `${variant.weight} ${variant.weight_unit}`,
            custom_label_0: getMetafield('custom', 'certificazioni'),
            custom_label_1: getMetafield('custom', 'valori_nutrizionali'),
            custom_label_2: getMetafield('custom', 'allergeni'),
            custom_label_3: getMetafield('custom', 'luogo_produzione'),
            custom_label_4: getMetafield('custom', 'gusto'),
          },
        },
      },
    });

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).send('Error generating feed');
  }
});

app.listen(PORT, () => {
  console.log(`Merchant feed server running on port ${PORT}`);
});

});

// Avvia il server in ascolto sulla porta specificata
app.listen(port, () => {
  console.log(`Server Feed attivo su http://localhost:${port}`);
});
