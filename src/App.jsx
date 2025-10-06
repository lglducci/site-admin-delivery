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
 * Intercepta QUALQUER clique em <a href="/..."> e converte para navegação por hash,
 * evitando reload e logout. Funciona com qualquer menu legado.
 */
function LinkInterceptor() {
  useEffect(() => {
    const onClick = (e) => {
      // só botão esquerdo, sem ctrl/cmd/alt/shift, sem já prevenido
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      const a = e.target.closest && e.target.closest("a");
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href) return;

      // ignora externos, âncoras locais, download e _blank
      const isExternal = /^https?:\/\//i.test(href) || href.startsWith("//");
      if (isExternal || href.startsWith("#") || a.hasAttribute("download") || a.target === "_blank") return;

      // só tratamos rotas absolutas da app: "/algo"
      if (href.startsWith("/")) {
        e.preventDefault();
        // HashRouter: navega sem recarregar a página
        const next = href.startsWith("#/") ? href : `#${href}`;
        if (window.location.hash !== next) {
          window.location.hash = next;
        }
      }
    };

    // captura no CAPTURE para ganhar de handlers do menu
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

export default function App() {
  return (
    <Router>
      {/* Patch global: impede "sair do sistema" ao clicar no menu */}
      <LinkInterceptor />

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
