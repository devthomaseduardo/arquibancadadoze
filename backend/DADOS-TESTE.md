# Dados fake para testar

Depois de rodar `npm run db:seed`, use estes dados no frontend.

## Login do cliente (Meus pedidos)

| Campo   | Valor                          |
|--------|----------------------------------|
| E-mail | `teste@torcidaurbana.com.br`   |
| Senha  | `123456`                        |

Esse usuário já tem **3 pedidos fake** vinculados:

- **#1001** – Aguardando / Pagamento pendente  
- **#1002** – Enviado / Aprovado – Rastreio: BR123456789BR  
- **#1003** – Entregue / Aprovado – Rastreio: BR987654321BR  

**Como testar:** acesse a loja → **Entrar** → use o e-mail e a senha acima → **Meus pedidos**.

## Admin (painel)

| Header       | Valor                          |
|-------------|----------------------------------|
| X-Admin-Key | `torcida-urbana-admin-secret`   |

Ou na URL: `?adminKey=torcida-urbana-admin-secret`

## Recriar dados de teste

```bash
cd backend
npm run db:seed
```

O seed não apaga pedidos existentes; ele faz upsert do usuário de teste e dos pedidos 1001, 1002 e 1003.
