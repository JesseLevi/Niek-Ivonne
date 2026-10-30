// Rolluik = dark-mode-schakelaar (docs/concept.md › Interacties).
// Slepen aan de greep (touch en muis), tikken/klikken op het glas, of met het toetsenbord.
// Dicht = nacht. De keuze wordt bewaard; zonder keuze volgt de site prefers-color-scheme.

export const THEME_STORAGE_KEY = 'ni-theme';

type Theme = 'light' | 'dark';

/** Rolluikstand in % van de canvashoogte (zie Window.astro). */
const OPEN = -61.6;
const NIGHT = -23.4;
const DRAG_THRESHOLD = 4; // px; minder = een tik

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function setTheme(theme: Theme, remember = true): void {
  document.documentElement.dataset.theme = theme;
  if (!remember) return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Opslag uit: dan geldt de keuze alleen voor deze pagina.
  }
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function initShade(win: HTMLElement): void {
  if (win.dataset.shadeReady) return;
  win.dataset.shadeReady = '';
  const button = win.querySelector<HTMLButtonElement>('[data-shade-toggle]');
  const handle = win.querySelector<HTMLElement>('[data-shade-handle]');
  if (!button || !handle) return;

  const apply = (value: number) => {
    win.style.setProperty('--shade', `${value}%`);
    win.style.setProperty('--shade-fraction', String(value / -OPEN));
  };

  const reflect = () => {
    const theme = currentTheme();
    const dark = theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', (dark ? button.dataset.labelOpen : button.dataset.labelClose) ?? '');
    apply(dark ? NIGHT : OPEN);
  };

  const choose = (theme: Theme) => {
    setTheme(theme);
    reflect();
  };

  reflect();

  // Systeeminstelling volgen zolang er geen eigen keuze is.
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (storedTheme()) return;
    setTheme(event.matches ? 'dark' : 'light', false);
    reflect();
  });

  // Slepen
  let start: { y: number; value: number; height: number } | null = null;
  let dragged = false;
  let value = currentTheme() === 'dark' ? NIGHT : OPEN;

  handle.addEventListener('pointerdown', (event) => {
    start = { y: event.clientY, value: currentTheme() === 'dark' ? NIGHT : OPEN, height: button.clientHeight };
    dragged = false;
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener('pointermove', (event) => {
    if (!start) return;
    const dy = event.clientY - start.y;
    if (!dragged && Math.abs(dy) < DRAG_THRESHOLD) return;
    dragged = true;
    win.classList.add('is-dragging');
    value = Math.min(Math.max(start.value + (dy / start.height) * -OPEN, OPEN), 0);
    apply(value);
  });

  const release = () => {
    if (!start) return;
    start = null;
    win.classList.remove('is-dragging');
    if (dragged) choose(value > (OPEN + NIGHT) / 2 ? 'dark' : 'light');
  };
  handle.addEventListener('pointerup', release);
  handle.addEventListener('pointercancel', release);

  // Tik of klik (en Enter/Spatie): wisselen. Na slepen niet nog eens.
  button.addEventListener('click', () => {
    if (dragged) {
      dragged = false;
      return;
    }
    choose(currentTheme() === 'dark' ? 'light' : 'dark');
  });

  button.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') choose('dark');
    else if (event.key === 'ArrowUp') choose('light');
    else return;
    event.preventDefault();
  });
}
