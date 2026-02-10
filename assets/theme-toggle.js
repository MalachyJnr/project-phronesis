// Dark mode toggle functionality
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  if (newTheme === 'dark') {
    html.classList.add('dark');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = 'light_mode';
  } else {
    html.classList.remove('dark');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = 'dark_mode';
  }
  
  // Save preference to localStorage
  localStorage.setItem('theme', newTheme);
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const html = document.documentElement;
  
  if (savedTheme === 'dark') {
    html.classList.add('dark');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = 'light_mode';
  } else {
    html.classList.remove('dark');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = 'dark_mode';
  }
});
