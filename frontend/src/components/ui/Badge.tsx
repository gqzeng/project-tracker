interface BadgeProps {
  label: string;
  bg: string;
  text: string;
  icon?: string;
  size?: 'sm' | 'xs';
}

export function Badge({ label, bg, text, icon, size = 'sm' }: BadgeProps) {
  const padding = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${padding} ${bg} ${text}`}>
      {icon && <span className="leading-none">{icon}</span>}
      {label}
    </span>
  );
}
