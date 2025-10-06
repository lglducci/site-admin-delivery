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

// Reescreve QUALQUER <a href="/x"> para <a href="#/x"> em todo o app
function HashLinkFixer() {
  useEffect(() => {
    const fix = (root = document) => {
      const anchors = root.querySelectorAll('a[href^="/"]:not([data-no-fix])');
      anchors.forEach((a) => {
        const href = a.getAttribute("href");
        // ignora //dominio e externas
        if (!href || href.startsWith("//")) return;
        // já está com hash? então deixa
        if (href.startsWith("#/")) return;
        a.setAttribute("href", `#${href}`);
      });
    };

    // 1) corrige o que já está na página
    fix();

    // 2) observa mudanças futuras (menus que rendem depois)
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) fix(n);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, []);

  return null;
}

export default function App() {
  return (
    <Router>
      {/* patch global: evita sair do app ao clicar em <a href="/..."> */}
      <HashLinkFixer />

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
