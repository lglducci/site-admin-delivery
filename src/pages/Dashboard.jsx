 import React, { useEffect, useMemo, useState } from "react";

/* 🎨 Cores do tema */
const C = {
  bg: "#0F121A",
  panel: "#1B1E25",
  panelBorder: "rgba(255,159,67,0.55)",
  card: "#171c24",
  cardBorder: "rgba(255,159,67,0.25)",
  title: "#ff9f43",
  text: "#e5e7eb",
  textMuted: "#9ca3af",
  btnDark: "#2a2f39",
  btnDarkText: "#e5e7eb",
  btnOrange: "#ff9f43",
  btnOrangeText: "#1b1e25",
};

/* 🔧 Recupera dados da empresa */
function getEmpresaSafe() {
  try {
    return JSON.parse(localStorage.getItem("empresa") || "{}");
  } catch {
    return {};
  }
}

/* Normaliza status */
const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function Dashboard() {
  const empresa = getEmpresaSafe();
  const idEmpresa = empresa?.id_empresa;
  const [pedidos, setPedidos] = useState([]);
  const [erro, setErro] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const carregar = async () => {
    if (!idEmpresa) {
      setErro("Sem empresa no contexto. Faça login novamente.");
      return;
    }
    try {
      const resp = await fetch(
        `https://webhook.lglducci.com.br/webhook/pedidos?id_empresa=${encodeURIComponent(
          idEmpresa
        )}`
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
    if (!idEmpresa) return;
    const ok = window.confirm(`Avançar o pedido nº ${numero}?`);
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
      if (!resp.ok) throw new Error("Falha ao avançar pedido.");
      setPedidos((prev) => prev.filter((p) => (p.numero ?? p.pedido_id) !== numero));
    } catch (e) {
      alert("Erro ao avançar pedido!");
    }
  };

  /* Agrupa pedidos */
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

  const Coluna = ({ titulo, items }) => (
    <div
      className="rounded-2xl p-4 md:p-5 border"
      style={{ background: C.panel, borderColor: C.panelBorder }}
    >
      <div className="pb-3 mb-3 border-b" style={{ borderColor: C.panelBorder }}>
        <h2 className="text-lg md:text-xl font-semibold" style={{ color: C.title }}>
          {titulo}
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="text-sm" style={{ color: C.textMuted }}>
          Nenhum pedido
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => {
            const numero = p.numero ?? p.pedido_id ?? "—";
            return (
              <div
                key={numero}
                className="rounded-xl p-3 md:p-4 border"
                style={{
                  background: C.card,
                  borderColor: C.cardBorder,
                  boxShadow: "0 0 10px rgba(255,159,67,0.10)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                     
                      <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.localStorage.setItem("pedido_visualizar", numero);
                      window.location.href = `/visualizar?numero=${numero}`;
                    }}
                    className="text-base md:text-lg font-semibold underline-offset-4 hover:underline transition-colors"
                    style={{ color: C.title }}
                    title={`Visualizar pedido nº ${numero}`}
                  >
                    nº {numero}
                  </a>
      



                     
                      <span
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          background: C.btnDark,
                          color: C.btnDarkText,
                          opacity: 0.9,
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div
                      className="text-xs md:text-sm mt-1"
                      style={{ color: C.textMuted }}
                    >
                      {p.nome_cliente || p.cliente || "—"}
                    </div>
                  </div>
                  <div
                    className="text-sm font-semibold whitespace-nowrap"
                    style={{ color: C.text }}
                  >
                    {p.valor != null ? `R$ ${Number(p.valor).toFixed(2)}` : "—"}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => avancar(numero)}
                    className="px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-colors"
                    style={{ background: C.btnOrange, color: C.btnOrangeText }}
                  >
                    ▶ Avançar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* === RENDER === */
  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: C.bg }}>
      <div
        className="max-w-7xl mx-auto rounded-2xl border p-4 md:p-6"
        style={{ borderColor: C.panelBorder, background: C.panel }}
      >
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold" style={{ color: C.title }}>
              Painel de {empresa?.nome_empresa || "Minha Pizzaria"}
            </h1>
            <p className="text-xs md:text-sm" style={{ color: C.textMuted }}>
              Atualizado {lastUpdated ? `às ${lastUpdated.toLocaleTimeString()}` : "…"}
            </p>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={carregar}
              className="px-3 py-1.5 rounded-md text-xs md:text-sm transition-colors"
              style={{ background: C.btnDark, color: C.btnDarkText }}
            >
              🔄 Atualizar
            </button>

            {/* Menu Configurações */}
            <div className="relative group">
              <button
                className="px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold flex items-center gap-2 transition-all"
                style={{
                  background: C.btnOrange,
                  color: C.btnOrangeText,
                  boxShadow: "0 0 10px rgba(255,159,67,0.15)",
                }}
              >
                ⚙️ Configurações
              </button>

              <div
                className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden border backdrop-blur-md opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200"
                style={{
                  borderColor: C.panelBorder,
                  background: "rgba(27,30,37,0.95)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                }}
              >
                <ul style={{ color: C.text }}>
                  {[
                    ["🏢", "Dados da Empresa", "/empresa"],
                    ["💬", "Mensagem Padrão", "/mensagem"],
                    ["📈", "Relatórios", "/relatorios"],
                    ["🍕", "Cardápio", "/cardapio"],
                    ["✨", "Modelo de Custo", "/modelo"],
                  ].map(([icon, label, path], i) => (
                    <li
                      key={i}
                      className="px-4 py-2.5 text-sm hover:bg-[#ff9f4315] cursor-pointer transition-colors"
                      onClick={() => (window.location.href = path)}
                    >
                      <span className="mr-2">{icon}</span>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-colors"
              style={{
                background: "#ef4444",
                color: "#fff",
                boxShadow: "0 0 10px rgba(239,68,68,0.15)",
              }}
            >
              Sair
            </button>
          </div>
        </div>

        {/* Colunas */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Coluna titulo="Recebido" items={grupos.r} />
          <Coluna titulo="Produção" items={grupos.pr} />
          <Coluna titulo="Entrega" items={grupos.e} />
          <Coluna titulo="Concluído" items={grupos.c} />
        </div>
      </div>
    </div>
  );
}
