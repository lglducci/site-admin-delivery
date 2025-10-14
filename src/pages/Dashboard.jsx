 import React, { useEffect, useMemo, useState } from "react";
import ModalVisualizar from "./ModalVisualizar"; // <-- usa o modal que você já tem

/* 🎨 Tema: 🍕 Clássico Pizzaria (quente e moderno) */
const THEME = {
  // Fundo geral (gradiente suave)
  bgFrom: "#18110e",
  bgVia:  "#221a14",
  bgTo:   "#2a2118",
  // Cores estrutura
  panelBg: "#13161b",               // cabeçalho
  panelBorder: "rgba(255,159,67,0.55)", // #ff9f43 translúcido
  title: "#ff9f43",
  text: "#e5e7eb",
  textMuted: "#9ca3af",
  // Botões
  btnDark: "#2a2f39",
  btnDarkText: "#e5e7eb",
  btnOrange: "#ff9f43",
  btnOrangeText: "#1b1e25",
  // Cartões de pedido
  cardBg: "#1c1612",
  cardBorder: "rgba(211,124,63,0.30)", // laranja queimado sutil
};
 


  const colunas = [
    { status: "recebido",  titulo: "Recebido",  cls: "bg-[#1f1a16] text-amber-300" },
    { status: "producao",  titulo: "Produção",  cls: "bg-[#262018] text-amber-300" },
    { status: "entrega",   titulo: "Entrega",   cls: "bg-[#2e251b] text-amber-300" },
    { status: "concluido", titulo: "Concluído", cls: "bg-[#181410] text-amber-300" },
  ];

/* util: empresa do localStorage */
function getEmpresaSafe() {
  try { return JSON.parse(localStorage.getItem("empresa") || "{}"); } catch { return {}; }
}

/* normaliza status */
const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function Dashboard() {
  const empresa = getEmpresaSafe();
  const idEmpresa = empresa?.id_empresa ?? empresa?.idEmpresa ?? localStorage.getItem("id_empresa");

  const [pedidos, setPedidos] = useState([]);
  const [erro, setErro] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Modal visualizar
  const [openView, setOpenView] = useState(false);
  const [viewNumero, setViewNumero] = useState(null);

  const carregar = async () => {
    const id = Number(idEmpresa);
    if (!id || Number.isNaN(id)) {
      setErro("Sem empresa no contexto. Faça login novamente.");
      return;
    }
    try {
      const resp = await fetch(
        `https://webhook.lglducci.com.br/webhook/pedidos?id_empresa=${encodeURIComponent(id)}`
      );
      const data = await resp.json();
      setPedidos(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      setErro("");
    } catch (e) {
      console.error(e);
      setErro("Falha ao carregar pedidos.");
    }
  };

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 5000);
    return () => clearInterval(t);
  }, [idEmpresa]);

  const avancar = async (numero) => {
    const id = Number(idEmpresa);
    if (!id || Number.isNaN(id)) {
      alert("Empresa não identificada. Abra o cardápio/logue novamente.");
      return;
    }
    const ok = window.confirm(`Avançar o pedido nº ${numero}?`);
    if (!ok) return;
    try {
      const resp = await fetch("https://webhook.lglducci.com.br/webhook/avancar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, id_empresa: id }),
      });
      if (!resp.ok) {
        let d = null; try { d = await resp.json(); } catch {}
        console.error("Falha ao avançar:", resp.status, d);
        alert("Falha ao avançar o pedido.");
        return;
      }
      // otimismo: remove local, sem esperar reload
      setPedidos((prev) => prev.filter((p) => (p.numero ?? p.pedido_id) !== numero));
    } catch (e) {
      console.error(e);
      alert("Erro ao avançar pedido!");
    }
  };

  /* agrupamentos */
  const grupos = useMemo(() => {
    const r = [], pr = [], e = [], c = [];
    for (const p of pedidos) {
      const s = norm(p.status);
      if (s === "recebido") r.push(p);
      else if (s === "producao" || s === "em preparo") pr.push(p);
      else if (s === "entrega" || s === "pronto") e.push(p);
      else if (s === "concluido" || s === "concluído") c.push(p);
    }
    return { r, pr, e, c };
  }, [pedidos]);

  /* card de pedido */
  const PedidoItem = ({ p }) => {
    const numero = p.numero ?? p.pedido_id ?? "—";
    return (
      <div
        className="rounded-xl p-3 md:p-4 border shadow-md mb-3 transition-all"
        style={{ background: THEME.cardBg, borderColor: THEME.cardBorder }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {/* número clicável -> abre modal */}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setViewNumero(numero); setOpenView(true); }}
                className="text-base md:text-lg font-semibold underline-offset-4 hover:underline transition-colors"
                style={{ color: THEME.title }}
                title={`Visualizar pedido nº ${numero}`}
              >
                nº {numero}
              </a>
              <span
                className="text-[11px] md:text-xs px-2 py-0.5 rounded-md"
                style={{ background: THEME.btnDark, color: THEME.btnDarkText, opacity: 0.9 }}
              >
                {p.status}
              </span>
            </div>
            <div className="text-xs md:text-sm mt-1" style={{ color: THEME.textMuted }}>
              {p.nome_cliente || p.nomeCliente || p.cliente || "—"}
            </div>
          </div>
          <div className="text-sm font-semibold whitespace-nowrap" style={{ color: THEME.text }}>
            {p.valor != null ? `R$ ${Number(p.valor).toFixed(2)}` : "—"}
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={() => avancar(numero)}
            className="px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-colors"
            style={{ background: THEME.btnOrange, color: THEME.btnOrangeText }}
          >
            ▶ Avançar
          </button>
        </div>
      </div>
    );
  };

  /* coluna */
  const Coluna = ({ titulo, items, cls }) => (
    <div className={`rounded-2xl p-4 md:p-5 ring-1 ring-[#d37c3f]/30 ${cls}`}>
      <div className="pb-3 mb-3 border-b border-[#d37c3f]/60">
        <h2 className="text-lg md:text-xl font-semibold">{titulo}</h2>
      </div>
      {items.length === 0 ? (
        <div className="text-sm opacity-90">Nenhum pedido</div>
      ) : (
        items.map((p) => <PedidoItem key={p.numero ?? p.pedido_id} p={p} />)
      )}
    </div>
  );

  /* sair */
  const sair = () => {
    localStorage.removeItem("empresa");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    window.location.href = "/login";
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6 text-white"
      style={{
        background: `linear-gradient(to bottom, ${THEME.bgFrom}, ${THEME.bgVia}, ${THEME.bgTo})`,
      }}
    >
      {/* Cabeçalho (menu fixo, dropdown acima de tudo) */}
      <div
        className="flex justify-between items-center mb-6 shadow-lg rounded-xl p-4 border relative z-50"
        style={{ background: THEME.panelBg, borderColor: THEME.panelBorder }}
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: THEME.title }}>
            Painel de {empresa?.nome_empresa || empresa?.nome || "Minha Pizzaria"}
          </h1>
          <p className="text-xs md:text-sm" style={{ color: THEME.textMuted }}>
            Atualizado {lastUpdated ? `às ${lastUpdated.toLocaleTimeString()}` : "…"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 🔄 Atualizar */}
          <button
            onClick={carregar}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors"
            style={{ background: THEME.btnDark, color: THEME.btnDarkText }}
            title="Atualizar pedidos"
          >
            🔄 Atualizar
          </button>

          {/* ⚙️ Configurações */}
          <div className="relative">
            <details>
              <summary
                className="list-none cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all"
                style={{
                  background: THEME.btnOrange,
                  color: THEME.btnOrangeText,
                  boxShadow: "0 0 10px rgba(255,159,67,0.15)",
                }}
              >
                ⚙️ Configurações
              </summary>

              {/* dropdown */}
              <div
                className="absolute right-0 mt-2 w-60 rounded-xl border shadow-xl z-[9999]"
                style={{
                  borderColor: THEME.panelBorder,
                  background: "rgba(27,30,37,0.98)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {[
                  ["🏢", "Dados da Empresa", "https://webhook.lglducci.com.br/webhook/config_empresa"],
                  ["💬", "Mensagem Padrão", "https://webhook.lglducci.com.br/webhook/mensagem_padrao"],
                  ["📈", "Relatórios", "/relatorios"],
                  ["🍕", "Cardápio", "/cardapio"],
                  ["✨", "Modelo de Custo", "/pizza-modelo"],
                ].map(([icon, label, link], i) => (
                  <button
                    key={i}
                    onClick={() =>
                      link.startsWith("http")
                        ? window.open(link, "_blank")
                        : (window.location.href = link)
                    }
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#ff9f4315] flex items-center gap-2 transition-colors"
                    style={{ color: THEME.text }}
                  >
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>
            </details>
          </div>

          {/* Sair */}
          <button
            onClick={sair}
            className="px-4 py-2 rounded-lg font-semibold transition"
            style={{ background: "#ef4444", color: "#fff" }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        <Coluna titulo="Recebido"  items={grupos.r}  cls={COLUNAS[0].cls} />
        <Coluna titulo="Produção"  items={grupos.pr} cls={COLUNAS[1].cls} />
        <Coluna titulo="Entrega"   items={grupos.e}  cls={COLUNAS[2].cls} />
        <Coluna titulo="Concluído" items={grupos.c}  cls={COLUNAS[3].cls} />
      </div>

      {/* Modal Visualizar (abre ao clicar no nº do pedido) */}
      <ModalVisualizar
        open={openView}
        onClose={() => setOpenView(false)}
        numero={viewNumero}
        idEmpresa={idEmpresa}
      />
    </div>
  );
}
