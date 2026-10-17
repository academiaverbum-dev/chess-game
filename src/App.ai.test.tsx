import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import App from "./App";
import { computerMove } from "./computer";
vi.mock("./computer", () => ({ computerMove: vi.fn() }));
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
async function start() {
  const user = userEvent.setup();
  render(<App />);
  await user.selectOptions(screen.getByLabelText("Modo de jogo"), "computer");
  await user.click(screen.getByRole("button", { name: "e2, peão branco" }));
  await user.click(screen.getByRole("button", { name: "e4, movimento legal" }));
  return user;
}
it("mostra pensamento, bloqueia pretas, responde e desfaz o turno completo", async () => {
  let reply!: (move: string) => void;
  vi.mocked(computerMove).mockImplementation(
    () =>
      new Promise((resolve) => {
        reply = resolve;
      }),
  );
  const user = await start();
  expect(screen.getByRole("button", { name: "e7, peão preto" })).toBeDisabled();
  await waitFor(() => expect(computerMove).toHaveBeenCalledOnce());
  expect(screen.getByRole("status")).toHaveTextContent("pensando");
  await act(async () => reply("e7e5"));
  expect(screen.getByRole("button", { name: "e5, peão preto" })).toBeEnabled();
  await user.click(screen.getByRole("button", { name: /Desfazer/ }));
  expect(screen.getByText("0 lances")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "e2, peão branco" }),
  ).toBeInTheDocument();
});
it("desfazer cancela resposta pendente e ignora lance atrasado", async () => {
  let reply!: (move: string) => void;
  let signal!: AbortSignal;
  vi.mocked(computerMove).mockImplementation((_fen, _difficulty, s) => {
    signal = s;
    return new Promise((resolve) => {
      reply = resolve;
    });
  });
  const user = await start();
  await waitFor(() => expect(computerMove).toHaveBeenCalledOnce());
  await user.click(screen.getByRole("button", { name: /Desfazer/ }));
  expect(signal.aborted).toBe(true);
  await act(async () => reply("e7e5"));
  expect(screen.getByText("0 lances")).toBeInTheDocument();
});
it("nova partida mantém modo e dificuldade e cancela o cálculo", async () => {
  vi.mocked(computerMove).mockImplementation(() => new Promise(() => {}));
  vi.spyOn(window, "confirm").mockReturnValue(true);
  const user = await start();
  await waitFor(() => expect(computerMove).toHaveBeenCalledOnce());
  await user.click(screen.getByRole("button", { name: /Nova partida/ }));
  expect(screen.getByLabelText("Modo de jogo")).toHaveValue("computer");
  expect(screen.getByLabelText("Dificuldade")).toHaveValue("easy");
  expect(screen.getByText("0 lances")).toBeInTheDocument();
});
it("erro do motor permite tentar novamente", async () => {
  vi.mocked(computerMove)
    .mockRejectedValueOnce(new Error("Falha no motor"))
    .mockResolvedValueOnce("e7e5");
  const user = await start();
  expect(await screen.findByRole("alert")).toHaveTextContent("Falha no motor");
  await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "e5, peão preto" }),
    ).toBeInTheDocument(),
  );
});
it("trocar dificuldade confirma, reinicia e mantém o modo local disponível", () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  render(<App />);
  fireEvent.change(screen.getByLabelText("Modo de jogo"), {
    target: { value: "computer" },
  });
  fireEvent.change(screen.getByLabelText("Dificuldade"), {
    target: { value: "hard" },
  });
  expect(screen.getByLabelText("Dificuldade")).toHaveValue("hard");
  fireEvent.change(screen.getByLabelText("Modo de jogo"), {
    target: { value: "local" },
  });
  expect(screen.queryByLabelText("Dificuldade")).not.toBeInTheDocument();
});
it("não solicita resposta depois de o humano dar xeque-mate", async () => {
  vi.mocked(computerMove)
    .mockResolvedValueOnce("e7e5")
    .mockResolvedValueOnce("b8c6")
    .mockResolvedValueOnce("g8f6");
  const user = await start();
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "e5, peão preto" }),
    ).toBeEnabled(),
  );
  await user.click(screen.getByRole("button", { name: "d1, dama branco" }));
  await user.click(screen.getByRole("button", { name: "h5, movimento legal" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "c6, cavalo preto" }),
    ).toBeEnabled(),
  );
  await user.click(screen.getByRole("button", { name: "f1, bispo branco" }));
  await user.click(screen.getByRole("button", { name: "c4, movimento legal" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "f6, cavalo preto" }),
    ).toBeEnabled(),
  );
  await user.click(screen.getByRole("button", { name: "h5, dama branco" }));
  await user.click(
    screen.getByRole("button", { name: "f7, peão preto, movimento legal" }),
  );
  expect(screen.getByRole("status")).toHaveTextContent("Xeque-mate");
  expect(computerMove).toHaveBeenCalledTimes(3);
});
