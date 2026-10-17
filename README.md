# Casa 64 — Xadrez no navegador

Jogo para duas pessoas no mesmo dispositivo, feito com React, TypeScript, Vite e chess.js. Interface responsiva em português. Não há adversário de inteligência artificial nem servidor de partidas.

## Usar apenas o navegador: Codex Cloud e GitHub Pages

Não é necessário instalar Node.js, Git ou um editor no Windows para jogar a versão publicada.

**Por que localhost não abre?** O Vite executado pelo Codex Cloud está em outra máquina. No navegador do Windows, `localhost` aponta para o Windows, não para a nuvem. Iniciar o Vite com `--host 0.0.0.0` permite conexões no ambiente, mas não cria um endereço público nem encaminha automaticamente a porta para seu computador.

Nesta sessão não foi disponibilizada uma ferramenta de pré-visualização com URL pública/encaminhamento de portas. Por isso não há um botão ou link de preview confirmado que possamos indicar. A disponibilidade pode variar entre interfaces; estas instruções não dependem de um preview do Codex.

### Publicar gratuitamente pelo GitHub, sem instalar ferramentas

O projeto está preparado para o repositório https://github.com/academiaverbum-dev/chess-game. O workflow `.github/workflows/deploy-pages.yml` instala dependências, executa os testes, compila e publica `dist/`. A opção `base: "./"` do Vite faz os arquivos JS/CSS funcionarem no caminho `/chess-game/`.

1. **Envie as alterações desta tarefa ao GitHub.** Se a interface do Codex oferecer **Create PR / Criar PR**, crie a solicitação e, no GitHub, clique em **Merge pull request** para incorporar todos os arquivos na branch `main` (ou `master`). Os arquivos devem estar na raiz do repositório: `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `.gitignore`, `src/` e `.github/workflows/deploy-pages.yml`. Não envie `node_modules/` ou `dist/`.
2. Se não houver integração para criar PR, transfira os arquivos usando o editor do GitHub (tecla `.` no repositório). Preserve as pastas `src/` e `.github/workflows/`; faça commit na branch principal. Se usar um ZIP, extraia-o primeiro: enviar apenas o ZIP não publica o jogo. É uma alternativa pelo navegador, sem ferramentas de programação instaladas.
3. Para publicação gratuita com GitHub Free, use um **repositório público**. Se estiver privado, confirme que deseja tornar seu código público antes de mudar **Settings → General → Danger Zone → Change repository visibility**. Organizações podem aplicar restrições próprias.
4. Abra **Settings → Pages → Build and deployment → Source** e selecione **GitHub Actions**. Não selecione “Deploy from a branch”. É necessário ter permissão de administração do repositório.
5. Se Actions estiver desabilitado, habilite-o em **Settings → Actions → General**, permitindo as ações oficiais usadas pelo workflow. Não são necessários tokens ou secrets manuais; a publicação usa o token temporário do GitHub.
6. Abra **Actions → Testar e publicar no GitHub Pages**. Se não houver execução após configurar Pages, clique em **Run workflow**, escolha `main` (ou `master`) e confirme. Se uma execução anterior falhou porque Pages ainda estava desabilitado, use **Re-run all jobs**.
7. Aguarde os jobs **Instalar, testar e compilar** e **Publicar jogo** ficarem verdes. Se houver uma aprovação do ambiente `github-pages`, um administrador precisará aprová-la.
8. Abra **Settings → Pages → Visit site** ou o endereço exibido no job de publicação. O endereço esperado, após publicação bem-sucedida, é **https://academiaverbum-dev.github.io/chess-game/**. Este endereço não está confirmado como publicado por esta tarefa.

Atualizações incorporadas em `main` ou `master` executam os testes e publicam novamente. Pull requests executam testes e compilação sem publicar. Se sua branch principal tiver outro nome, ajuste a lista `branches` e a condição `if` do job `deploy` no workflow.

### Verificações realizadas nesta tarefa

- Instalação limpa com `npm ci` concluída usando o `package-lock.json`.
- `npm test`: 12 testes aprovados (regras e interações).
- `npm run build`: TypeScript e compilação Vite aprovados; arquivos gerados com referências relativas `./assets/`.
- Vite iniciado na nuvem em `0.0.0.0:5173`, com HTTP 200 para a página, `src/main.tsx` e `src/App.tsx`.
- A abertura da porta exigiu permissão de rede do ambiente. O servidor foi encerrado após a verificação; ele não substitui uma hospedagem.
- Não houve inspeção visual em navegador real nem execução do workflow no GitHub nesta tarefa. A publicação depende dos passos manuais acima.

### Conferir o jogo publicado

Abra a URL do Pages no Windows ou no celular. Clique em `e2` e depois em `e4`: os destinos devem aparecer destacados e o turno deve passar para as pretas. Teste desfazer e iniciar uma nova partida. Para testar xeque-mate, faça `f2 → f3`, `e7 → e5`, `g2 → g4`, `d8 → h4`.

Se a página mostrar 404, confira o resultado do workflow e use exatamente o endereço de **Settings → Pages**, incluindo `/chess-game/`. Se Actions falhar, abra o primeiro passo vermelho para ver o erro. Se o site ainda mostrar uma versão antiga, aguarde a publicação e atualize com `Ctrl+F5`.

## Executar no computador (opcional)

1. Instale o **Node.js 22 LTS ou superior** (inclui o npm): https://nodejs.org/.
2. Abra o terminal nesta pasta (a que contém `package.json`).
3. Na primeira execução, instale as dependências:

   ```sh
   npm ci
   ```

4. Inicie o jogo:

   ```sh
   npm run dev
   ```

5. Abra o endereço mostrado pelo terminal, normalmente **http://localhost:5173**.

Para parar o servidor, pressione `Ctrl+C` no terminal.

## Como jogar e testar manualmente

- As brancas começam. Clique em uma peça branca: os destinos legais aparecem como pontos ou círculos de captura.
- Clique em um destino destacado para mover. Agora jogam as pretas.
- Experimente `e2 → e4` e `e7 → e5`. Um movimento ilegal, como `e2 → e5` na posição inicial, é rejeitado.
- Clique na peça selecionada para desmarcar, ou em outra peça sua para trocar a seleção.
- Quando um peão chegar à última fileira, escolha dama, torre, bispo ou cavalo.
- Use **Girar tabuleiro**, **Desfazer lance** ou **Nova partida** quando desejar.
- Para ver xeque-mate, em uma nova partida faça `f2 → f3`, `e7 → e5`, `g2 → g4`, `d8 → h4`.
- Redimensione a janela ou abra pelo celular para testar a disposição responsiva. Todas as casas são botões acessíveis pelo teclado (Tab e Enter/Espaço).

## Testes e versão de produção

```sh
npm test
npm run build
npm run preview
```

`npm test` executa testes automatizados das regras e da interface com Vitest e Testing Library. `npm run build` verifica os tipos e gera os arquivos estáticos em `dist/`. `npm run preview` permite conferir essa versão em http://localhost:4173.

## Estrutura

- `src/App.tsx`: tabuleiro, seleção, promoção, histórico e controles.
- `src/game.ts`: validação de lances e mensagens de estado usando chess.js.
- `src/style.css`: interface e adaptação para telas menores.
- `src/*.test.ts*`: testes das regras e das interações.
- `vite.config.ts`: configuração do Vite, React e testes.

A chess.js valida turnos, capturas, roque, en passant, promoção e proteção do rei. O jogo informa xeque, xeque-mate e empates por afogamento, material insuficiente, repetição e regra dos 50 lances. Repetição tripla e 50 lances encerram automaticamente a partida conforme a API da biblioteca, sem uma etapa de reivindicação. O histórico usa notação algébrica padrão (SAN: K=rei, Q=dama, R=torre, B=bispo, N=cavalo).

A partida fica apenas na memória: recarregar a página inicia uma nova. Não é necessário configurar contas, chaves ou variáveis de ambiente. A fonte externa é opcional e há fontes de sistema como alternativa.
