 import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";
import Cardapio from "./pages/Cardapio";
import EditarItem from "./pages/EditarItem";
import PedidoDetalhes from "./pages/PedidoDetalhes";
import ModelosCusto from "./pages/ModelosCusto";
// ⚠️ use um nome diferente e extensão explícita:
import ModelosCustoPage from "./pages/ModelosCustoPage.jsx"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="/editar-item/:id" element={<EditarItem />} />
      
       <Route path="/detalhes" element={<PedidoDetalhes />} />
         
               <Route path="/modelos-custo" element={<ModelosCustoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

export default function App() {
  return <ModelosCusto />;
}



 
