import { useState } from 'react';
import {Input} from '../../components/ui/Input'
export function EditableText({ value, onSave, as = 'span', className = '', inputClassName = '', ...props }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== value) {
      onSave(editValue.trim());
    } else {
      setEditValue(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onChange={e => setEditValue(e.target.value)}
        autoFocus
        className={inputClassName}
        {...props}
      />
    );
  }

  const ViewTag = as;
  return (
    <ViewTag
      className={className}
      tabIndex={0}
      onClick={() => setIsEditing(true)}
      onFocus={() => setIsEditing(true)}
      {...props}
    >
      {value}
    </ViewTag>
  );
}