import { useAppEvents } from "../../events/useAppEvents";

export function BudgetPanel() {
  const { state } = useAppEvents();
  const budget = () => state().budget;
  const percentUsed = () => (budget().totalTokens / budget().maxTokens) * 100;
  const turnsRemaining = () => budget().maxTurns - budget().turns;
  const dimColor = "#808080";

  return (
    <box flexDirection="column" borderStyle="rounded" borderColor={dimColor} padding={1}>
      <text fg="#FFFFFF" attributes={1}>Budget</text>
      <box marginTop={1}>
        <text fg={dimColor}>Tokens: {budget().totalTokens.toLocaleString()} / {budget().maxTokens.toLocaleString()}</text>
      </box>
      <box>
        <text fg={dimColor}>Cost: ${budget().estimatedCostUSD.toFixed(4)}</text>
      </box>
      <box>
        <text fg={dimColor}>Turns: {budget().turns} / {budget().maxTurns}</text>
      </box>
      <box marginTop={1}>
        <text fg="#00FF00">{"░".repeat(Math.floor(percentUsed() / 5))}</text>
        <text fg="#444444">{"░".repeat(20 - Math.floor(percentUsed() / 5))}</text>
      </box>
      <box>
        <text fg={dimColor}>{turnsRemaining()} turns remaining</text>
      </box>
    </box>
  );
}