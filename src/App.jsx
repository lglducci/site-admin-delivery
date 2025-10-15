 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";
import Cardapio from "./pages/Cardapio";
import EditarItem from "./pages/EditarItem";
import PedidoDetalhes from "./pages/PedidoDetalhes";
import PizzaModelo from "./pages/PizzaModelo.jsx"; // + import
import Relatorios from "./pages/Relatorios.jsx";
 import KpiTermometroDia from "./pages/KpiTermometroDia";
import KdsView from "./pages/KdsView"; // adicione o import

export default function App() {
  return (
    <Router>
      <Routes>
         <Route element={<Layout />}>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="/editar-item/:id" element={<EditarItem />} />
        <Route path="/detalhes" element={<PedidoDetalhes />} />
       <Route path="/pizza-modelo" element={<PizzaModelo />} />
       <Route path="/relatorios" element={<Relatorios />} />
       <Route path="/kpi" element={<KpiTermometroDia />} />
       <Route path="/kds" element={<KdsView />} />
      </Routes>
    </Router>
  );
}
