// Personalized Career Roadmap View
const RoadmapView = {
  timeframe: '90_days', // 30_days, 60_days, 90_days, 6_months, 1_year
  currentRoadmap: null,

  async render() {
    const p = state.profile || {};
    const targetRole = p.career_goal ? p.career_goal.target_role : 'AI/ML Engineer';

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🗺️</span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Personalized Career Roadmap</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Structured progressive curriculum for ${targetRole} with weekly milestones, practice exercises, and verified external resources.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="RoadmapView.generateFresh()" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2">
              <span>⚡</span> Regenerate Roadmap
            </button>
          </div>
        </div>

        <!-- Timeframe Switcher Tabs -->
        <div class="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          ${[
            ['30_days', '30-Day Sprint (4 Weeks)'],
            ['60_days', '60-Day Accelerator (8 Weeks)'],
            ['90_days', '90-Day Placement Prep (12 Weeks)'],
            ['6_months', '6-Month Mastery (24 Weeks)'],
            ['1_year', '1-Year Engineering (52 Weeks)']
          ].map(([id, label]) => `
            <button onclick="RoadmapView.switchTimeframe('${id}')" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${this.timeframe === id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}">
              ${label}
            </button>
          `).join('')}
        </div>

        <!-- Roadmap Content Area -->
        <div id="roadmap-tasks-container" class="space-y-6">
          <div class="p-12 text-center text-slate-400 text-sm">Loading roadmap curriculum...</div>
        </div>
      </div>
    `;
  },

  async switchTimeframe(tf) {
    this.timeframe = tf;
    await this.loadRoadmap();
  },

  async loadRoadmap() {
    const container = document.getElementById('roadmap-tasks-container');
    if (container) {
      container.innerHTML = '<div class="p-12 text-center text-slate-400 text-sm">Loading roadmap...</div>';
    }

    try {
      const res = await api.getCurrentRoadmap(this.timeframe);
      this.currentRoadmap = res;
      if (container) {
        container.innerHTML = this.renderRoadmapContent(res);
      }
    } catch (err) {
      state.showToast(err.message, 'error');
    }
  },

  async generateFresh() {
    const p = state.profile || {};
    const targetRole = p.career_goal ? p.career_goal.target_role : 'AI/ML Engineer';
    state.showToast('Regenerating roadmap curriculum...', 'info');

    try {
      const res = await api.generateRoadmap(targetRole, this.timeframe);
      this.currentRoadmap = res;
      const container = document.getElementById('roadmap-tasks-container');
      if (container) {
        container.innerHTML = this.renderRoadmapContent(res);
      }
      state.showToast('Roadmap updated successfully!', 'success');
    } catch (err) {
      state.showToast(err.message, 'error');
    }
  },

  renderRoadmapContent(rm) {
    const total = rm.total_milestones || 12;
    const completed = rm.completed_milestones || 0;
    const pct = Math.round((completed / total) * 100);

    return `
      <!-- Progress Bar Card -->
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-black text-base text-slate-900 dark:text-white">${rm.target_role} Curriculum</h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              ${completed} of ${total} Milestones Done
            </span>
          </div>
          <div class="w-72 sm:w-96 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full mt-3 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-black text-slate-900 dark:text-white">${pct}%</div>
          <div class="text-xs text-slate-400 font-semibold uppercase">Roadmap Progress</div>
        </div>
      </div>

      <!-- Weekly Timeline Tasks Grid -->
      <div class="space-y-4">
        ${(rm.tasks || []).map(t => `
          <div class="p-6 rounded-3xl border transition-all ${t.is_completed ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'}">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-3">
                <input type="checkbox" ${t.is_completed ? 'checked' : ''} onchange="RoadmapView.toggleTask(${t.id})" class="w-5 h-5 rounded-lg accent-emerald-600 cursor-pointer" />
                <div>
                  <h4 class="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white ${t.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}">
                    ${t.title}
                  </h4>
                  <span class="text-xs text-blue-600 dark:text-blue-400 font-bold">Target: ${t.skill_target}</span>
                </div>
              </div>
              <span class="text-xs font-bold px-2.5 py-1 rounded-lg ${t.is_completed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
                ${t.is_completed ? '✓ Completed' : t.deadline || 'Pending'}
              </span>
            </div>

            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-8">
              ${t.description}
            </p>

            <!-- Resources Links -->
            ${t.resource_links && t.resource_links.length > 0 ? `
              <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 pl-8 flex flex-wrap items-center gap-2">
                <span class="text-[11px] font-bold text-slate-400 uppercase">Verified Resources:</span>
                ${t.resource_links.map(r => `
                  <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:underline flex items-center gap-1">
                    <span>🔗</span> ${r.title} <span class="text-[10px] text-slate-400">(${r.provider})</span>
                  </a>
                `).join('')}
              </div>
            ` : ''}

            <!-- Personal Notes -->
            <div class="mt-3 pl-8 flex items-center gap-2">
              <input type="text" placeholder="Add personal notes or links..." value="${t.notes || ''}" onchange="RoadmapView.saveNotes(${t.id}, this.value)" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 w-full max-w-md focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  async toggleTask(taskId) {
    try {
      const res = await api.toggleRoadmapTask(taskId);
      state.showToast(res.is_completed ? 'Milestone marked completed!' : 'Milestone reopened', 'info');
      await this.loadRoadmap();
    } catch (e) {
      state.showToast(e.message, 'error');
    }
  },

  async saveNotes(taskId, notes) {
    try {
      await api.updateTaskNotes(taskId, notes, null);
      state.showToast('Notes saved', 'success');
    } catch (e) {
      state.showToast(e.message, 'error');
    }
  }
};

window.RoadmapView = RoadmapView;

