# Não consigo aplicar as alterações (worktree / branch)

Se aparece uma mensagem no canto da tela e você **não consegue aplicar** as mudanças do worktree no seu branch, use um dos caminhos abaixo.

---

## Opção 1: Aplicar manualmente no seu branch (recomendado)

1. **Anote ou copie** as alterações que você quer manter (ou deixe este worktree aberto como referência).

2. **Abra o repositório principal** (a pasta do projeto onde você trabalha no dia a dia, não o worktree).

3. **No repositório principal:**
   ```bash
   git checkout main
   # ou: git checkout seu-branch
   ```

4. **Copie para o repositório principal** apenas os arquivos que deseja:
   - Pastas/arquivos novos: `docs/`, `src/types/`, `src/data/category-mappings.ts`, `src/data/produtos-public-paths.ts`, `src/data/clubes-brasileiros.ts`, `src/public/` (se existir).
   - Arquivos modificados: os que aparecem em "modified" no worktree (ex.: `src/lib/store-mappers.ts`, `src/pages/Products.tsx`, etc.).

5. **Commit no repositório principal:**
   ```bash
   git add .
   git status
   git commit -m "feat: convenções, tipos, mapeamentos por categoria e fornecedor"
   ```

Assim você **não depende** do botão "Aplicar" do Cursor e evita conflito com o estado "Atualmente em nenhum ramo" do worktree.

---

## Opção 2: Criar um branch a partir deste worktree

Se você quiser **usar este worktree como fonte da verdade**:

1. **Neste worktree**, no terminal:
   ```bash
   git checkout -b feature/convencoes-e-fornecedor
   git add docs/ src/types/ src/data/category-mappings.ts src/data/produtos-public-paths.ts src/data/clubes-brasileiros.ts src/public/ src/components/ src/pages/ src/lib/ src/index.css src/data/criativos.ts vite.config.ts
   git add -u
   git status
   git commit -m "feat: convenções, estrutura por fornecedor, nomes de produto, admin fornecedor"
   git push -u origin feature/convencoes-e-fornecedor
   ```

2. No **repositório principal** (outra pasta):
   ```bash
   git fetch
   git checkout feature/convencoes-e-fornecedor
   ```

Assim as alterações ficam num branch e você continua trabalhando a partir dele.

---

## Opção 3: Por que o "Aplicar" pode falhar?

- O worktree está em **"Atualmente em nenhum ramo"** (HEAD solto). O Cursor pode tentar aplicar em um branch que não é este estado.
- Há muitos arquivos **deletados** (ex.: `public/...`) no status. Se você **não** usa mais essa pasta e passou a usar `src/public/`, faça commit das deleções e das novas pastas para o status ficar limpo.
- **Conflitos**: se o branch alvo foi alterado em outro lugar, pode haver conflito; resolva no repositório principal após merge ou copie os arquivos à mão.

---

## Depois de aplicar

- **Frontend:** `npm install` e `npm run build` (ou `npm run dev`).
- **Backend:** copie `backend/.env.example` para `backend/.env`, ajuste `DATABASE_URL` e rode `npm run db:push` (e `db:seed` se precisar).
- **Estrutura de imagens:** as imagens de produtos podem ficar em `src/public/Produtos/Fornecedor 1/Kit Infantil/`, etc. Veja `docs/CONVENTIONS.md` para registrar novas pastas em `produtos-public-paths.ts` e `category-mappings.ts`.
