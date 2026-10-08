// Theme & Font Size Preferences Manager

function applyAppTheme(themeMode) {
  const html = document.documentElement;
  const mode = themeMode || localStorage.getItem('appTheme') || 'system';
  
  let isDark = false;
  if (mode === 'dark') {
    isDark = true;
  } else if (mode === 'light') {
    isDark = false;
  } else {
    // System Default
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  if (isDark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }

  localStorage.setItem('appTheme', mode);

  // Update Settings UI if element exists
  const themeLabel = document.getElementById('current-theme-label');
  if (themeLabel) {
    const labels = { light: 'Light', dark: 'Dark', system: 'System' };
    themeLabel.textContent = labels[mode] || 'System';
  }
}

function applyAppFontSize(size) {
  const html = document.documentElement;
  const fontSize = size || localStorage.getItem('appFontSize') || 'medium';

  const fontSizes = {
    small: '14px',
    medium: '16px',
    large: '18px'
  };

  html.style.fontSize = fontSizes[fontSize] || '16px';
  localStorage.setItem('appFontSize', fontSize);

  // Update Settings UI if element exists
  const fontLabel = document.getElementById('current-font-size-label');
  if (fontLabel) {
    const labels = { small: 'Small', medium: 'Medium', large: 'Large' };
    fontLabel.textContent = labels[fontSize] || 'Medium';
  }
}

// Synchronously apply preferences immediately
(function initImmediatePreferences() {
  applyAppTheme();
  applyAppFontSize();
})();

// Re-sync on DOM ready and attach system theme change listener
document.addEventListener('DOMContentLoaded', function() {
  applyAppTheme();
  applyAppFontSize();

  // Listen for OS system theme changes if set to system
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
    const mode = localStorage.getItem('appTheme') || 'system';
    if (mode === 'system') {
      applyAppTheme('system');
    }
  });
});
