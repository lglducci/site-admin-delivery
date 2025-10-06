 // src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";
import Cardapio from "./pages/Cardapio";
import EditarItem from "./pages/EditarItem";
import PedidoDetalhes from "./pages/PedidoDetalhes";
import ModelosCusto from "./pages/ModelosCusto";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/editar-item/:id" element={<EditarItem />} />
          <Route path="/detalhes" element={<PedidoDetalhes />} />
          <Route path="/modelos-custo" element={<ModelosCusto />} />
          {/* Rota de teste inline — NÃO depende de componente/exports */}
          <Route
            path="/_test"
            element={
              <div style={{
                background: "black", color: "lime", height: "100vh",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24
              }}>
                ✅ Roteador OK
              </div>
            }
          />
          {/* 404 */}
          <Route
            path="*"
            element={
              <div style={{
                background: "black", color: "white", height: "100vh",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
              }}>
                404 — rota não encontrada
              </div>
            }
          />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
