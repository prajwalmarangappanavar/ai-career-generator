// CareerPulse AI - Main Application Router & Shell Controller
class Application {
  constructor() {
    this.sidebarOpen = false;
  }

  async init() {
    console.log('CareerPulse AI initializing...');

    // Theme setup
    state.on('theme:changed', () => this.updateThemeUI());

    // Routing listener
    state.on('view:changed', (view) => this.renderView(view));

    // Session expired listener
    window.addEventListener('auth:expired', () => {
      state.setUser(null);
      state.setProfile(null);
      this.updateNavigationUI();
      state.setView('landing');
      state.showToast('Your session expired. Please log in again.', 'warning');
    });

    // Check existing auth token
    const token = api.getToken();
    if (token) {
      try {
        const user = await api.getMe();
        state.setUser(user);
        const profile = await api.getProfile();
        state.setProfile(profile);

        const hash = window.location.hash.replace('#', '') || (user.role === 'admin' ? 'admin' : 'dashboard');
        state.setView(hash);
      } catch (err) {
        console.warn('Auto-login failed, falling back to landing view:', err);
        api.setToken(null);
        state.setView('landing');
      }
    } else {
      const hash = window.location.hash.replace('#', '') || 'landing';
      state.setView(hash);
    }

    this.updateNavigationUI();
  }

  updateThemeUI() {
    // any extra theme tweaks if needed
  }

  updateNavigationUI() {
    const isAuth = !!state.user;
    const sidebar = document.getElementById('app-sidebar');
    const userBar = document.getElementById('user-profile-bar');
    const navItems = document.getElementById('nav-items-container');

    if (sidebar) {
      if (isAuth && state.currentView !== 'landing') {
        sidebar.classList.remove('hidden');
      } else {
        sidebar.classList.add('hidden');
      }
    }

    if (userBar && isAuth) {
      userBar.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
            ${state.user.full_name ? state.user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div class="overflow-hidden">
            <div class="font-bold text-xs truncate text-slate-900 dark:text-white">${state.user.full_name}</div>
            <div class="text-[10px] text-slate-400 capitalize">${state.user.role}</div>
          </div>
        </div>
        <button onclick="app.logout()" class="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors" title="Logout">
          🚪
        </button>
      `;
    }

    // Render nav links based on role
    if (navItems && isAuth) {
      const isAdmin = state.user.role === 'admin';
      const items = isAdmin ? [
        ['admin', '⚙️ Admin Portal'],
        ['dashboard', '📊 Student View'],
        ['skill-gap', '🎯 Role Frameworks'],
        ['reports', '📥 System Exports']
      ] : [
        ['dashboard', '📊 Dashboard'],
        ['profile', '👤 My Profile (SSOT)'],
        ['career-analysis', '✨ Career Analysis'],
        ['skill-gap', '🎯 Skill Gap'],
        ['roadmap', '🗺️ Learning Roadmap'],
        ['resume-builder', '📄 ATS Resume Builder'],
        ['cover-letter', '✉️ Cover Letter'],
        ['interview-prep', '💡 Interview Bank'],
        ['mock-interview', '🎙️ Mock Interview'],
        ['job-matcher', '🔍 Job Matcher'],
        ['projects', '💡 Project Ideas'],
        ['chatbot', '🤖 AI Counselor'],
        ['reports', '📥 Export Center']
      ];

      navItems.innerHTML = items.map(([id, label]) => `
        <button onclick="state.setView('${id}')" class="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2.5 ${state.currentView === id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'}">
          ${label}
        </button>
      `).join('');
    }
  }

  async renderView(viewName) {
    this.updateNavigationUI();
    const content = document.getElementById('main-content');
    if (!content) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Ensure protected views require auth
    const publicViews = ['landing'];
    if (!publicViews.includes(viewName) && !state.user) {
      AuthView.open('login');
      return;
    }

    switch (viewName) {
      case 'landing':
        content.innerHTML = LandingView.render();
        break;
      case 'dashboard':
        content.innerHTML = await DashboardView.render();
        break;
      case 'profile':
        content.innerHTML = await ProfileView.render();
        break;
      case 'career-analysis':
        content.innerHTML = await CareerAnalysisView.render();
        break;
      case 'skill-gap':
        content.innerHTML = await SkillGapView.render();
        setTimeout(() => SkillGapView.runAnalysis(), 50);
        break;
      case 'roadmap':
        content.innerHTML = await RoadmapView.render();
        setTimeout(() => RoadmapView.loadRoadmap(), 50);
        break;
      case 'resume-builder':
        content.innerHTML = await ResumeBuilderView.render();
        setTimeout(() => ResumeBuilderView.loadResume(), 50);
        break;
      case 'cover-letter':
        content.innerHTML = await CoverLetterView.render();
        break;
      case 'interview-prep':
        content.innerHTML = await InterviewPrepView.render();
        setTimeout(() => InterviewPrepView.loadQuestions(), 50);
        break;
      case 'mock-interview':
        content.innerHTML = await MockInterviewView.render();
        setTimeout(() => MockInterviewView.loadHistory(), 50);
        break;
      case 'job-matcher':
        content.innerHTML = await JobMatcherView.render();
        break;
      case 'projects':
        content.innerHTML = await ProjectsView.render();
        setTimeout(() => ProjectsView.loadProjects(), 50);
        break;
      case 'chatbot':
        content.innerHTML = await ChatbotView.render();
        break;
      case 'reports':
        content.innerHTML = ReportsView.render();
        break;
      case 'admin':
        content.innerHTML = await AdminView.render();
        setTimeout(() => {
          AdminView.loadStats();
          AdminView.loadUsers();
        }, 50);
        break;
      default:
        content.innerHTML = LandingView.render();
    }
  }

  logout() {
    api.setToken(null);
    state.setUser(null);
    state.setProfile(null);
    state.showToast('You have been logged out.', 'info');
    this.updateNavigationUI();
    state.setView('landing');
  }

  toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('hidden');
    }
  }
}

const app = new Application();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

