 export default async function handler(req, res) {
  const { numero, id_empresa } = req.query;

  try {
    // 🔄 Faz a requisição ao seu webhook real
    const r = await fetch(
      `https://webhook.lglducci.com.br/webhook/pedido_detalhado?numero=${numero}&id_empresa=${id_empresa}`
    );

    if (!r.ok) {
      console.error("Erro no webhook:", r.status);
      return res.status(r.status).json({ error: "Falha no webhook remoto" });
    }

    const data = await r.json();

    // ✅ Permite requisições de qualquer origem (resolve CORS)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    return res.status(200).json(data);
  } catch (e) {
    console.error("Erro API proxy pedido_detalhado:", e);
    return res.status(500).json({ error: "Erro interno ao buscar pedido" });
  }
}
