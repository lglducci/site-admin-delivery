 import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";
import Cardapio from "./pages/Cardapio";
import EditarItem from "./pages/EditarItem";
import PedidoDetalhes from "./pages/PedidoDetalhes";
 


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="/editar-item/:id" element={<EditarItem />} />
       <Route path="/pedido/:numero" element={<PedidoDetalhes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
