import { useState } from "react";
import { Chess, type Square, type PieceSymbol } from "chess.js";
import { names, play, status } from "./game";
const symbols = {
  w: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};
export default function App({ initialFen }: { initialFen?: string }) {
  const [game] = useState(() => new Chess(initialFen));
  const [, render] = useState(0);
  const [selected, select] = useState<Square | null>(null);
  const [promotion, promote] = useState<{ from: Square; to: Square } | null>(
    null,
  );
  const [flipped, flip] = useState(false);
  const [message, setMessage] = useState("");
  const legal = selected ? game.moves({ square: selected, verbose: true }) : [];
  const history = game.history({ verbose: true });
  const last = history.at(-1);
  const files = (flipped ? "hgfedcba" : "abcdefgh").split("");
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  function refresh() {
    select(null);
    promote(null);
    setMessage("");
    render((n) => n + 1);
  }
  function click(square: Square) {
    if (game.isGameOver() || promotion) return;
    if (selected === square) {
      select(null);
      return;
    }
    const move = legal.find((m) => m.to === square);
    if (selected && move) {
      if (move.isPromotion()) {
        promote({ from: selected, to: square });
        return;
      }
      play(game, selected, square);
      refresh();
      return;
    }
    if (game.get(square)?.color === game.turn()) {
      select(square);
      setMessage("");
    } else {
      setMessage(
        selected
          ? "Movimento inválido. Escolha uma casa destacada."
          : "Selecione uma peça da sua cor.",
      );
    }
  }
  const player = (color: "w" | "b") => (
    <div
      className={`player ${game.turn() === color && !game.isGameOver() ? "active" : ""}`}
    >
      <span className={`avatar ${color}`}>{color === "w" ? "♔" : "♚"}</span>
      <div>
        <strong>Peças {color === "w" ? "brancas" : "pretas"}</strong>
        <small>
          {game.turn() === color && !game.isGameOver()
            ? "Sua vez de jogar"
            : "Jogador " + (color === "w" ? "1" : "2")}
        </small>
      </div>
      <span className="player-dot" />
    </div>
  );
  return (
    <div className="app">
      <header>
        <a className="brand" href="./">
          <span>♞</span> casa<span className="brand-number">64</span>
        </a>
        <span className="header-note">O próximo lance é seu.</span>
        <span className="local-badge">
          <i /> Dois jogadores · Local
        </span>
      </header>
      <main>
        <div className="intro">
          <div>
            <p className="eyebrow">UM TABULEIRO. INFINITAS POSSIBILIDADES.</p>
            <h1>Uma boa partida começa aqui.</h1>
            <p>Escolha uma peça, encontre seu próximo movimento e jogue.</p>
          </div>
          <span className="edition">
            XADREZ CLÁSSICO <span>01 / 01</span>
          </span>
        </div>
        <div className="layout">
          <section className="game-area" aria-label="Partida de xadrez">
            {player(flipped ? "w" : "b")}
            <div className="board-frame">
              <div className="board" aria-label="Tabuleiro de xadrez">
                {ranks.flatMap((rank, ri) =>
                  files.map((file, ci) => {
                    const square = `${file}${rank}` as Square;
                    const piece = game.get(square);
                    const target = legal.some((m) => m.to === square);
                    const check =
                      piece?.type === "k" &&
                      piece.color === game.turn() &&
                      game.isCheck();
                    return (
                      <button
                        key={square}
                        aria-label={`${square}${piece ? `, ${names[piece.type]} ${piece.color === "w" ? "branco" : "preto"}` : ""}${target ? ", movimento legal" : ""}`}
                        aria-pressed={selected === square}
                        onClick={() => click(square)}
                        disabled={!!promotion}
                        className={`square ${(ri + ci) % 2 ? "dark" : "light"} ${selected === square ? "selected" : ""} ${last && (last.from === square || last.to === square) ? "last" : ""} ${check ? "check" : ""}`}
                      >
                        {ci === 0 && <span className="rank">{rank}</span>}
                        {ri === 7 && <span className="file">{file}</span>}
                        {piece && (
                          <span
                            aria-hidden="true"
                            className={`piece ${piece.color}`}
                          >
                            {symbols[piece.color][piece.type]}
                          </span>
                        )}
                        {target && (
                          <span className={`legal ${piece ? "capture" : ""}`} />
                        )}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>
            {player(flipped ? "b" : "w")}
            <div className="board-caption">
              <span>
                <i /> Movimentos legais destacados
              </span>
              <button onClick={() => flip((v) => !v)}>↻ Girar tabuleiro</button>
            </div>
          </section>
          <aside>
            <section className="panel status-panel">
              <p className="eyebrow">A PARTIDA</p>
              <div className="status-title">
                <span className={`turn-disc ${game.turn()}`} />
                <h2>
                  {game.isGameOver()
                    ? "Partida encerrada"
                    : `Vez das ${game.turn() === "w" ? "brancas" : "pretas"}`}
                </h2>
              </div>
              <p role="status" aria-live="polite">
                {status(game)}
              </p>
              <div className="instruction">
                {selected
                  ? `Peça selecionada: ${selected}. Clique em uma casa destacada.`
                  : "Clique em uma peça e depois na casa de destino."}
              </div>
              {message && (
                <p className="feedback" role="alert">
                  {message}
                </p>
              )}
              <div className="actions">
                <button
                  className="primary"
                  onClick={() => {
                    if (
                      !history.length ||
                      window.confirm(
                        "Iniciar uma nova partida? A partida atual será perdida.",
                      )
                    ) {
                      game.reset();
                      refresh();
                    }
                  }}
                >
                  ＋ Nova partida
                </button>
                <button
                  className="secondary"
                  disabled={!history.length || !!promotion}
                  onClick={() => {
                    game.undo();
                    refresh();
                  }}
                >
                  ↶ Desfazer lance
                </button>
              </div>
            </section>
            <section className="panel history-panel">
              <div className="panel-heading">
                <h2>Histórico de lances</h2>
                <span>{history.length} lances</span>
              </div>
              <div className="history-head">
                <span>#</span>
                <span>Brancas</span>
                <span>Pretas</span>
              </div>
              <div className="history-list">
                {history.length ? (
                  Array.from(
                    { length: Math.ceil(history.length / 2) },
                    (_, i) => (
                      <div className="history-row" key={i}>
                        <span>{i + 1}.</span>
                        <span>{history[i * 2].san}</span>
                        <span>{history[i * 2 + 1]?.san ?? "—"}</span>
                      </div>
                    ),
                  )
                ) : (
                  <div className="empty-history">
                    <span>♙</span>
                    <p>O primeiro lance é seu.</p>
                    <small>Os movimentos da partida aparecem aqui.</small>
                  </div>
                )}
              </div>
            </section>
            <section className="tip">
              <span>✧</span>
              <div>
                <strong>Sem pressa. Pense no próximo lance.</strong>
                <p>
                  As brancas começam. Revezem os turnos no mesmo dispositivo e
                  aproveitem a partida.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </main>
      <footer>
        <span>
          casa64 <span>·</span> Feito para quem gosta de pensar.
        </span>
        <span>Regras oficiais · Sem adversário virtual</span>
      </footer>
      {promotion && (
        <div className="overlay">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="promotion-title"
            className="panel promotion"
          >
            <h2 id="promotion-title">Promover peão</h2>
            <p>Escolha a nova peça para concluir o lance.</p>
            <div>
              {(["q", "r", "b", "n"] as PieceSymbol[]).map((type) => (
                <button
                  autoFocus={type === "q"}
                  key={type}
                  onClick={() => {
                    play(game, promotion.from, promotion.to, type);
                    refresh();
                  }}
                >
                  <span className={`piece ${game.turn()}`}>
                    {symbols[game.turn()][type]}
                  </span>
                  {names[type]}
                </button>
              ))}
            </div>
            <button className="secondary" onClick={() => promote(null)}>
              Cancelar
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
