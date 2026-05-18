type TagVariant = 'sale' | 'purchase' | 'vat' | 'deduct' | 'neutral';

interface TagProps {
  label: string;
  variant?: TagVariant;
}

const variantStyles: Record<TagVariant, string> = {
  sale:     'bg-deep-blue text-white',
  purchase: 'bg-walnut text-cream',
  vat:      'bg-burnt-orange text-white',
  deduct:   'bg-red-warn text-white',
  neutral:  'bg-cream-dark text-black-ink border border-grey-border',
};

export function Tag({ label, variant = 'neutral' }: TagProps) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-mono font-medium ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}
