const axios = require('axios');

module.exports = async function generateFeed() {
  const shop = process.env.SHOPIFY_STORE;
  const token = process.env.SHOPIFY_ACCESS_TOKEN_FEED;

  const url = `https://${shop}/admin/api/2023-10/products.json?status=active&published_status=published`;
  const headers = {
    'X-Shopify-Access-Token': token,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.get(url, { headers });
    const products = response.data.products;

    // Costruzione XML minimale (da migliorare)
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>AmoreTerra Feed</title>
<link>https://amoreterra.com</link>
<description>Feed prodotti AmoreTerra</description>
`;

    for (const product of products) {
      const variant = product.variants[0];
      xml += `
<item>
  <g:id>${variant.id}</g:id>
  <g:title><![CDATA[${product.title}]]></g:title>
  <g:description><![CDATA[${product.body_html || 'Descrizione non disponibile'}]]></g:description>
  <g:link>https://amoreterra.com/products/${product.handle}</g:link>
  <g:image_link>${product.image?.src || ''}</g:image_link>
  <g:price>${variant.price} EUR</g:price>
  <g:availability>${variant.available ? 'in stock' : 'out of stock'}</g:availability>
  <g:condition>new</g:condition>
</item>`;
    }

    xml += `</channel>\n</rss>`;
    return xml;

  } catch (error) {
    console.error('Errore nella richiesta Shopify:', error);
    throw error;
  }
};
