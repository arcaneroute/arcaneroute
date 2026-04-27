export function ShortcutBar() {
  return (
    <box
      borderStyle="single"
      borderColor="#808080"
      padding={1}
      justifyContent="center"
    >
      <text fg="#808080">
        ↑↓ Navigate | Enter Send | Ctrl+C Cancel | Esc Clear
      </text>
    </box>
  );
}