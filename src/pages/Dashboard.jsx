 import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import PedidoCard from "../components/PedidoCard";
import { useEmpresa } from "../context/EmpresaContext";

 


export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate();
   const [open, setOpen] = useState(false);

  // contexto seguro
  let empresa = null;
  let limparEmpresaSafe = () => {};
  let carregado = false;

  try {
    const ctx = useEmpresa();
    if (ctx?.empresa) empresa = ctx.empresa;
    if (ctx?.limparEmpresa) limparEmpresaSafe = ctx.limparEmpresa;
    if (ctx?.carregado) carregado = ctx.carregado;
  } catch (e) {
    console.warn("Contexto ainda não carregado (seguro)");
  }

  // 👇 carrega pedidos só depois que o contexto estiver pronto
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        if (!carregado) return;

        const empresaId =
          (empresa && empresa.id_empresa) ||
          localStorage.getItem("id_empresa");

        if (!empresaId) {
          console.warn("Nenhum id_empresa disponível ainda");
          return;
        }

        console.log("🔎 Buscando pedidos da empresa:", empresaId);

        const response = await fetch(
          `https://webhook.lglducci.com.br/webhook/pedidos?id_empresa=${empresaId}`
        );
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
  }, [empresa, carregado]);

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

  // enquanto não carregar, mostra aviso
  if (!carregado) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <h2>Carregando informações da empresa...</h2>
      </div>
    );
  }
 
return (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
    {/* 🔹 Cabeçalho com Menu Suspenso */}
    <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Painel de {empresa?.nome || "Minha Pizzaria"}
      </h1>

      <div className="flex items-center gap-4">
        {/* Menu Suspenso ⚙️ */}
        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            ⚙️ Configurações
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 border dark:border-gray-700 z-50">
              <button
                onClick={() =>
                  window.open("https://webhook.lglducci.com.br/webhook/config_empresa", "_blank")
                }
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                🏢 Dados da Empresa
              </button>

              <button
                onClick={() =>
                  window.open("https://webhook.lglducci.com.br/webhook/mensagem_padrao", "_blank")
                }
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                💬 Mensagem Padrão
              </button>

              <button
                onClick={() =>
                  window.open("https://webhook.lglducci.com.br/webhook/relatorios", "_blank")
                }
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                📈 Relatórios
              </button>
            </div>
          )}
        </div>

        {/* Botão de Sair */}
        <button
          onClick={handleSair}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Sair
        </button>
      </div>
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
                <PedidoCard
                  key={p.numero}
                  pedido={p}
                  onAvancar={avancarPedido}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
