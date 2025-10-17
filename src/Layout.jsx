 import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isKdsView = location.pathname === "/kds"; // detecta se é a tela da cozinha

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col">
      {/* Menu fixo */}  
      
      <header className="bg-[#0c1d2a] border-b border-[#ff9f43]/30 px-4 py-6 flex justify-between items-center">

<div
  className="font-extrabold tracking-tight text-4xl md:text-4xl"
  style={{ color: "#ff9f43" }}
>
  🍕 AdminDelivery
</div>
       
    

        {/* Se for /kds, mostra só o botão sair */}
        {isKdsView ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md"
          >
            Sair
          </button>
        ) : (
          <nav className="flex gap-3 text-sm">
            <Link to="/dashboard" className="hover:text-[#ffb763]">
              🏠 Home
            </Link>
            <Link to="/cardapio" className="hover:text-[#ffb763]">
              📋 Cardápio
            </Link>
            <Link to="/relatorios" className="hover:text-[#ffb763]">
              📊 Relatórios
            </Link>
            <Link to="/configuracoes" className="hover:text-[#ffb763]">
              ⚙️ Configurações
            </Link>
          </nav>
        )}
      </header>

      {/* Conteúdo da página atual */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
