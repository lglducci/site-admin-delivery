 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmpresa } from "../context/EmpresaContext";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Contexto seguro (multiempresa preservado)
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
    try {
      const response = await fetch(
        "https://webhook.lglducci.com.br/webhook/avancar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numero }),
        }
      );
      const data = await response.json();
      console.log("✅ Avançado:", data);
      window.location.reload();
    } catch (err) {
      console.error("❌ Erro ao avançar pedido:", err);
    }
  };

  const handleSair = () => {
    localStorage.removeItem("token");
    limparEmpresaSafe();
    navigate("/");
  };

  const colunas = [
    { status: "recebido", titulo: "Recebido", cor: "bg-orange-50" },
    { status: "producao", titulo: "Produção", cor: "bg-orange-100" },
    { status: "entrega", titulo: "Entrega", cor: "bg-orange-200" },
    { status: "concluido", titulo: "Concluído", cor: "bg-gray-200" },
  ];

  if (!carregado) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <h2>Carregando informações da empresa...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white p-6">
      {/* 🔸 Cabeçalho */}
      <div className="flex justify-between items-center mb-6 bg-gray-950 shadow-lg rounded-xl p-4 border border-orange-500">
        <h1 className="text-2xl font-bold text-orange-400">
          Painel de {empresa?.nome || "Minha Pizzaria"}
        </h1>

        <div className="flex items-center gap-4">
          {/* ⚙️ Menu Suspenso */}
          <div className="relative">
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-3 py-2 rounded-lg font-semibold text-white transition-all"
            >
              ⚙️ Configurações
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-orange-500 shadow-lg rounded-lg p-2 z-50">
                <button
                  onClick={() =>
                    window.open(
                      "https://webhook.lglducci.com.br/webhook/config_empresa",
                      "_blank"
                    )
                  }
                  className="w-full text-left px-3 py-2 hover:bg-orange-600 rounded transition"
                >
                  🏢 Dados da Empresa
                </button>

                <button
                  onClick={() =>
                    window.open(
                      "https://webhook.lglducci.com.br/webhook/mensagem_padrao",
                      "_blank"
                    )
                  }
                  className="w-full text-left px-3 py-2 hover:bg-orange-600 rounded transition"
                >
                  💬 Mensagem Padrão
                </button>

                <button
                  onClick={() =>
                    window.open(
                      "https://webhook.lglducci.com.br/webhook/relatorios",
                      "_blank"
                    )
                  }
                  className="w-full text-left px-3 py-2 hover:bg-orange-600 rounded transition"
                >
                  📈 Relatórios
                </button>

                <button
                  onClick={() => window.open("/cardapio", "_self")}
                  className="w-full text-left px-3 py-2 hover:bg-orange-600 rounded transition"
                >
                  🍕 Cardápio
                </button>
              </div>
            )}
          </div>

          {/* 🔴 Botão de Sair */}
          <button
            onClick={handleSair}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition"
          >
            Sair
          </button>
        </div>
      </div>

      {/* 🔸 Colunas de Pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {colunas.map((coluna) => (
          <div
            key={coluna.status}
            className={`rounded-2xl shadow-lg p-4 ${coluna.cor} text-gray-900`}
          >
            <h2 className="text-lg font-bold mb-3 border-b border-orange-400 pb-1">
              {coluna.titulo}
            </h2>

            {pedidos
              .filter((p) => p.status === coluna.status)
              .map((p) => (
                <div
                  key={p.numero}
                  className="bg-white p-3 rounded-xl shadow-md mb-3 border border-gray-300 transition-all hover:shadow-lg hover:border-orange-400"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800">
                      nº {p.numero}
                    </span>
                    <span className="text-orange-500 font-bold">
                      R$ {p.valor.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{p.nomeCliente}</p>

                  <div className="flex justify-end">
                    <button
                      onClick={() => avancarPedido(p.numero)}
                      onTouchEnd={() => avancarPedido(p.numero)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 py-1 rounded-lg shadow transition-all"
                    >
                      ▶️ Avançar
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
