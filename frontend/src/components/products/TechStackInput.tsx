import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface TechStackInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TechStackInput({ value, onChange }: TechStackInputProps) {
  const [input, setInput] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,/g, '');
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className="min-h-[38px] flex flex-wrap gap-1.5 items-center px-2 py-1.5 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-transparent bg-white">
      {value.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-gray-400 hover:text-gray-600 leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={value.length === 0 ? 'Type and press Enter…' : ''}
        className="flex-1 min-w-[120px] text-sm outline-none bg-transparent placeholder-gray-400"
      />
    </div>
  );
}
