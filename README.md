# Casa 64 — Xadrez no navegador

Jogo de xadrez no navegador, feito com React, TypeScript, Vite e chess.js. Interface responsiva em português. A versão 0.2 oferece dois jogadores locais ou adversário no navegador, sem servidor de partidas e sem API paga.

## Novidades da versão 0.2

No seletor **Modo de jogo**, escolha **Dois jogadores** para manter o funcionamento original ou **Contra o computador** para jogar com as brancas. Escolha a dificuldade antes de começar:

- **Fácil:** escolhe aleatoriamente entre os movimentos legais.
- **Médio:** compara o saldo material após cada lance e a melhor resposta adversária (duas meias-jogadas). Valoriza capturas e evita perdas imediatas; não tem a força do Stockfish.
- **Difícil · Stockfish:** usa Stockfish.js 17.1.0 lite-single, limitado a profundidade 8 e aproximadamente 1,2 segundo de busca. O primeiro carregamento baixa cerca de 7 MB de WebAssembly. A inicialização pode levar mais tempo em celulares.

Durante o turno das pretas, a interface mostra **O computador está pensando…** e bloqueia os cliques no tabuleiro. Todos os lances recebidos são novamente validados pela chess.js. **Desfazer lance** reverte o último turno humano/computador; se o computador ainda não respondeu, reverte somente o lance humano e cancela o cálculo. No modo local, continua desfazendo um lance por vez.

**Nova partida** mantém o modo e a dificuldade escolhidos. Trocar modo ou dificuldade inicia outra partida, com confirmação quando há lances. Em caso de erro ou demora do motor, aparece um aviso com **Tentar novamente**. Também é possível desfazer, iniciar nova partida ou escolher outra dificuldade. Não há substituição silenciosa do Stockfish por um motor mais fraco.

### Motor, compatibilidade e licença

O cálculo usa Web Workers em todas as dificuldades. O Stockfish utiliza WebAssembly em uma única thread; dispensa SharedArrayBuffer, isolamento entre origens e cabeçalhos COOP/COEP, sendo adequado ao GitHub Pages. Requer navegador moderno com Web Workers e WebAssembly (Edge, Chrome, Firefox ou Safari atual). Nenhuma posição é enviada a um servidor.

O pacote `stockfish@17.1.0` está fixado no lockfile. `scripts/prepare-engine.mjs`, executado após `npm ci` e antes de desenvolver/compilar, copia apenas a versão lite-single e seus avisos de licença para `public/engine/`. Vite copia esses arquivos para `dist/engine/`. Os binários gerados ficam fora do Git; o GitHub Actions os prepara automaticamente. A versão com múltiplas threads e o motor grande não são publicados.

Em produção, os arquivos são carregados em `/chess-game/engine/stockfish.js` e `/chess-game/engine/stockfish.wasm`; a URL respeita `BASE_URL` e o endereço da página. O worker das dificuldades fácil e média é empacotado pelo Vite em `dist/assets/`.

O Stockfish é distribuído sob **GPLv3**, com seus créditos e licença preservados. O rodapé inclui um link para `engine/NOTICE.txt`, com a revisão exata do código-fonte correspondente e o link de download público do fornecedor. A licença completa fica em `engine/COPYING.txt` e os autores em `engine/AUTHORS.txt`. Preserve esses arquivos, o acesso ao código-fonte correspondente e os avisos ao redistribuir o motor; não o apresente como software proprietário. Os arquivos JS/WASM do motor foram apenas renomeados, sem alteração de conteúdo.

### Publicar a versão 0.2 pelo navegador

1. No GitHub, abra a branch `feature/chess-ai` e escolha **Compare & pull request**, com destino `main`. Alternativamente, use https://github.com/academiaverbum-dev/chess-game/compare/main...feature/chess-ai.
2. Crie o PR e aguarde os testes, a verificação do WASM real e a compilação ficarem verdes na aba **Checks**.
3. Clique em **Merge pull request** e confirme. Não precisa instalar programas nem enviar `node_modules` ou o motor manualmente.
4. Se Pages já publica a versão anterior via GitHub Actions, a configuração permanece igual. Confira **Actions → Testar e publicar no GitHub Pages**: o merge dispara uma nova publicação.
5. Após os jobs ficarem verdes, abra https://academiaverbum-dev.github.io/chess-game/ e atualize com `Ctrl+F5`.
6. Teste os dois modos. Contra o computador, faça `e2 → e4` em cada dificuldade, aguarde a resposta, teste **Desfazer lance** e **Nova partida**. No modo difícil, confira se o motor responde, inclusive no celular. A inspeção em navegador real e a execução de Actions no GitHub são etapas separadas dos testes locais do Codex.

Se a execução falhar, abra o primeiro passo vermelho em **Actions**. A seção abaixo explica como habilitar Pages caso ainda seja necessário.

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

### Verificações realizadas para a versão 0.2

- Instalação limpa com `npm ci`, incluindo preparação automática do motor.
- `npm test`: 29 testes aprovados, incluindo os 12 testes anteriores.
- `npm run test:engine`: Stockfish WASM real inicializou e retornou um movimento legal, validado pela chess.js.
- `npm run build`: TypeScript e compilação Vite aprovados; motor, licença e avisos incluídos em `dist/engine/`.
- Teste do protocolo do worker com endereço `/chess-game/engine/stockfish.js` e caminhos relativos de produção preservados.
- Não houve inspeção visual em navegador real nem execução do workflow no GitHub nesta tarefa. A publicação depende do merge e do sucesso do GitHub Actions.

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
npm run test:engine
npm run build
npm run preview
```

`npm test` executa testes automatizados das regras, da interface e do protocolo/cancelamento dos workers com Vitest e Testing Library. `npm run test:engine` carrega o Stockfish WASM real no Node.js e verifica que ele responde com um movimento legal; isso complementa os testes simulados, sem substituir uma inspeção visual no navegador. `npm run build` verifica os tipos e gera os arquivos estáticos em `dist/`. `npm run preview` permite conferir essa versão em http://localhost:4173.

## Estrutura

- `src/App.tsx`: tabuleiro, seleção, promoção, histórico e controles.
- `src/game.ts`: validação de lances e mensagens de estado usando chess.js.
- `src/ai.ts` e `src/ai.worker.ts`: dificuldades fácil/média e desfazer de turno.
- `src/computer.ts`: ciclo de vida dos workers, protocolo UCI, cancelamento e erros.
- `scripts/prepare-engine.mjs`: prepara o motor e sua licença.
- `public/engine/NOTICE.txt`: créditos e acesso ao código-fonte correspondente.
- `src/style.css`: interface e adaptação para telas menores.
- `src/*.test.ts*`: testes das regras e das interações.
- `vite.config.ts`: configuração do Vite, React e testes.

A chess.js valida turnos, capturas, roque, en passant, promoção e proteção do rei. O jogo informa xeque, xeque-mate e empates por afogamento, material insuficiente, repetição e regra dos 50 lances. Repetição tripla e 50 lances encerram automaticamente a partida conforme a API da biblioteca, sem uma etapa de reivindicação. O histórico usa notação algébrica padrão (SAN: K=rei, Q=dama, R=torre, B=bispo, N=cavalo).

A partida fica apenas na memória: recarregar a página inicia uma nova. Não é necessário configurar contas, chaves ou variáveis de ambiente. A fonte externa é opcional e há fontes de sistema como alternativa.
