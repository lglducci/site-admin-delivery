 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
     //   const response = await fetch("https://n8n.lglducci.com.br/webhook-test/pedidos");
         const response = await fetch("https://webhook.lglducci.com.br/webhook/pedidos");
        
        const data = await response.json();

        // Adapta os campos do webhook para o front
        const pedidosAdaptados = data.map((p) => ({
          numero: p.pedido_id,
          status: p.status,
          nomeCliente: p.nome,
          valor: p.valor,
          data: p.create_at,
        }));

        setPedidos(pedidosAdaptados);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };

    fetchPedidos();
  }, []);

  const avancarPedido = async (numero) => {
    await fetch("https://n8n.lglducci.com.br/webhook-test/avancar-pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero }),
    });
    window.location.reload();
  };

  const formatarValor = (valor) =>
    valor?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatarData = (data) =>
    new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  const colunas = ["Recebido", "Produção", "Entrega", "Concluído"];

  const handleSair = () => {
    localStorage.removeItem("token"); // se estiver usando token
    navigate("/login"); // redireciona pra tela de login
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Painel de Pedidos</h1>
        <button
          onClick={handleSair}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {colunas.map((status) => (
          <div key={status} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">{status}</h2>
            {pedidos
              .filter((p) => p.status.toLowerCase() === status.toLowerCase())
              .map((p) => (
                <div
                  key={p.numero}
                  className="bg-gray-100 dark:bg-gray-700 p-2 rounded mb-2 text-sm"
                >
                  <p>
                    <strong>#{p.numero}</strong> - {p.nomeCliente}
                  </p>
                  <p>
                    {formatarValor(p.valor)} | {formatarData(p.data)}
                  </p>
                  <button
                    className="mt-1 text-xs text-blue-400 hover:underline"
                    onClick={() => avancarPedido(p.numero)}
                  >
                    Avançar →
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
