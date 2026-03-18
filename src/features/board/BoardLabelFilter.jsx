export function BoardLabelFilter({ labels, activeLabel, onChange }) {
  return (
    <div className="command-bar-labels" role="group" aria-label="Filter tasks by label">
      <button
        type="button"
        className={`label-filter-chip ${activeLabel === 'all' ? 'label-filter-chip-active' : ''}`}
        onClick={() => onChange('all')}
      >
        All
      </button>
      {labels.map((label) => (
        <button
          key={label}
          type="button"
          className={`label-filter-chip ${activeLabel === label ? 'label-filter-chip-active' : ''}`}
          onClick={() => onChange(label)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}