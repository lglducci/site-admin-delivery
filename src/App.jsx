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
 * HARD GUARD: bloqueia qualquer navegação que tente usar reload
 * (anchors, location.href/assign/replace, history.pushState/replaceState)
 * e redireciona para navegação por HASH (#/rota) — não "sai do sistema".
 */
function HardNavigationGuard() {
  useEffect(() => {
    const toHashNav = (url) => {
      try {
        const u = new URL(url, window.location.origin);
        if (u.origin !== window.location.origin) return false; // externo
        const path = u.pathname + u.search + u.hash;
        if (path.startsWith("/")) {
          const next = `#${path}`;
          if (window.location.hash !== next) window.location.hash = next;
          return true;
        }
        return false;
      } catch {
        if (typeof url === "string" && url.startsWith("/")) {
          const next = `#${url}`;
          if (window.location.hash !== next) window.location.hash = next;
          return true;
        }
        return false;
      }
    };

    // 1) Intercepta links antes de qq handler do menu
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const a = e.target.closest?.("a");
      if (!a) return;
      let href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#") || a.target === "_blank" || a.hasAttribute("download")) return;
      if (/^(https?:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
      if (href.startsWith("/")) href = `#${href}`;
      if (href.startsWith("#/")) {
        if (window.location.hash !== href) window.location.hash = href;
      }
    };
    document.addEventListener("click", onClick, true);

    // 2) Monkey-patch location.* (href/assign/replace)
    const desc = Object.getOwnPropertyDescriptor(window.Location.prototype, "href");
    const origAssign = window.location.assign.bind(window.location);
    const origReplace = window.location.replace.bind(window.location);
    const restore = [];

    restore.push(() => {
      try { Object.defineProperty(window.location, "href", desc); } catch {}
      window.location.assign = origAssign;
      window.location.replace = origReplace;
      history.pushState = origPush;
      history.replaceState = origRep;
      document.removeEventListener("click", onClick, true);
    });

    Object.defineProperty(window.location, "href", {
      configurable: true,
      get() { return desc.get.call(window.location); },
      set(value) { if (!toHashNav(value)) desc.set.call(window.location, value); }
    });
    window.location.assign = (value) => { if (!toHashNav(value)) origAssign(value); };
    window.location.replace = (value) => { if (!toHashNav(value)) origReplace(value); };

    // 3) Monkey-patch history.* (pushState/replaceState)
    const origPush = history.pushState.bind(history);
    const origRep = history.replaceState.bind(history);
    const origPush = history.pushState.bind(history);
    const origRep = history.replaceState.bind(history);
    history.pushState = (state, title, url) => {
      if (typeof url === "string" && toHashNav(url)) return;
      return origPush(state, title, url);
    };
    history.replaceState = (state, title, url) => {
      if (typeof url === "string" && toHashNav(url)) return;
      return origRep(state, title, url);
    };

    return () => restore.forEach((fn) => fn());
  }, []);

  return null;
}

export default function App() {
  return (
    <Router>
      {/* Guard global: impede sair do sistema */}
      <HardNavigationGuard />

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
