require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const generateFeed = require('./feed-generator');

app.get('/feed.xml', async (req, res) => {
  try {
    const xml = await generateFeed();
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Errore nella generazione del feed:', error);
    res.status(500).send('Errore nella generazione del feed');
  }
});

app.listen(port, () => {
  console.log(`Server Feed attivo su http://localhost:${port}`);
});
