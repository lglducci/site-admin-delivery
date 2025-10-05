 import React, { useEffect, useState } from "react";

export default function PedidoDetalhes() {
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState(null);

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

    const carregar = async () => {
      try {
        const resp = await fetch(
          `https://webhook.lglducci.com.br/webhook/pedido-html?numero=${numero}&id_empresa=${id_empresa}`
        );
        const data = await resp.json();
        if (!Array.isArray(data) || !data.length)
          throw new Error("Nenhum dado retornado.");
        setPedido(data[0]);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar detalhes do pedido.");
      }
    };

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
      <div className="flex justify-center items-center h-screen text-gray-600">
        Carregando detalhes do pedido...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white p-6 flex justify-center items-center">
      <div className="bg-gray-950 shadow-xl rounded-2xl p-6 w-full max-w-3xl border border-orange-400">
        <h1 className="text-2xl font-bold text-orange-400 mb-4">
          📦 Pedido nº {pedido.resumo?.match(/nº (\d+)/)?.[1] || "?"}
        </h1>

        <div className="bg-gray-800 rounded-lg p-4 mb-4 whitespace-pre-wrap text-gray-200">
          {pedido.resumo || "Sem resumo disponível."}
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
              Total:{" "}
              {pedido.resumo?.match(/Total: R\$ ([\d.,]+)/)?.[1] || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
