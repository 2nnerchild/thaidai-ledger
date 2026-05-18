import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      <div className="absolute inset-0 bg-black-ink/60" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4 mt-16 mb-8 bg-cream border-2 border-walnut-dark shadow-flat-lg overflow-y-auto max-h-[80vh]">
        <div className="flex items-center justify-between px-4 py-3 bg-deep-blue border-b-2 border-walnut-dark sticky top-0">
          <h2 className="font-display text-cream text-base">{title}</h2>
          <button
            onClick={onClose}
            className="text-cream-dark hover:text-white font-mono text-lg leading-none cursor-pointer"
            aria-label="닫기"
          >
            X
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
