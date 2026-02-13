import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { toast } = useToast();
  const { user, loading, login, register, loginWithGoogleCredential, logout } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleClientId = useMemo(
    () => (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || "",
    [],
  );

  useEffect(() => {
    if (!googleClientId) return;
    const hasGoogle = typeof window !== "undefined" && "google" in window;
    if (hasGoogle) setGoogleReady(true);
  }, [googleClientId]);

  useEffect(() => {
    if (!googleReady || !googleClientId) return;
    const googleApi = (window as typeof window & { google?: any }).google;
    if (!googleApi?.accounts?.id) return;

    googleApi.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response: { credential?: string }) => {
        if (!response.credential) return;
        try {
          setSubmitting(true);
          await loginWithGoogleCredential(response.credential);
          toast({ title: "Bem-vindo!", description: "Login com Google realizado." });
        } catch (err) {
          toast({
            title: "Erro no Google",
            description: err instanceof Error ? err.message : "Tente novamente.",
            variant: "destructive",
          });
        } finally {
          setSubmitting(false);
        }
      },
    });

    googleApi.accounts.id.renderButton(document.getElementById("google-login"), {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "continue_with",
      locale: "pt-BR",
    });
  }, [googleReady, googleClientId, loginWithGoogleCredential, toast]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await login(loginEmail.trim(), loginPassword);
      toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
      setLoginPassword("");
    } catch (err) {
      toast({
        title: "Erro ao entrar",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await register(registerName.trim(), registerEmail.trim(), registerPassword);
      toast({ title: "Conta criada", description: "Cadastro realizado com sucesso." });
      setRegisterPassword("");
    } catch (err) {
      toast({
        title: "Erro no cadastro",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Área do Cliente</CardTitle>
            <CardDescription>Acesse sua conta para acompanhar pedidos e receber ofertas.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando sua sessão...</p>
            ) : user ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Logado como</p>
                  <p className="text-lg font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" asChild>
                    <Link to="/produtos">Ver produtos</Link>
                  </Button>
                  <Button onClick={logout} variant="outline">
                    Sair da conta
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Criar conta</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">E-mail</Label>
                      <Input
                        id="login-email"
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <Input
                        id="login-password"
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      Entrar
                    </Button>
                    {googleClientId ? (
                      <div className="space-y-2">
                        <div className="relative flex items-center">
                          <span className="h-px w-full bg-border" />
                          <span className="px-2 text-xs text-muted-foreground">ou</span>
                          <span className="h-px w-full bg-border" />
                        </div>
                        <div id="google-login" />
                      </div>
                    ) : null}
                  </form>
                </TabsContent>
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nome</Label>
                      <Input
                        id="register-name"
                        required
                        value={registerName}
                        onChange={(event) => setRegisterName(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">E-mail</Label>
                      <Input
                        id="register-email"
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(event) => setRegisterEmail(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha (mín. 6 caracteres)</Label>
                      <Input
                        id="register-password"
                        type="password"
                        required
                        minLength={6}
                        value={registerPassword}
                        onChange={(event) => setRegisterPassword(event.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      Criar conta
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Seus dados são usados apenas para acompanhar pedidos.
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
