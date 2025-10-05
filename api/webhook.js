 export default async function handler(req, res) {
  const { rota = "cardapio", id_empresa = 2 } = req.query;
  const url = `https://webhook.lglducci.com.br/webhook/${rota}?id_empresa=${id_empresa}`;

  try {
    const r = await fetch(url);
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
