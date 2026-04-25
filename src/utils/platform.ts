export function isAppleOS(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const platform = navigator.platform ?? '';
  if (/Mac|iPhone|iPod|iPad/i.test(platform)) {
    return true;
  }

  return /Mac OS/i.test(navigator.userAgent);
}

export function undoShortcutLabel(): string {
  return isAppleOS() ? '⌘Z' : 'Ctrl+Z';
}

export function redoShortcutLabel(): string {
  return isAppleOS() ? '⇧⌘Z' : 'Ctrl+Shift+Z';
}

export function saveShortcutLabel(): string {
  return isAppleOS() ? '⌘S' : 'Ctrl+S';
}

export function duplicateShortcutLabel(): string {
  return isAppleOS() ? '⌘D' : 'Ctrl+D';
}
