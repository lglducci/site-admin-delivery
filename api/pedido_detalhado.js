 // /api/pedido_detalhado.js

export default async function handler(req, res) {
  const { numero, id_empresa } = req.query;

  if (!numero || !id_empresa) {
    return res.status(400).json({ error: "Parâmetros inválidos" });
  }

  try {
    const url = `https://webhook.lglducci.com.br/webhook/pedido_detalhado?numero=${numero}&id_empresa=${id_empresa}`;
    const resposta = await fetch(url);

    if (!resposta.ok) {
      return res.status(resposta.status).json({ error: "Falha ao buscar pedido" });
    }

    const data = await resposta.json();

    // Libera acesso de qualquer origem (CORS resolvido)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro no proxy pedido_detalhado:", error);
    return res.status(500).json({ error: "Erro interno do proxy" });
  }
}
