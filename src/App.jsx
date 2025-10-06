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
 * Guardião de navegação:
 * 1) Reescreve todo <a href="/..."> para "#/..."
 * 2) Intercepta cliques (click, mousedown, touchstart) EM CAPTURA,
 *    dá preventDefault + stopImmediatePropagation, e navega via hash.
 * => Resultado: não recarrega, não "sai do sistema".
 */
function NavigationGuard() {
  useEffect(() => {
    const rewriteAnchors = (root = document) => {
      const as = root.querySelectorAll('a[href^="/"]:not([data-no-fix])');
      as.forEach((a) => {
        const href = a.getAttribute("href");
        if (!href || href.startsWith("//") || href.startsWith("#/")) return;
        a.setAttribute("href", `#${href}`);
      });
    };

    const handle = (e) => {
      // só botão esquerdo, sem modificadores
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      const a = e.target.closest && e.target.closest("a");
      if (!a) return;

      let href = a.getAttribute("href") || "";
      if (!href) return;

      // externos / mailto / tel / download / _blank: deixa passar
      if (/^(https?:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (a.hasAttribute("download") || a.target === "_blank") return;

      // normaliza para "#/rota"
      if (href.startsWith("/")) href = `#${href}`;

      // só tratamos navegações internas da SPA por hash
      if (href.startsWith("#/")) {
        // BLOQUEIA QUALQUER handler do menu (inclusive inline onclick)
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();

        // navega sem recarregar
        if (window.location.hash !== href) {
          window.location.hash = href;
        }
      }
    };

    // 1) reescreve os links existentes
    rewriteAnchors();

    // 2) observa novos nós adicionados (menus que rendem depois)
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => n.nodeType === 1 && rewriteAnchors(n));
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // 3) intercepta eventos antes dos handlers do menu
    document.addEventListener("mousedown", handle, true);
    document.addEventListener("touchstart", handle, true);
    document.addEventListener("click", handle, true);

    return () => {
      mo.disconnect();
      document.removeEventListener("mousedown", handle, true);
      document.removeEventListener("touchstart", handle, true);
      document.removeEventListener("click", handle, true);
    };
  }, []);

  return null;
}

export default function App() {
  return (
    <Router>
      <NavigationGuard />

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
            <div style={{
              background:"#000",color:"#fff",height:"100vh",
              display:"flex",alignItems:"center",justifyContent:"center"
            }}>
              404 — rota não encontrada
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
