 // src/App.jsx
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
        {/* Redireciona a raiz para a tela que queremos abrir AGORA */}
        <Route path="/" element={<Navigate to="/modelos-custo" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="/editar-item/:id" element={<EditarItem />} />
        <Route path="/detalhes" element={<PedidoDetalhes />} />
        <Route path="/modelos-custo" element={<ModelosCusto />} />
        {/* 404 interno */}
        <Route path="*" element={<div style={{
          background:"#000",color:"#fff",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"
        }}>404 — rota não encontrada</div>} />
      </Routes>
    </Router>
  );
}
