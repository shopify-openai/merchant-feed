// feed-generator.js (CONGELATO TEMPORANEAMENTE)

/**
 * Questo file era previsto per la generazione del feed completo del catalogo.
 * Attualmente è disattivato perché la sincronizzazione viene gestita via endpoint singolo (/merchant/feed/:handle).
 * 
 * Quando il tracciamento del singolo prodotto sarà confermato, potrà essere riattivato
 * per generare l'intero feed in formato XML o JSON per Google Merchant Center.
 * 
 * ⚠️ NON COLLEGATO ad alcun job automatico.
 * ⚠️ NON UTILIZZATO da Render né da server.js.
 */

module.exports = async function generateFullFeed() {
  console.log("⚠️ feed-generator.js disattivato temporaneamente.");
  return null;
};
