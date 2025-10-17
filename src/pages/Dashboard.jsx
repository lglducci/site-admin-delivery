 import React, { useEffect, useMemo, useState } from "react";
import ModalDetalhesPedido from "../components/ModalDetalhesPedido";


const THEME = {
  pageBg: "#0d1117",
  panelBg: "#1e2a32",
  panelBorder: "rgba(255,140,0,0.35)",
  cardBg: "#0b1a24",
  cardBorder: "rgba(255,140,0,0.25)",
  cardShadow: "0 6px 20px rgba(0,0,0,0.35)",
  title: "#ff9f43",
  text: "#f3f3f3",
  textMuted: "#aeb9c4",
  btnDark: "#26323a",
  btnDarkText: "#e5e7eb",
  btnOrange: "#ff9f43",
  btnOrangeText: "#1b1e25",
};
 
function getEmpresaSafe() {
  try {
    return JSON.parse(localStorage.getItem("empresa") || "{}");
  } catch {
    return {};
  }
}

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function Dashboard() {
  const empresa = getEmpresaSafe();
  const idEmpresa =
    empresa?.id_empresa ?? empresa?.idEmpresa ?? localStorage.getItem("id_empresa");

  const [pedidos, setPedidos] = useState([]);
  const [erro, setErro] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const carregar = async () => {
    const id = Number(idEmpresa);
    if (!id || Number.isNaN(id)) {
      setErro("Sem empresa no contexto. Faça login novamente.");
      return;
    }
    try {
      const resp = await fetch(
        `https://webhook.lglducci.com.br/webhook/pedidos?id_empresa=${encodeURIComponent(
          id
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
    const t = setInterval(carregar, 200000);
    return () => clearInterval(t);
  }, [idEmpresa]);

 const [pendingNumero, setPendingNumero] = useState(null);

const avancar = async (numero) => {
  const id = Number(idEmpresa);
  if (!id || Number.isNaN(id)) {
    alert("Empresa não identificada. Abra o cardápio/logue novamente.");
    return;
  }

  const ok = window.confirm(`Avançar o pedido nº ${numero}?`);
  if (!ok) return;

  try {
    setPendingNumero(numero); // desabilita o botão desse pedido
    const resp = await fetch("https://webhook.lglducci.com.br/webhook/avancar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero, id_empresa: id }),
    });

    if (!resp.ok) {
      alert("Falha ao avançar o pedido.");
      return;
    }

    // 1) remove otimista
    setPedidos((prev) => prev.filter((p) => (p.numero ?? p.pedido_id) !== numero));
    // 2) força refresh do servidor (garante consistência)
    await carregar();
  } catch (e) {
    console.error(e);
    alert("Erro ao avançar pedido!");
  } finally {
    setPendingNumero(null);
  }
};


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

  const PedidoItem = ({ p }) => {
    const numero = p.numero ?? p.pedido_id ?? "—";
    return (
      <div
        className="rounded-xl p-3 md:p-4 border shadow-md mb-3 transition-all"
        
       style={{ background:  "#52738f", borderColor: THEME.cardBorder }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {/* 🔗 Agora o número abre o modal, não nova aba */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPedidoSelecionado(p);
                  setShowDetalhes(true);
                }}
                 
                className="text-lg md:text-xl font-bold hover:underline"
 
               style={{ color: "#ffae4a" }}
              >
                nº {numero}
              </a>
              <span
                className="text-[11px] md:text-xs px-2 py-0.5 rounded-md"
                style={{
                  background: THEME.btnDark,
                  color: THEME.btnDarkText,
                  opacity: 0.9,
                }}
              >
                {p.status}
              </span>
            </div>
            <div
              className="text-xs md:text-sm mt-1"
              style={{ color: THEME.textMuted }}
            >
              {p.nome_cliente || p.nomeCliente || p.cliente || "—"}
            </div>
          </div>
          <div
            className="text-sm font-semibold whitespace-nowrap"
            style={{ color: THEME.text }}
          >
            {p.valor != null ? `R$ ${Number(p.valor).toFixed(2)}` : "—"}
          </div>
        </div>

        <div className="mt-3 flex justify-end">
       <button
           onClick={() => avancar(numero)}
           disabled={pendingNumero === numero}
           className="px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
           style={{ background: THEME.btnOrange, color: THEME.btnOrangeText }}
         >
           {pendingNumero === numero ? "… Avançando" : "▶ Avançar"}
         </button>

        </div>
      </div>
    );
  };


 const Coluna = ({ titulo, items }) => (
  <div
    className="rounded-2xl p-4 md:p-5"
    style={{
      backgroundColor: "#ccd5da", // 👈 COR QUE VOCÊ QUER
      border: `1px solid ${THEME.panelBorder}`,
    }}
  >


 
    <div
      className="pb-3 mb-3 border-b"
      style={{ borderColor: THEME.panelBorder }}
    >
      <h2 className="text-lg md:text-xl font-semibold" style={{ color: THEME.title }}>
        {titulo}
      </h2>
    </div>

    {items.length === 0 ? (
      <div className="text-sm opacity-90" style={{ color: THEME.textMuted }}>
        Nenhum pedido
      </div>
    ) : (
      items.map((p) => <PedidoItem key={p.numero ?? p.pedido_id} p={p} />)
    )}
  </div>
);


  const sair = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6 text-white"
    
style={{ background: "#012e46"      }}  //THEME.pageBg 
    >
      {/* Cabeçalho */}
      <div
        className="flex justify-between items-center mb-6 shadow-lg rounded-xl p-4 border relative z-50"
        style={{backgroundColor: "#0c1d2a"  , borderColor: THEME.panelBorder}}   //THEME.panelBg


       
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
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#ff9f43] flex items-center gap-2 transition-colors"
                    style={{ color: THEME.text }}
                  >
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>
            </details>
          </div>

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
 

      {/*  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10 p-5"
     style={{ backgroundColor: "#99abb5" }}> */}


 <div
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-5 mx-auto"
  style={{
    backgroundColor: "#345671",   // cinza de fundo
    transform: "scale(0.8)",      // reduz 80% do tamanho atual
    transformOrigin: "top center",
    borderRadius: "12px",
  }}
>
  <Coluna titulo="Recebido"  items={grupos.r} />
  <Coluna titulo="Produção" items={grupos.pr} />
  <Coluna titulo="Entrega"  items={grupos.e} />
  <Coluna titulo="Concluído" items={grupos.c} />
</div>

 


      {/* 🪟 Modal Detalhes */}
      {showDetalhes && pedidoSelecionado && (
        <ModalDetalhesPedido
          open={showDetalhes}
          onClose={() => setShowDetalhes(false)}
          numero={pedidoSelecionado.numero ?? pedidoSelecionado.pedido_id}
          idEmpresa={idEmpresa}
        />
      )}
    </div>
  );
}
