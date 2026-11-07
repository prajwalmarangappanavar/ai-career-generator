// Intelligent Skill-Gap Analysis View with Interactive Chart.js Radar
const SkillGapView = {
  roles: [],
  selectedRoleId: null,
  currentReport: null,
  radarChartInstance: null,

  async render() {
    this.roles = await api.getCareerRoles();
    const p = state.profile || {};
    const targetTitle = p.career_goal ? p.career_goal.target_role : 'AI/ML Engineer';

    const defaultRole = this.roles.find(r => r.title.toLowerCase() === targetTitle.toLowerCase()) || this.roles[0];
    this.selectedRoleId = defaultRole ? defaultRole.id : null;

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">📊</span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Intelligent Skill-Gap Analysis</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Evaluates your centralized skills against verified industry role frameworks, identifying missing proficiencies and recommended learning sequences.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a href="${api.getSkillGapPdfUrl()}" target="_blank" class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center gap-2">
              <span>📥</span> Download PDF Report
            </a>
            <button onclick="SkillGapView.runAnalysis()" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all">
              ⚡ Run Analysis
            </button>
          </div>
        </div>

        <!-- Target Role Selection Bar -->
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <label class="text-xs font-extrabold uppercase text-slate-400">Select Target Career Role:</label>
            <select id="gap-role-select" onchange="SkillGapView.onRoleChange(this.value)" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              ${this.roles.map(r => `
                <option value="${r.id}" ${r.id === this.selectedRoleId ? 'selected' : ''}>${r.title} (${r.category})</option>
              `).join('')}
            </select>
          </div>
          <div class="text-xs text-slate-500">
            Comparing against <span class="font-bold text-slate-700 dark:text-slate-300">Profile Version ${p.current_version || 1}</span>
          </div>
        </div>

        <!-- Dynamic Analysis Container -->
        <div id="skill-gap-results" class="space-y-8">
          <div class="p-12 text-center text-slate-400 text-sm">
            Loading role framework analysis...
          </div>
        </div>
      </div>
    `;
  },

  async onRoleChange(roleId) {
    this.selectedRoleId = parseInt(roleId, 10);
    await this.runAnalysis();
  },

  async runAnalysis() {
    const container = document.getElementById('skill-gap-results');
    if (container) {
      container.innerHTML = '<div class="p-12 text-center text-slate-400 text-sm">Analyzing skills against industry framework...</div>';
    }

    try {
      const res = await api.analyzeSkillGap(this.selectedRoleId);
      this.currentReport = res;
      if (container) {
        container.innerHTML = this.renderReport(res);
        this.renderRadarChart(res.radar_chart_data);
      }
    } catch (err) {
      state.showToast(err.message, 'error');
    }
  },

  renderReport(r) {
    const matched = r.existing_skills || [];
    const improved = r.improvement_skills || [];
    const missing = r.missing_skills || [];

    return `
      <!-- Top Overview Row: Score Card & Radar Chart -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Compatibility Card -->
        <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase text-slate-400 tracking-wider">Overall Match</span>
              <span class="px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                ${r.target_role}
              </span>
            </div>

            <div class="flex items-baseline gap-3 my-6">
              <div class="text-6xl font-black text-slate-900 dark:text-white">${r.overall_match_score}%</div>
              <div class="text-xs font-semibold text-emerald-600">
                ${r.overall_match_score >= 80 ? 'High Competency' : r.overall_match_score >= 60 ? 'Moderate Foundation' : 'Requires Growth'}
              </div>
            </div>

            <p class="text-xs text-slate-500 leading-relaxed">
              Calculated across essential, important, and nice-to-have skill proficiencies required for ${r.target_role}.
            </p>
          </div>

          <div class="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div>
              <div class="text-lg font-black text-emerald-600">${matched.length}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase">Matched</div>
            </div>
            <div>
              <div class="text-lg font-black text-amber-500">${improved.length}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase">Improve</div>
            </div>
            <div>
              <div class="text-lg font-black text-rose-500">${missing.length}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase">Missing</div>
            </div>
          </div>
        </div>

        <!-- Radar Chart Container (2 cols) -->
        <div class="lg:col-span-2 p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Multi-Axis Competency Radar</h3>
            <span class="text-xs text-slate-400">Student vs Target Level</span>
          </div>
          <div class="relative h-64 sm:h-72 w-full flex items-center justify-center">
            <canvas id="radar-canvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Recommended Learning Sequence -->
      <div class="p-7 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700">
        <h3 class="text-base font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <span>🎯</span> Recommended Learning Sequence
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${(r.learning_sequence || []).map(seq => `
            <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span class="text-blue-600 font-bold">→</span> ${seq}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Detailed Breakdown Tables -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 1. Matched Proficient Skills -->
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Matched Skills (${matched.length})
            </h4>
          </div>
          <div class="space-y-3">
            ${matched.map(s => `
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div class="font-bold text-xs text-slate-900 dark:text-white">${s.skill_name}</div>
                  <div class="text-[10px] text-slate-400">Target: ${s.required_proficiency}/5 • Yours: ${s.student_proficiency}/5</div>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Ready
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 2. Skills Needing Improvement -->
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span> Need Improvement (${improved.length})
            </h4>
          </div>
          <div class="space-y-3">
            ${improved.map(s => `
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-slate-900 dark:text-white">${s.skill_name}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    ${s.priority_level.toUpperCase()}
                  </span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Current: ${s.student_proficiency}/5</span>
                  <span>Required: ${s.required_proficiency}/5</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-amber-500 h-full" style="width: ${(s.student_proficiency / s.required_proficiency) * 100}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3. Critical Missing Skills -->
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span> Missing Skills (${missing.length})
            </h4>
          </div>
          <div class="space-y-3">
            ${missing.map(s => `
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div class="font-bold text-xs text-slate-900 dark:text-white">${s.skill_name}</div>
                  <div class="text-[10px] text-slate-400">Target: Level ${s.required_proficiency}/5</div>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  ${s.priority_level.toUpperCase()}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  renderRadarChart(data) {
    const canvas = document.getElementById('radar-canvas');
    if (!canvas || !window.Chart) return;

    if (this.radarChartInstance) {
      this.radarChartInstance.destroy();
    }

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const textColor = isDark ? '#94A3B8' : '#64748B';

    this.radarChartInstance = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Your Current Proficiency',
            data: data.student_scores,
            backgroundColor: 'rgba(59, 130, 246, 0.25)',
            borderColor: '#3B82F6',
            pointBackgroundColor: '#3B82F6',
            borderWidth: 2
          },
          {
            label: 'Industry Target Requirement',
            data: data.target_scores,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderColor: '#6366F1',
            pointBackgroundColor: '#6366F1',
            borderWidth: 2,
            borderDash: [4, 4]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: gridColor },
            grid: { color: gridColor },
            pointLabels: {
              color: textColor,
              font: { size: 10, weight: 'bold' }
            },
            ticks: { display: false, max: 100, min: 0 }
          }
        },
        plugins: {
          legend: {
            labels: { color: textColor, font: { size: 11, weight: 'bold' } }
          }
        }
      }
    });
  }
};

window.SkillGapView = SkillGapView;

