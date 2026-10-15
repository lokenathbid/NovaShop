/**
 * Scroll Lock Manager
 * Safely preserves and restores document body and root element overflow styles.
 * Supports reference counting to prevent multiple modals or overlays from clobbering
 * each other's scroll lock states.
 */

let activeLockCount = 0;
let preservedBodyOverflow = '';
let preservedDocOverflow = '';

export function lockBodyScroll(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  if (activeLockCount === 0) {
    preservedBodyOverflow = document.body.style.overflow;
    preservedDocOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  activeLockCount++;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeLockCount = Math.max(0, activeLockCount - 1);

    if (activeLockCount === 0) {
      document.body.style.overflow = preservedBodyOverflow;
      document.documentElement.style.overflow = preservedDocOverflow;
    }
  };
}

export function restoreBodyScroll(): void {
  if (typeof window === 'undefined') return;

  activeLockCount = 0;
  document.body.style.overflow = preservedBodyOverflow;
  document.documentElement.style.overflow = preservedDocOverflow;
}
