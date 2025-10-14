 import React, { useEffect, useState } from "react";

export default function KdsView() {
  const [pedidos, setPedidos] = useState([]);
  const empresaData = JSON.parse(localStorage.getItem("empresa") || "{}");
  const idEmpresa = empresaData?.id_empresa;

  useEffect(() => {
    if (!idEmpresa) return;

    const fetchPedidos = async () => {
      try {
        const resp = await fetch(
          `https://webhook.lglducci.com.br/webhook/pedidos?id_empresa=${encodeURIComponent(idEmpresa)}`
        );
        const data = await resp.json();
        const emProducao = (Array.isArray(data) ? data : []).filter((p) => {
          const s = (p.status || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
          return ["producao", "em preparo", "recebido"].includes(s);
        });
        setPedidos(emProducao);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
      }
    };

    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, [idEmpresa]);

  const avancarPedido = async (numero) => {
    try {
      await fetch("https://webhook.lglducci.com.br/webhook/pedido_avancar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, id_empresa: idEmpresa }),
      });
      setPedidos((prev) => prev.filter((p) => p.numero !== numero));
    } catch (err) {
      console.error("Erro ao avançar pedido:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-1 text-center text-yellow-400">🍳 KDS - Cozinha</h1>
      <p className="text-center text-sm text-gray-400 mb-6">
        Empresa: {empresaData?.nome_empresa} (ID {idEmpresa})
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pedidos.length === 0 ? (
          <p className="text-center text-gray-400 col-span-full">Nenhum pedido em preparo 🍕</p>
        ) : (
          pedidos.map((p) => (
            <div
              key={p.numero}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-xl flex flex-col justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  Pedido nº{" "}
                  <a
                    href={`https://webhook.lglducci.com.br/webhook/detalhes?numero=${p.numero}&id_empresa=${idEmpresa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-yellow-300 hover:text-yellow-200"
                  >
                    {p.numero}
                  </a>
                </h2>
                <p className="text-gray-300 mt-1 font-medium">{p.nome_cliente || "Cliente"}</p>
                <p className="mt-3 text-sm text-gray-400 whitespace-pre-line">
                  {p.itens || "Sem descrição de itens"}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  💰 {p.valor ? `R$ ${Number(p.valor).toFixed(2)}` : ""}
                </p>
              </div>

              <button
                onClick={() => avancarPedido(p.numero)}
                className="bg-green-600 hover:bg-green-700 text-white w-full py-3 mt-4 rounded-xl font-bold text-lg transition"
              >
                ➡️ Avançar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
