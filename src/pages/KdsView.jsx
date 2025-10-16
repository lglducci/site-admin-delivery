 import React, { useEffect, useMemo, useState } from "react";
import ModalVisualizar from "./ModalVisualizar";

function getEmpresaSafe() {
  try {
    return JSON.parse(localStorage.getItem("empresa") || "{}");
  } catch {
    return {};
  }
} 

export default function KdsView() {
  const empresa = getEmpresaSafe();
  const idEmpresa = empresa?.id_empresa;

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // modal
  const [openView, setOpenView] = useState(false);
  const [viewNumero, setViewNumero] = useState(null);

  const normalizaStatus = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  const filtroKDS = (lista) =>
    (Array.isArray(lista) ? lista : []).filter((p) => {
      const s = normalizaStatus(p.status);
      return ["recebido", "em preparo", "producao"].includes(s);
    });

  const resumoItens = (p) => {
    if (p.resumo_itens) return p.resumo_itens;
    const txt = (p.itens || "").toString().toLowerCase();
    const pizzas = (txt.match(/pizza/g) || []).length;
    const bebidas =
      (txt.match(/coca|refri|bebida|guarana|fanta|sprite/g) || []).length;
    const partes = [];
    if (pizzas) partes.push(`🍕 ${pizzas} pizza${pizzas > 1 ? "s" : ""}`);
    if (bebidas) partes.push(`🧃 ${bebidas} bebida${bebidas > 1 ? "s" : ""}`);
    return partes.join("  •  ") || "Sem descrição de itens";
  };

  const carregarPedidos = async () => {
    if (!idEmpresa) {
      setErro("Sem empresa no contexto. Faça login novamente.");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(
        `https://webhook.lglducci.com.br/webhook/pedidos?id_empresa=${encodeURIComponent(
          idEmpresa
        )}`
      );
      const data = await resp.json();
      setPedidos(filtroKDS(data));
      setLastUpdated(new Date());
      setErro("");
    } catch (e) {
      console.error(e);
      setErro("Falha ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();                       
    const t = setInterval(carregarPedidos, 100000);
    return () => clearInterval(t);
  }, [idEmpresa]);

  const avancarPedido = async (numero) => {
    if (!idEmpresa) return;
    const ok = window.confirm(`Confirmar avanço do pedido nº ${numero}?`);
    if (!ok) return;

    try {
      const resp = await fetch(
        "https://webhook.lglducci.com.br/webhook/avancar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numero, id_empresa: idEmpresa }),
        }
      );
      if (!resp.ok) {
        let data = null;
        try {
          data = await resp.json();
        } catch {}
        console.error("Falha ao avançar:", resp.status, data);
        alert("Falha ao avançar o pedido.");
        return;
      }
      // remove da UI após avançar
      setPedidos((prev) => prev.filter((p) => (p.numero ?? p.pedido_id) !== numero));
    } catch (e) {
      console.error(e);
      alert("Erro ao avançar pedido!");
    }
  };

  const requisitarTodos = async () => {
    if (!idEmpresa) return;
    const ok = window.confirm(
      "Enviar TODOS os pedidos RECEBIDOS para PRODUÇÃO agora?"
    );
    if (!ok) return;
    try {
      const resp = await fetch(
        "https://webhook.lglducci.com.br/webhook/avancar_todos",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_empresa: idEmpresa, destino: "producao" }),
        }
      );
      if (!resp.ok) {
        alert("Falha ao requisitar pedidos.");
        return;
      }
      await carregarPedidos();
      alert("✅ Pedidos requisitados para produção!");
    } catch (e) {
      console.error(e);
      alert("Erro ao requisitar pedidos.");
    }
  };

  const abrirVisualizar = (numero) => {
    setViewNumero(numero);
    setOpenView(true);
  };

  const tituloCor = { color: "#ff9f43" };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "#091219" }}>
      {/* container com borda alaranjada leve */}
      <div
        className="max-w-7xl mx-auto rounded-2xl border p-4 md:p-6"
        style={{ borderColor: "rgba(255,159,67,0.6)", backgroundColor: "#1b1e25" }}
      >
        {/* cabeçalho */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🍳</div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold" style={tituloCor}>
                KDS - Cozinha
              </h1>
              <p className="text-xs md:text-sm text-gray-300">
                Empresa: {empresa?.nome_empresa || "—"} (ID {idEmpresa || "—"}) •{" "}
                {lastUpdated
                  ? `Atualizado às ${lastUpdated.toLocaleTimeString()}`
                  : "Carregando..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={requisitarTodos}
              className="px-3 py-1.5 rounded-md text-xs md:text-sm transition-colors"
              style={{ backgroundColor: "#ff9f43", color: "#1b1e25" }}
              title="Enviar todos os 'Recebidos' para Produção"
            >
              ⚡ Requisitar pedidos recebidos
            </button>
            <button
              onClick={carregarPedidos}
              className="px-3 py-1.5 rounded-md text-xs md:text-sm transition-colors"
              style={{ backgroundColor: "#2a2f39", color: "#e5e7eb" }}
              title="Atualizar"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>

        {/* mensagens */}
        {erro ? (
          <div className="mt-4 rounded-lg px-3 py-2 text-sm"
               style={{ backgroundColor: "#3b1f1f", color: "#fca5a5" }}>
            {erro}
          </div>
        ) : null}

        {/* grid de pedidos */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidos.length === 0 ? (
            <p className="text-center text-gray-300 col-span-full">
              {loading ? "Carregando pedidos..." : "Nenhum pedido em preparo 🍕"}
            </p>
          ) : (
            pedidos.map((p) => {
              const numero = p.numero ?? p.pedido_id ?? "—";
              const s = normalizaStatus(p.status);
              const statusText =
                s === "recebido" ? "🟠 Recebido" :
                s === "producao" || s === "em preparo" ? "🔵 Em preparo" :
                p.status || "—";

              return (
                <div
                  key={numero}
                  className="rounded-xl p-4 border transition-shadow"
                  style={{
                    backgroundColor: "#151a23",
                    borderColor: "rgba(255,159,67,0.2)",
                    boxShadow: "0 0 10px rgba(255,159,67,0.10)",
                  }}
                >
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold" style={tituloCor}>
                      Pedido nº {numero}
                    </h2>
                    <div className="text-xs text-gray-300 mt-0.5">{statusText}</div>
                  </div>

                  <div className="text-sm text-gray-200 mt-2">{resumoItens(p)}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    💰 {p.valor != null ? `R$ ${Number(p.valor).toFixed(2)}` : "—"}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => abrirVisualizar(numero)}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                      style={{ backgroundColor: "#ff9f43", color: "#1b1e25" }}
                    >
                      Visualizar
                    </button>
                    <button
                      onClick={() => avancarPedido(numero)}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                      style={{ backgroundColor: "#22c55e", color: "#0b1118" }}
                    >
                      Avançar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* modal */}
      <ModalVisualizar
        open={openView}
        onClose={() => setOpenView(false)}
        numero={viewNumero}
        idEmpresa={idEmpresa}
      />
    </div>
  );
}
