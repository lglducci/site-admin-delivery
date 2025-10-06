 // src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";
import Cardapio from "./pages/Cardapio";
import EditarItem from "./pages/EditarItem";
import PedidoDetalhes from "./pages/PedidoDetalhes";
import ModelosCusto from "./pages/ModelosCusto";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* sua home/login */}
        <Route path="/" element={<Login />} />

        {/* rotas existentes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="/editar-item/:id" element={<EditarItem />} />
        <Route path="/detalhes" element={<PedidoDetalhes />} />

        {/* rota oficial */}
        <Route path="/modelos-custo" element={<ModelosCusto />} />

        {/* ALIAS para qualquer link de menu “errado” */}
        <Route path="/modelo-custo" element={<ModelosCusto />} />
        <Route path="/modelos" element={<ModelosCusto />} />
        <Route path="/modelo" element={<ModelosCusto />} />
        <Route path="/custos" element={<ModelosCusto />} />
        <Route path="/custos/modelos" element={<ModelosCusto />} />
        <Route path="/modelo-de-custo" element={<ModelosCusto />} />
        <Route path="/modelos-de-custo" element={<ModelosCusto />} />

        {/* 404 real só se não bater em NENHUMA das acima */}
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
                fontFamily: "sans-serif",
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
