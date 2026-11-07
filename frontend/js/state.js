// CareerPulse AI - Reactive Application State
class AppState {
  constructor() {
    this.user = null;
    this.profile = null;
    this.currentView = 'landing';
    this.theme = localStorage.getItem('careerpulse_theme') || 'light';
    this.listeners = {};
    this.initTheme();
  }

  initTheme() {
    if (this.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('careerpulse_theme', this.theme);
    this.initTheme();
    this.emit('theme:changed', this.theme);
  }

  setUser(user) {
    this.user = user;
    this.emit('user:changed', user);
  }

  setProfile(profile) {
    this.profile = profile;
    this.emit('profile:changed', profile);
  }

  setView(viewName) {
    this.currentView = viewName;
    this.emit('view:changed', viewName);
    window.location.hash = viewName;
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-emerald-600 text-white',
      error: 'bg-rose-600 text-white',
      warning: 'bg-amber-600 text-white',
      info: 'bg-blue-600 text-white'
    };

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg font-medium text-sm transition-all duration-300 transform translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `<span class="text-base font-bold">${icons[type] || '•'}</span><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

const state = new AppState();
window.state = state;

