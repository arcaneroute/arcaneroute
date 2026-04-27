import { BudgetPanel } from "../BudgetPanel/BudgetPanel";
import { MemoryStatus } from "../MemoryStatus/MemoryStatus";
import { SWDStatus } from "../SWDStatus/SWDStatus";

export function Sidebar() {
  const dimColor = "#808080";

  return (
    <box flexDirection="column" width={35} marginLeft={1}>
      <box
        borderStyle="single"
        borderColor="#FF00FF"
        padding={1}
        marginBottom={1}
        justifyContent="center"
        alignItems="center"
      >
        <text fg="#FF00FF" attributes={1}>STATUS</text>
        <text fg={dimColor}> | </text>
        <text fg={dimColor}>●</text>
      </box>

      <BudgetPanel />
      <box marginTop={1}>
        <MemoryStatus />
      </box>
      <box marginTop={1}>
        <SWDStatus />
      </box>
    </box>
  );
}