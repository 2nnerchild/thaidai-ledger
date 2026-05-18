import { useEffect } from 'react';

export function useCopyProtection(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    const preventDrag = (event: DragEvent) => event.preventDefault();
    const preventShortcut = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const blocked =
        key === 'f12' ||
        (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (event.metaKey && event.altKey && ['i', 'j', 'c'].includes(key)) ||
        ((event.ctrlKey || event.metaKey) && ['s', 'u'].includes(key));

      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('dragstart', preventDrag);
    document.addEventListener('keydown', preventShortcut, true);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('keydown', preventShortcut, true);
    };
  }, [enabled]);
}
