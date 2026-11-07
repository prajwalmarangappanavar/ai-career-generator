// Portfolio Project Recommendation Engine View
const ProjectsView = {
  projects: [],

  async render() {
    const p = state.profile || {};
    const defaultRole = p.career_goal ? p.career_goal.target_role : 'Full-Stack Software Developer';

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">💡</span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Practical Project Recommendations</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Portfolio-grade projects specifically tailored to close your skill-gaps and impress technical recruiters for ${defaultRole}.
            </p>
          </div>
        </div>

        <!-- Project Grid -->
        <div id="projects-feed" class="space-y-6">
          <div class="p-12 text-center text-slate-400 text-sm">Loading curated project briefs...</div>
        </div>
      </div>
    `;
  },

  async loadProjects() {
    const feed = document.getElementById('projects-feed');
    if (!feed) return;

    try {
      this.projects = await api.getProjectRecommendations();
      feed.innerHTML = this.renderProjectCards(this.projects);
    } catch (e) {
      state.showToast(e.message, 'error');
    }
  },

  renderProjectCards(projs) {
    if (!projs || projs.length === 0) {
      return '<div class="p-8 text-center text-slate-400 text-sm">No project recommendations found.</div>';
    }

    return projs.map(pj => `
      <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-black text-slate-900 dark:text-white">${pj.title}</h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${pj.difficulty === 'Advanced' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : pj.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}">
              ${pj.difficulty}
            </span>
          </div>
          <button onclick="ProjectsView.adopt('${pj.title.replace(/'/g, "\\'")}')" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 w-fit">
            <span>+</span> Add to My Profile
          </button>
        </div>

        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          ${pj.description}
        </p>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs">
          <span class="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Problem Statement:</span>
          <span class="text-slate-700 dark:text-slate-300">${pj.problem_statement}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span class="font-bold text-slate-400 uppercase text-[10px] block mb-1">Technologies Required:</span>
            <span class="font-semibold text-blue-600 dark:text-blue-400">${pj.technologies}</span>
          </div>
          <div>
            <span class="font-bold text-slate-400 uppercase text-[10px] block mb-1">Expected Deliverable:</span>
            <span class="text-slate-700 dark:text-slate-300">${pj.expected_outcome}</span>
          </div>
        </div>

        ${pj.milestones && pj.milestones.length > 0 ? `
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span class="font-bold text-slate-400 uppercase text-[10px] block mb-2">Implementation Phases:</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${pj.milestones.map(m => `
                <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span class="text-blue-600 font-bold">✓</span> ${m}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  async adopt(title) {
    try {
      state.showToast('Adding project to centralized profile...', 'info');
      const res = await api.adoptProject(title);
      state.showToast(res.message, 'success');
      // Refresh profile state
      const prof = await api.getProfile();
      state.setProfile(prof);
    } catch (e) {
      state.showToast(e.message, 'error');
    }
  }
};

window.ProjectsView = ProjectsView;

