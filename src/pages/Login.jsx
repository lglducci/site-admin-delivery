 import { useEmpresa } from "../context/EmpresaContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { salvarEmpresa } = useEmpresa();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("https://webhook.lglducci.com.br/webhook/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data?.success) {
      // salva id_empresa e outros campos vindos do webhook
      salvarEmpresa({
        id_empresa: data.id_empresa,
        nome: data.nome_empresa,
        saudacao: data.saudacao,
      });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } else {
      alert("Login inválido");
    }
  };
