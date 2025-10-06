export default async function handler(req, res) {
  const { numero, id_empresa } = req.query;

  try {
    const r = await fetch(
      `https://webhook.lglducci.com.br/webhook/pedido_detalhado?numero=${numero}&id_empresa=${id_empresa}`
    );

    const data = await r.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);
  } catch (e) {
    console.error("Erro API proxy pedido_detalhado
