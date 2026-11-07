// Student Dashboard View
const DashboardView = {
  async render() {
    const p = state.profile || {};
    const u = state.user || {};

    const completion = p.completion_percentage || 25;
    const readiness = p.career_readiness_score || 30;
    const targetRole = p.career_goal ? p.career_goal.target_role : 'AI/ML Engineer';

    return `
      <div class="space-y-8 animate-fade-in">
        <!-- Welcome Hero Banner -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-8 sm:p-10 shadow-xl shadow-blue-500/15">
          <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="max-w-2xl">
              <span class="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 backdrop-blur-md">
                🎓 Candidate Overview • Target Role: ${targetRole}
              </span>
              <h1 class="text-3xl sm:text-4xl font-black tracking-tight">
                Welcome back, ${u.full_name || 'Alex'}!
              </h1>
              <p class="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
                ${p.headline || 'Final Year Computer Science Student preparing for placement and engineering opportunities.'}
              </p>

              <div class="mt-6 flex flex-wrap gap-3">
                <button onclick="state.setView('skill-gap')" class="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 shadow-md transition-all">
                  Analyze Skill-Gaps →
                </button>
                <button onclick="state.setView('resume-builder')" class="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md transition-all">
                  Build ATS Resume
                </button>
                <button onclick="state.setView('mock-interview')" class="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md transition-all">
                  🎙️ Practice Mock Interview
                </button>
              </div>
            </div>

            <!-- Profile Readiness Badges -->
            <div class="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div class="text-center px-3">
                <div class="text-3xl font-black text-white">${readiness}%</div>
                <div class="text-xs text-blue-200 uppercase font-semibold mt-0.5">Readiness</div>
              </div>
              <div class="h-10 w-px bg-white/20"></div>
              <div class="text-center px-3">
                <div class="text-3xl font-black text-white">${completion}%</div>
                <div class="text-xs text-blue-200 uppercase font-semibold mt-0.5">Profile Done</div>
              </div>
              <div class="h-10 w-px bg-white/20"></div>
              <div class="text-center px-3">
                <div class="text-3xl font-black text-white">v${p.current_version || 1}</div>
                <div class="text-xs text-blue-200 uppercase font-semibold mt-0.5">SSOT Ver</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Card 1 -->
          <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
              ⚡
            </div>
            <div>
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Skills</div>
              <div class="text-2xl font-black text-slate-900 dark:text-white">${p.skills ? p.skills.length : 0} Skills</div>
              <div class="text-xs text-emerald-600 font-semibold mt-0.5">Zero hallucinations</div>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">
              📂
            </div>
            <div>
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Projects Completed</div>
              <div class="text-2xl font-black text-slate-900 dark:text-white">${p.projects ? p.projects.length : 0} Projects</div>
              <div class="text-xs text-slate-500 font-medium mt-0.5">Portfolio ready</div>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl font-bold">
              🗺️
            </div>
            <div>
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Roadmap</div>
              <div class="text-2xl font-black text-slate-900 dark:text-white">90-Day Plan</div>
              <div class="text-xs text-blue-600 font-medium mt-0.5">Week 1 In Progress</div>
            </div>
          </div>

          <!-- Card 4 -->
          <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
              🛡️
            </div>
            <div>
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Integrity</div>
              <div class="text-2xl font-black text-emerald-600">100% Valid</div>
              <div class="text-xs text-slate-500 font-medium mt-0.5">Single Source of Truth</div>
            </div>
          </div>
        </div>

        <!-- Main Dashboard Split: Skill Gaps & Recommended Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Skill Gap & Role Recommendations (2 cols) -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Role Suitability Card -->
            <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-lg font-black text-slate-900 dark:text-white">Recommended Career Paths</h3>
                  <p class="text-xs text-slate-500">Based on your academic degree, verified skills, and project experience.</p>
                </div>
                <button onclick="state.setView('skill-gap')" class="text-xs font-bold text-blue-600 hover:underline">
                  Full Analysis →
                </button>
              </div>

              <div class="space-y-4">
                <div class="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div class="flex items-start gap-3">
                    <span class="text-2xl">🤖</span>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-extrabold text-slate-900 dark:text-white text-sm">AI/ML Engineer</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">Target Match</span>
                      </div>
                      <div class="text-xs text-slate-600 dark:text-slate-400 mt-1">Python, Scikit-Learn, PyTorch, Math/Stats, SQL</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-bold text-emerald-600 block">85% Skill Match</span>
                    <span class="text-[11px] text-slate-400">Demand: Extremely High</span>
                  </div>
                </div>

                <div class="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div class="flex items-start gap-3">
                    <span class="text-2xl">💻</span>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-extrabold text-slate-900 dark:text-white text-sm">Full-Stack Software Developer</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">Strong Alternative</span>
                      </div>
                      <div class="text-xs text-slate-600 dark:text-slate-400 mt-1">React, FastAPI, PostgreSQL, Docker, Git</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-bold text-emerald-600 block">88% Skill Match</span>
                    <span class="text-[11px] text-slate-400">Demand: High</span>
                  </div>
                </div>

                <div class="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div class="flex items-start gap-3">
                    <span class="text-2xl">📊</span>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-extrabold text-slate-900 dark:text-white text-sm">Data Analyst & BI Specialist</span>
                      </div>
                      <div class="text-xs text-slate-600 dark:text-slate-400 mt-1">SQL, Python Pandas, Statistics, Reporting</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-bold text-emerald-600 block">92% Skill Match</span>
                    <span class="text-[11px] text-slate-400">Demand: High</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Priority Skill Gaps Preview -->
            <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-black text-slate-900 dark:text-white">Priority Skill Gaps for ${targetRole}</h3>
                  <p class="text-xs text-slate-500">Skills recommended to level up before corporate recruitment rounds.</p>
                </div>
                <button onclick="state.setView('roadmap')" class="text-xs font-bold text-blue-600 hover:underline">
                  View Learning Plan →
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-bold text-sm text-slate-900 dark:text-white">Docker & Containerization</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">Level 2 → 4</span>
                  </div>
                  <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div class="bg-rose-500 h-full rounded-full" style="width: 50%"></div>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-2">Recommended: FreeCodeCamp Docker Crash Course</div>
                </div>

                <div class="p-4 rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-bold text-sm text-slate-900 dark:text-white">Deep Learning (PyTorch)</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">Level 2 → 4</span>
                  </div>
                  <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div class="bg-amber-500 h-full rounded-full" style="width: 50%"></div>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-2">Recommended: MIT 6.S191 Deep Learning</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Quick Tools & Recent Documents (1 col) -->
          <div class="space-y-8">
            <!-- Quick Actions -->
            <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 class="text-base font-black text-slate-900 dark:text-white mb-4">Quick AI Generators</h3>
              
              <div class="space-y-3">
                <button onclick="state.setView('career-analysis')" class="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-left transition-all">
                  <div class="flex items-center gap-3">
                    <span class="text-xl">✨</span>
                    <div>
                      <div class="text-xs font-bold text-slate-900 dark:text-white">Career Summary & Bio</div>
                      <div class="text-[11px] text-slate-500">LinkedIn About, Branding Statement</div>
                    </div>
                  </div>
                  <span class="text-slate-400">→</span>
                </button>

                <button onclick="state.setView('job-matcher')" class="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-left transition-all">
                  <div class="flex items-center gap-3">
                    <span class="text-xl">🎯</span>
                    <div>
                      <div class="text-xs font-bold text-slate-900 dark:text-white">Job Description Matcher</div>
                      <div class="text-[11px] text-slate-500">Paste JD to compare keyword coverage</div>
                    </div>
                  </div>
                  <span class="text-slate-400">→</span>
                </button>

                <button onclick="state.setView('chatbot')" class="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-left transition-all">
                  <div class="flex items-center gap-3">
                    <span class="text-xl">🤖</span>
                    <div>
                      <div class="text-xs font-bold text-slate-900 dark:text-white">AI Placement Counselor</div>
                      <div class="text-[11px] text-slate-500">Ask profile-grounded career questions</div>
                    </div>
                  </div>
                  <span class="text-slate-400">→</span>
                </button>

                <button onclick="state.setView('reports')" class="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-left transition-all">
                  <div class="flex items-center gap-3">
                    <span class="text-xl">📥</span>
                    <div>
                      <div class="text-xs font-bold text-slate-900 dark:text-white">Export Center</div>
                      <div class="text-[11px] text-slate-500">Download Resumes, Cover Letters, Reports</div>
                    </div>
                  </div>
                  <span class="text-slate-400">→</span>
                </button>
              </div>
            </div>

            <!-- Profile Single Source of Truth Card -->
            <div class="p-7 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg">
              <div class="flex items-center gap-2 text-xs font-bold text-blue-400 mb-2">
                <span>🛡️</span> SINGLE SOURCE OF TRUTH
              </div>
              <h4 class="text-base font-extrabold mb-1">Centralized Profile Active</h4>
              <p class="text-xs text-slate-300 leading-relaxed mb-4">
                All generated content (resumes, cover letters, mock questions) references Profile Version ${p.current_version || 1}. Update your profile anytime to auto-refresh all downstream materials.
              </p>
              <button onclick="state.setView('profile')" class="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors">
                Edit Centralized Profile →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.DashboardView = DashboardView;

