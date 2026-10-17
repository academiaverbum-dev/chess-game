import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "./App";
it("seleciona, destaca destinos, move, alterna turno e desfaz", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(
    within(screen.getByLabelText("Tabuleiro de xadrez")).getAllByRole("button"),
  ).toHaveLength(64);
  await user.click(screen.getByRole("button", { name: "e2, peão branco" }));
  expect(
    screen.getByRole("button", { name: "e4, movimento legal" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "e4, movimento legal" }));
  expect(screen.getByRole("status")).toHaveTextContent("Vez das pretas.");
  expect(
    screen.getByRole("button", { name: "e4, peão branco" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /Desfazer/ }));
  expect(
    screen.getByRole("button", { name: "e2, peão branco" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Vez das brancas.");
});
it("permite escolher a promoção", async () => {
  const user = userEvent.setup();
  render(<App initialFen="7k/P7/8/8/8/8/8/7K w - - 0 1" />);
  await user.click(screen.getByRole("button", { name: "a7, peão branco" }));
  await user.click(screen.getByRole("button", { name: "a8, movimento legal" }));
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: /cavalo/ }),
  );
  expect(
    screen.getByRole("button", { name: "a8, cavalo branco" }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
it("reinicia a partida e limpa o histórico", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "e2, peão branco" }));
  await user.click(screen.getByRole("button", { name: "e4, movimento legal" }));
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
  await user.click(screen.getByRole("button", { name: /Nova partida/ }));
  expect(
    screen.getByRole("button", { name: "e2, peão branco" }),
  ).toBeInTheDocument();
  expect(screen.getByText("0 lances")).toBeInTheDocument();
  confirm.mockRestore();
});
