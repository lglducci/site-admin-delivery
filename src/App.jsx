 // src/App.jsx
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";
import Cardapio from "./pages/Cardapio";
import EditarItem from "./pages/EditarItem";
import PedidoDetalhes from "./pages/PedidoDetalhes";
import ModelosCusto from "./pages/ModelosCusto";

/**
 * Bloqueia full reload ao clicar em links do menu legado.
 * Converte qualquer navegação interna ("/rota") para hash ("#/rota").
 * Funciona mesmo com inline onclick/JS, porque intercepta no capture e corta a propagação.
 */
function StopFullReloads() {
  useEffect(() => {
    const toHash = (url) => {
      try {
        const u = new URL(url, window.location.origin);
        if (u.origin !== window.location.origin) return null;        // externo
        return `#${u.pathname}${u.search}${u.hash}`;                 // "#/rota?x#y"
      } catch {
        if (typeof url === "string" && url.startsWith("/")) return `#${url}`;
        return null;
      }
    };

    const intercept = (e) => {
      // só clique primário, sem modificadores
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      // acha o <a> mais próximo
      const a = e.target?.closest?.("a");
      if (!a) return;

      // pega href do atributo (prioriza o que o HTML declarou)
      const raw = a.getAttribute("href") || a.href || "";
      if (!raw) return;

      // ignora externos e protocolos especiais
      if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;
      if (a.hasAttribute("download") || a.target === "_blank") return;

      const dest = toHash(raw);
      if (!dest) return;

      // mata o clique ANTES de qq handler do menu
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();

      // navega via hash (HashRouter)
      if (window.location.hash !== dest) {
        window.location.hash = dest;
      }
    };

    // intercepta antes dos handlers do menu
    document.addEventListener("mousedown", intercept, true);
    document.addEventListener("touchstart", intercept, true);
    document.addEventListener("click", intercept, true);

    // também reescreve anchors já renderizados e futuros
    const rewrite = (root = document) => {
      root.querySelectorAll('a[href^="/"]:not([data-no-fix])').forEach((el) => {
        const href = el.getAttribute("href");
        if (href && !href.startsWith("#/")) el.setAttribute("href", `#${href}`);
      });
    };
    rewrite();

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => n.nodeType === 1 && rewrite(n));
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousedown", intercept, true);
      document.removeEventListener("touchstart", intercept, true);
      document.removeEventListener("click", intercept, true);
      mo.disconnect();
    };
  }, []);

  return null;
}

export default function App() {
  return (
    <Router>
      {/* Guard global: impede sair do sistema ao clicar no menu */}
      <StopFullReloads />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="/editar-item/:id" element={<EditarItem />} />
        <Route path="/detalhes" element={<PedidoDetalhes />} />
        <Route path="/modelos-custo" element={<ModelosCusto />} />
        <Route
          path="*"
          element={
            <div
              style={{
                background: "#000",
                color: "#fff",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              404 — rota não encontrada
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
