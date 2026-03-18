import { Input } from '../../components/ui/Input'

export function BoardSearchBar({ value, onChange }) {
  return (
    <div className="command-bar-search">
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search tasks, descriptions, and labels"
        aria-label="Search tasks"
      />
    </div>
  );
}