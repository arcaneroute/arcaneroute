export function StatusBar() {
  const dimColor = "#808080";

  return (
    <box
      borderStyle="single"
      borderColor={dimColor}
      padding={1}
      marginTop={1}
      justifyContent="center"
    >
      <text fg={dimColor}>
        ↑↓ Navigate | Enter Send | Shift+Enter Newline | Ctrl+C Cancel
      </text>
    </box>
  );
}