// Authentication View Modal & Handlers
const AuthView = {
  mode: 'login', // 'login' or 'register'

  open(mode = 'login') {
    this.mode = mode;
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.innerHTML = this.renderContent();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  close() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  renderContent() {
    return `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-scale-up">
          <!-- Close button -->
          <button onclick="AuthView.close()" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">
            ✕
          </button>

          <div class="text-center mb-6">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-lg shadow-blue-500/25">
              CP
            </div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">
              ${this.mode === 'login' ? 'Welcome Back' : 'Create Student Account'}
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ${this.mode === 'login' ? 'Sign in to access your centralized career portfolio' : 'Start your personalized AI-driven career path'}
            </p>
          </div>

          <form onsubmit="AuthView.handleSubmit(event)" class="space-y-4">
            ${this.mode === 'register' ? `
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Full Name</label>
                <input type="text" id="auth-name" required placeholder="Alex Sharma" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            ` : ''}

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Email Address</label>
              <input type="email" id="auth-email" required placeholder="alex@example.com" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Password</label>
              <input type="password" id="auth-password" required placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <button type="submit" id="auth-submit-btn" class="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all">
              ${this.mode === 'login' ? 'Sign In to Dashboard' : 'Register Account'}
            </button>
          </form>

          <!-- Quick Demo Buttons -->
          <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-3">Quick Demo Access</p>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="AuthView.quickDemoStudent()" class="py-2.5 px-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                🎓 Demo Student
              </button>
              <button onclick="AuthView.quickDemoAdmin()" class="py-2.5 px-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                ⚙️ Admin Portal
              </button>
            </div>
          </div>

          <div class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            ${this.mode === 'login' ? `
              Don't have an account? <button onclick="AuthView.open('register')" class="text-blue-600 font-bold hover:underline">Register here</button>
            ` : `
              Already registered? <button onclick="AuthView.open('login')" class="text-blue-600 font-bold hover:underline">Sign in</button>
            `}
          </div>
        </div>
      </div>
    `;
  },

  async handleSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const btn = document.getElementById('auth-submit-btn');

    btn.disabled = true;
    btn.innerText = 'Authenticating...';

    try {
      let resp;
      if (this.mode === 'register') {
        const fullName = document.getElementById('auth-name').value.trim();
        resp = await api.register({ email, password, full_name: fullName });
      } else {
        resp = await api.login({ email, password });
      }

      api.setToken(resp.access_token);
      state.setUser(resp);
      
      const profile = await api.getProfile();
      state.setProfile(profile);

      state.showToast(`Welcome back, ${resp.full_name}!`, 'success');
      this.close();

      if (resp.role === 'admin') {
        state.setView('admin');
      } else {
        state.setView('dashboard');
      }
    } catch (err) {
      state.showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = this.mode === 'login' ? 'Sign In to Dashboard' : 'Register Account';
    }
  },

  async quickDemoStudent() {
    this.open('login');
    document.getElementById('auth-email').value = 'student@example.com';
    document.getElementById('auth-password').value = 'StudentPassword123!';
    const form = document.querySelector('#auth-modal form');
    if (form) {
      const event = new Event('submit', { cancelable: true });
      this.handleSubmit(event);
    }
  },

  async quickDemoAdmin() {
    this.open('login');
    document.getElementById('auth-email').value = 'admin@careerpulse.ai';
    document.getElementById('auth-password').value = 'AdminSecurePassword123!';
    const form = document.querySelector('#auth-modal form');
    if (form) {
      const event = new Event('submit', { cancelable: true });
      this.handleSubmit(event);
    }
  }
};

window.AuthView = AuthView;

