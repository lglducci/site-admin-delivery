 import React, { useEffect, useMemo, useState } from "react";

/* Util: carrega empresa do localStorage de forma segura */
function getEmpresaSafe() {
  try {
    return JSON.parse(localStorage.getItem("empresa") || "{}");
  } catch {
    return {};
  }
}

/* Modal simples */
function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[92vw] max-w-3xl max-h-[86vh] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl">
        <div className="px-5 py-4 border-b border-zinc-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-yellow-400">{title}</h3>
          <button
            onClick={onClose}
            className="text-sm px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700"
          >
            Fechar
          </button>
        </div>
        <div className="p-5 overflow-auto max-h-[65vh]">{children}</div>
        {footer ? (
          <div className="px-5 py-4 border-t border-zinc-700 bg-zinc-950">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

export default function KdsView() {
  const empresa = getEmpresaSafe();
  const idEmpresa = empresa?.id_empresa;

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Modal Visualizar
  const [openView, setOpenView] = useState(false);
  const [viewNumero, setViewNumero] = useState(null);
  const [viewData, setViewData] = useState({ items: [], total: null });

  const normalizaStatus = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  const filtroKDS = (lista) =>
    (Array.isArray(lista) ? lista : []).filter((p) => {
      const s = normalizaStatus(p.status);
      // cozinha vê Recebido + Em preparo/Producao
      return ["recebido", "em preparo", "producao"].includes(s);
    });

  const resumoItens = (p) => {
    // se backend já manda um resumo, usa; senão tenta sintetizar
    if (p.resumo_itens) return p.resumo_itens;
    const txt = (p.itens || "")
      .toString()
      .toLowerCase();
    const pizzas = (txt.match(/pizza/g) || []).length;
    const bebidas = (txt.match(/coca|refri|bebida|guarana|fanta|sprite/g) || []).length;
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
    const t = setInterval(carregarPedidos, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEmpresa]);

  const avancarPedido = async (numero) => {
    if (!idEmpresa) return;
    // confirmação de segurança
    const ok = window.confirm(`Confirmar avanço do pedido nº ${numero}?`);
    if (!ok) return;

    try {
      const resp = await fetch("https://webhook.lglducci.com.br/webhook/avancar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, id_empresa: idEmpresa }),
      });
      // se backend devolver erro, mostra
      if (!resp.ok) {
        let data = null;
        try {
          data = await resp.json();
        } catch {}
        console.error("Falha ao avançar:", resp.status, data);
        alert("Falha ao avançar o pedido.");
        return;
      }
      // feedback otimista: remove o card
      setPedidos((prev) => prev.filter((p) => p.numero !== numero));
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

  const abrirVisualizar = async (numero) => {
    if (!idEmpresa) return;
    setViewNumero(numero);
    setOpenView(true);
    setViewData({ items: [], total: null });

    // consome seu webhook “visualizarcozinha”
    try {
      const url = `https://webhook.lglducci.com.br/webhook/visualizarcozinha?numero=${encodeURIComponent(
        numero
      )}&id_empresa=${encodeURIComponent(idEmpresa)}`;
      const resp = await fetch(url);
      const data = await resp.json();
      // aceita tanto {items:[...], total:...} quanto array “cru”
      if (Array.isArray(data)) {
        setViewData({ items: data, total: null });
      } else {
        setViewData({
          items: Array.isArray(data?.items) ? data.items : [],
          total: data?.total ?? null,
        });
      }
    } catch (e) {
      console.error("Erro ao visualizar pedido:", e);
    }
  };

  // agrupa itens por pizza (pai) – só para exibir organizado no modal
  const gruposModal = useMemo(() => {
    const items = viewData.items || [];
    const pais = [];
    const filhos = [];
    for (const it of items) {
      if (it?.numero_pai || it?.nome_pai) filhos.push(it);
      else pais.push(it);
    }
    const mapa = new Map();
    for (const p of pais) {
      mapa.set(p.numero, { pai: p, filhos: [] });
    }
    for (const f of filhos) {
      const key = f.numero_pai ?? f.pai_numero ?? -9999;
      if (!mapa.has(key)) mapa.set(key, { pai: null, filhos: [] });
      mapa.get(key).filhos.push(f);
    }
    return Array.from(mapa.values());
  }, [viewData]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Cabeçalho */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🍳</div>
          <div>
            <h1 className="text-3xl font-extrabold text-yellow-400">KDS - Cozinha</h1>
            <p className="text-sm text-gray-400">
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
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold"
            title="Enviar todos os 'Recebidos' para Produção"
          >
            ⚡ Requisitar pedidos recebidos
          </button>
          <button
            onClick={carregarPedidos}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-semibold"
            title="Atualizar"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Mensagens de estado */}
      <div className="max-w-7xl mx-auto mt-4">
        {erro && (
          <div className="mb-3 rounded-xl bg-red-900/60 text-red-200 px-4 py-2">
            {erro}
          </div>
        )}
      </div>

      {/* Grid de pedidos */}
      <div className="max-w-7xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pedidos.length === 0 ? (
          <p className="text-center text-gray-400 col-span-full">
            {loading ? "Carregando pedidos..." : "Nenhum pedido em preparo 🍕"}
          </p>
        ) : (
          pedidos.map((p) => (
            <div
              key={p.numero}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-xl flex flex-col"
            >
              <div className="mb-3">
                <h2 className="text-2xl font-extrabold text-yellow-400">
                  Pedido nº {p.numero ?? "—"}
                </h2>
                <div className="text-sm text-gray-400 mt-1">
                  {(() => {
                    const s = normalizaStatus(p.status);
                    if (s === "recebido") return "🟧 Recebido";
                    if (s === "producao" || s === "em preparo") return "🟦 Em preparo";
                    return p.status || "—";
                  })()}
                </div>
                <div className="text-base text-gray-300 mt-2">{resumoItens(p)}</div>
                <div className="text-sm text-gray-400 mt-1">
                  💰{" "}
                  {p.valor != null
                    ? `R$ ${Number(p.valor).toFixed(2)}`
                    : "—"}
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <button
                  onClick={() => abrirVisualizar(p.numero)}
                  className="py-3 rounded-xl bg-amber-600 hover:bg-amber-700 font-bold"
                >
                  🟧 Visualizar
                </button>
                <button
                  onClick={() => avancarPedido(p.numero)}
                  className="py-3 rounded-xl bg-green-600 hover:bg-green-700 font-bold"
                >
                  🟩 Avançar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Visualizar */}
      <Modal
        open={openView}
        title={viewNumero ? `Pedido nº ${viewNumero}` : "Pedido"}
        onClose={() => setOpenView(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setOpenView(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700"
            >
              Fechar
            </button>
            {viewNumero ? (
              <button
                onClick={() => {
                  setOpenView(false);
                  avancarPedido(viewNumero);
                }}
                className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 font-semibold"
              >
                Avançar
              </button>
            ) : null}
          </div>
        }
      >
        {/* Lista de itens agrupada (pai + filhos) */}
        {gruposModal.length === 0 ? (
          <p className="text-gray-400">Sem itens para exibir.</p>
        ) : (
          <div className="space-y-4">
            {gruposModal.map(({ pai, filhos }, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-700 bg-zinc-950 p-3"
              >
                {pai ? (
                  <div className="mb-2">
                    <div className="text-yellow-300 font-bold text-lg">
                      {(pai.categoria || "").toLowerCase().includes("pizza") ? "🍕 " : ""}
                      {pai.nome || "Item"}{" "}
                      {pai.tamanho ? `(${pai.tamanho})` : ""}
                      {pai.quantidade > 1 ? ` • ${pai.quantidade} un.` : ""}
                    </div>
                    {pai.observacao ? (
                      <div className="text-sm text-gray-400 mt-1">
                        {pai.observacao}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {filhos?.length ? (
                  <div className="space-y-1">
                    {filhos.map((f, i) => (
                      <div key={i} className="text-gray-300 text-sm">
                        • {f.categoria ? `[${f.categoria}] ` : ""}
                        {f.nome}
                        {f.tamanho ? ` (${f.tamanho})` : ""}
                        {f.quantidade > 1 ? ` • ${f.quantidade} un.` : ""}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {viewData?.total != null ? (
          <div className="mt-4 text-right text-gray-200">
            💰 Total:{" "}
            <span className="font-bold">
              R$ {Number(viewData.total).toFixed(2)}
            </span>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
