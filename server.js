// Carica le variabili da .env (es. SHOPIFY_STORE, SHOPIFY_ACCESS_TOKEN_FEED)
require('dotenv').config();

// Inizializza Express
const express = require('express');
const app = express();

// Imposta la porta (di default 3000 se non è definita nel .env)
const port = process.env.PORT || 3000;

// Importa la funzione per generare il feed XML (si aspetta che tu abbia un file feed-generator.js)
const generateFeed = require('./feed-generator');

// Endpoint principale che serve il feed XML
app.get('/feed.xml', async (req, res) => {
  try {
    // Genera il contenuto XML
    const xml = await generateFeed();

    // Imposta l’header corretto per file XML
    res.set('Content-Type', 'application/xml');

    // Risponde con il contenuto del feed
    res.send(xml);
  } catch (error) {
    // In caso di errore, logga a console e restituisce errore 500
    console.error('Errore nella generazione del feed:', error);
    res.status(500).send('Errore nella generazione del feed');
  }
});

// Avvia il server in ascolto sulla porta specificata
app.listen(port, () => {
  console.log(`Server Feed attivo su http://localhost:${port}`);
});
