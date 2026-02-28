interface ColorDotProps {
  dotClass: string;
  ringClass?: string;
  size?: 'sm' | 'md';
  title?: string;
}

export function ColorDot({ dotClass, ringClass, size = 'sm', title }: ColorDotProps) {
  const sz = size === 'md' ? 'w-3 h-3' : 'w-2.5 h-2.5';
  return (
    <span
      title={title}
      className={`inline-block rounded-full flex-shrink-0 ${sz} ${dotClass} ${ringClass ? `ring-2 ${ringClass}` : ''}`}
    />
  );
}
