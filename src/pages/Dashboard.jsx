  import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PedidoCard from "../components/PedidoCard";
import { useEmpresa } from "../context/EmpresaContext";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate();

  // contexto seguro
  let empresa = null;
  let limparEmpresaSafe = () => {};
  try {
    const ctx = useEmpresa();
    if (ctx?.empresa) empresa = ctx.empresa;
    if (ctx?.limparEmpresa) limparEmpresaSafe = ctx.limparEmpresa;
  } catch (e) {
    console.warn("Contexto da empresa ainda não carregado (seguro)");
  }

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch("https://webhook.lglducci.com.br/webhook/pedidos");
        const data = await response.json();

        const lista = Array.isArray(data) ? data : [];
        const pedidosAdaptados = lista.map((p) => ({
          numero: p.numero ?? p.pedido_id,
          status: p.status?.toLowerCase() ?? "recebido",
          nomeCliente: p.nomeCliente ?? p.nome ?? "Cliente",
          valor: Number(p.valor ?? 0),
          data: p.data ?? p.create_at ?? new Date().toISOString(),
        }));

        setPedidos(pedidosAdaptados);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };

    fetchPedidos();
  }, []);

  const avancarPedido = async (numero) => {
    await fetch("https://webhook.lglducci.com.br/webhook/avancar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero }),
    });
    window.location.reload();
  };

  const formatarValor = (valor) =>
    valor?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const colunas = [
    { status: "recebido", titulo: "Recebido", cor: "bg-blue-100" },
    { status: "producao", titulo: "Produção", cor: "bg-yellow-100" },
    { status: "entrega", titulo: "Entrega", cor: "bg-green-100" },
    { status: "concluido", titulo: "Concluído", cor: "bg-gray-100" },
  ];

  const handleSair = () => {
    localStorage.removeItem("token");
    limparEmpresaSafe();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {empresa ? `Painel de ${empresa.nome}` : "Painel de Pedidos"}
        </h1>
        <button
          onClick={handleSair}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {colunas.map((coluna) => (
          <div
            key={coluna.status}
            className={`${coluna.cor} dark:bg-gray-800 p-4 rounded shadow`}
          >
            <h2 className="text-lg font-semibold mb-2">{coluna.titulo}</h2>
            {pedidos
              .filter((p) => p.status === coluna.status)
              .map((p) => (
                <PedidoCard key={p.numero} pedido={p} onAvancar={avancarPedido} />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
