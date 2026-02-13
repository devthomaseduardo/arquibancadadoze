
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Bem-vindo de volta!");
      navigate("/");
    } catch (err) {
      toast.error("Erro ao entrar");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500 uppercase">E-mail</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-white outline-none focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500 uppercase">Senha</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-white outline-none focus:border-primary" />
                </div>
                <button type="submit" className="w-full gradient-primary rounded-lg py-3 font-heading text-lg text-white">
                  ACESSAR CONTA
                </button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form className="space-y-4 opacity-50 pointer-events-none">
                 <p className="text-center text-xs text-zinc-500">Cadastro desabilitado temporariamente.</p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
