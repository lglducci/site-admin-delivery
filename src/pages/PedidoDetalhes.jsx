 import React, { useEffect, useState } from "react";

export default function PedidoDetalhes() {
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const numero = params.get("numero");
    const id_empresa =
      localStorage.getItem("id_empresa") ||
      JSON.parse(localStorage.getItem("empresa") || "{}")?.id_empresa ||
      0;

    if (!numero || !id_empresa) {
      setErro("Pedido ou empresa não informados.");
      return;
    }

    async function carregar() {
      try {
        const r = await fetch(
          `https://webhook.lglducci.com.br/webhook/pedido-html?numero=${numero}&id_empresa=${id_empresa}`
        );
        const data = await r.json();
        if (!data || !data.length) throw new Error("Nada encontrado");
        setPedido(data[0]);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar detalhes.");
      }
    }

    carregar();
  }, []);

  if (erro)
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-bold text-lg">
        {erro}
      </div>
    );

  if (!pedido)
    return (
      <div className="flex justify-center items-center h-screen text-gray-300">
        Carregando detalhes do pedido...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white p-6 flex justify-center items-center">
      <div className="bg-gray-950 p-6 rounded-2xl shadow-xl border border-orange-500 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-orange-400 mb-4">
          Pedido nº {pedido.resumo?.match(/nº (\d+)/)?.[1] || "?"}
        </h1>

        <div className="bg-gray-800 rounded-lg p-4 mb-4 text-gray-100 whitespace-pre-wrap">
          {pedido.resumo}
        </div>

        <div className="grid grid-cols-2 gap-6 border-t border-gray-700 pt-4 text-sm">
          <div>
            <h3 className="font-semibold text-orange-400 mb-1">🏠 Endereço</h3>
            <p>{pedido.endereço || "—"}</p>
            <p>{pedido.bairro || ""}</p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-400 mb-1">
              💳 Pagamento & Entrega
            </h3>
            <p>Forma: {pedido.tipo_cobranca || "—"}</p>
            <p>
              Total: {pedido.resumo?.match(/Total: R\$ ([\d.,]+)/)?.[1] || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
