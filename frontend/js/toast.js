/**
 * PS Academy - Global Toast Notification System
 * Provides showToast(message, type) where type = 'error' | 'success' | 'info' | 'warning'
 */

(function () {
  // Inject premium responsive stylesheet
  const css = `
    :root {
      --toast-bg-success: rgba(240, 253, 244, 0.95);
      --toast-border-success: rgba(187, 247, 208, 0.7);
      --toast-text-success: #15803d;
      --toast-icon-success: #16a34a;
      --toast-progress-success: #16a34a;

      --toast-bg-error: rgba(254, 242, 242, 0.95);
      --toast-border-error: rgba(254, 202, 202, 0.7);
      --toast-text-error: #b91c1c;
      --toast-icon-error: #dc2626;
      --toast-progress-error: #dc2626;

      --toast-bg-warning: rgba(255, 251, 235, 0.95);
      --toast-border-warning: rgba(253, 230, 138, 0.7);
      --toast-text-warning: #b45309;
      --toast-icon-warning: #d97706;
      --toast-progress-warning: #d97706;

      --toast-bg-info: rgba(239, 246, 255, 0.95);
      --toast-border-info: rgba(191, 219, 254, 0.7);
      --toast-text-info: #1d4ed8;
      --toast-icon-info: #2563eb;
      --toast-progress-info: #2563eb;
    }

    .dark {
      --toast-bg-success: rgba(20, 83, 45, 0.95);
      --toast-border-success: rgba(34, 197, 94, 0.3);
      --toast-text-success: #bbf7d0;
      --toast-icon-success: #4ade80;
      --toast-progress-success: #4ade80;

      --toast-bg-error: rgba(127, 29, 29, 0.95);
      --toast-border-error: rgba(239, 68, 68, 0.3);
      --toast-text-error: #fecaca;
      --toast-icon-error: #f87171;
      --toast-progress-error: #f87171;

      --toast-bg-warning: rgba(120, 53, 4, 0.95);
      --toast-border-warning: rgba(245, 158, 11, 0.3);
      --toast-text-warning: #fde68a;
      --toast-icon-warning: #fbbf24;
      --toast-progress-warning: #fbbf24;

      --toast-bg-info: rgba(30, 58, 138, 0.95);
      --toast-border-info: rgba(59, 130, 246, 0.3);
      --toast-text-info: #dbeafe;
      --toast-icon-info: #60a5fa;
      --toast-progress-info: #60a5fa;
    }

    .toast-notification {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 14px;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03);
      pointer-events: all;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      opacity: 0;
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1), opacity 0.3s ease;
      max-width: 380px;
      width: 100%;
      box-sizing: border-box;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .toast-success {
      background: var(--toast-bg-success);
      border: 1.5px solid var(--toast-border-success);
      color: var(--toast-text-success);
    }
    .toast-error {
      background: var(--toast-bg-error);
      border: 1.5px solid var(--toast-border-error);
      color: var(--toast-text-error);
    }
    .toast-warning {
      background: var(--toast-bg-warning);
      border: 1.5px solid var(--toast-border-warning);
      color: var(--toast-text-warning);
    }
    .toast-info {
      background: var(--toast-bg-info);
      border: 1.5px solid var(--toast-border-info);
      color: var(--toast-text-info);
    }

    .toast-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      margin: -4px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      transition: opacity 0.2s, background-color 0.2s;
      outline: none;
      flex-shrink: 0;
    }
    .toast-close-btn:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.05);
    }
    .dark .toast-close-btn:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
    .toast-close-btn:focus-visible {
      opacity: 1;
      box-shadow: 0 0 0 2px currentColor;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      transform-origin: left;
      opacity: 0.6;
    }

    /* Desktop layout settings */
    @media (min-width: 641px) {
      #toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 380px;
        width: calc(100vw - 40px);
        pointer-events: none;
      }
      .toast-notification.toast-enter {
        transform: translateX(120%) scale(0.9);
      }
      .toast-notification.toast-active {
        transform: translateX(0) scale(1);
        opacity: 1;
      }
      .toast-notification.toast-exit {
        transform: translateX(120%) scale(0.9);
        opacity: 0;
      }
    }

    /* Mobile layout settings */
    @media (max-width: 640px) {
      #toast-container {
        position: fixed;
        top: 16px;
        left: 16px;
        right: 16px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: calc(100vw - 32px);
        max-width: 100%;
        pointer-events: none;
      }
      .toast-notification {
        max-width: 100%;
      }
      .toast-notification.toast-enter {
        transform: translateY(-40px) scale(0.95);
      }
      .toast-notification.toast-active {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
      .toast-notification.toast-exit {
        transform: translateY(-40px) scale(0.95);
        opacity: 0;
      }
    }
  `;

  // Inject styles immediately
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // Inject toast container once
  function ensureContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  const ICONS = {
    error: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  // Strips raw JSON dumps, SQL errors, and stack traces to produce
  // a clean, human-readable sentence for the user.
  window.cleanErrorMessage = function (raw) {
    if (!raw || typeof raw !== 'string') return 'An unexpected error occurred. Please try again.';

    // Already a short plain sentence — use as-is
    if (raw.length < 200 && !raw.includes('{') && !raw.includes('Error:') && !raw.includes('\n')) {
      return raw;
    }

    // Try to extract message from JSON
    try {
      const obj = JSON.parse(raw);
      if (obj.message) return obj.message;
      if (obj.error)   return obj.error;
      if (obj.msg)     return obj.msg;
    } catch (_) { /* not JSON */ }

    // Strip common Node/SQL prefixes
    const patterns = [
      /Error:\s*/gi,
      /SqlError:\s*/gi,
      /ER_[A-Z_]+:\s*/gi,
      /at\s+\S+\s+\(.*\)/g,   // stack frames
      /\s{2,}/g,               // excess whitespace
    ];
    let cleaned = raw;
    patterns.forEach(p => { cleaned = cleaned.replace(p, ' '); });
    cleaned = cleaned.split('\n')[0].trim(); // first line only

    return cleaned.length > 10
      ? (cleaned.length > 140 ? cleaned.slice(0, 137) + '…' : cleaned)
      : 'An unexpected error occurred. Please try again.';
  };

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {'error'|'success'|'warning'|'info'} type - Toast type
   * @param {number} duration - Auto-dismiss time in ms (default 5000)
   */
  window.showToast = function (message, type = 'info', duration = 5000) {
    const container = ensureContainer();
    const stylePrefix = `toast-${type}`;

    const toast = document.createElement('div');
    toast.className = `toast-notification ${stylePrefix} toast-enter`;

    // Accessibility configuration
    if (type === 'error' || type === 'warning') {
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
    } else {
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
    }

    const iconSvg = ICONS[type] || ICONS.info;

    toast.innerHTML = `
      <div class="toast-icon" style="color: var(--toast-icon-${type}); flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; justify-content: center;">
        ${iconSvg}
      </div>
      <div style="flex: 1; min-width: 0;">
        <p style="margin: 0; font-size: 13px; font-weight: 600; line-height: 1.4; word-break: break-word;">${message}</p>
      </div>
      <button class="toast-close-btn" style="color: var(--toast-icon-${type});" aria-label="Dismiss notification">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="toast-progress" style="background: var(--toast-progress-${type});"></div>
    `;

    container.appendChild(toast);

    // Force reflow and activate entering state
    toast.offsetHeight;
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-active');

    const progressBar = toast.querySelector('.toast-progress');
    const closeBtn = toast.querySelector('.toast-close-btn');

    let remaining = duration;
    let lastTime = performance.now();
    let isHovered = false;
    let animationId = null;

    function animate(now) {
      if (isHovered) {
        lastTime = now;
        animationId = requestAnimationFrame(animate);
        return;
      }

      const delta = now - lastTime;
      lastTime = now;
      remaining -= delta;

      const scale = Math.max(0, remaining / duration);
      progressBar.style.transform = `scaleX(${scale})`;

      if (remaining <= 0) {
        dismiss();
      } else {
        animationId = requestAnimationFrame(animate);
      }
    }

    animationId = requestAnimationFrame(animate);

    function dismiss() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      toast.classList.remove('toast-active');
      toast.classList.add('toast-exit');

      // Remove after transition finishes
      toast.addEventListener('transitionend', function handleTransition(e) {
        if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
          toast.removeEventListener('transitionend', handleTransition);
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }
      });

      // Fallback removal if transitionend does not fire
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 500);
    }

    // Hover listeners to pause/resume dismiss timer
    toast.addEventListener('mouseenter', () => {
      isHovered = true;
    });

    toast.addEventListener('mouseleave', () => {
      isHovered = false;
      lastTime = performance.now();
    });

    // Close button listener
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismiss();
    });
  };

  /**
   * Read URL query params on page load.
   * Unified to display messages via the premium toast system.
   */
  document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);

    const error   = params.get('error');
    const success = params.get('success');
    const warning = params.get('warning');
    const info    = params.get('message');

    function dispatch(rawMsg, type) {
      const msg = window.cleanErrorMessage(decodeURIComponent(rawMsg));
      showToast(msg, type, type === 'error' ? 7000 : 5000);
    }

    if (error)   dispatch(error,   'error');
    if (success) dispatch(success, 'success');
    if (warning) dispatch(warning, 'warning');
    if (info)    dispatch(info,    'info');

    // Clean the URL query params without reloading the page
    if (error || success || warning || info) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  });
})();
