// Centralized Export Center View
const ReportsView = {
  render() {
    const p = state.profile || {};
    const name = p.full_name || 'Alex Sharma';

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">📥</span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Export & Download Center</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Download your verified placement assets in standard industry formats (ReportLab PDF & Word DOCX).
            </p>
          </div>
        </div>

        <!-- Downloads Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Card 1: Resume PDF -->
          <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-2xl font-bold mb-4">
                📄
              </div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">ATS Resume (PDF)</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Clean, single-page ATS-compliant PDF with verified skills, projects, and contact details.
              </p>
            </div>
            <a href="${api.getResumePdfUrl()}" target="_blank" class="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-md transition-colors block">
              Download Resume PDF ↓
            </a>
          </div>

          <!-- Card 2: Resume DOCX -->
          <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center text-2xl font-bold mb-4">
                📝
              </div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Editable Resume (Word DOCX)</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Full Word document with standard headings, ideal for manual recruiter tweaks.
              </p>
            </div>
            <a href="${api.getResumeDocxUrl()}" target="_blank" class="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs text-center transition-colors block">
              Download Resume DOCX ↓
            </a>
          </div>

          <!-- Card 3: Cover Letter PDF -->
          <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center text-2xl font-bold mb-4">
                ✉️
              </div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Tailored Cover Letter (PDF)</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Company-specific personalized cover letter emphasizing project achievements.
              </p>
            </div>
            <a href="${api.getCoverLetterPdfUrl()}" target="_blank" class="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs text-center shadow-md transition-colors block">
              Download Cover Letter PDF ↓
            </a>
          </div>

          <!-- Card 4: Skill Gap Report PDF -->
          <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center text-2xl font-bold mb-4">
                📊
              </div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Skill-Gap Analysis Report (PDF)</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Comprehensive competency evaluation with missing proficiencies and learning sequence.
              </p>
            </div>
            <a href="${api.getSkillGapPdfUrl()}" target="_blank" class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center shadow-md transition-colors block">
              Download Skill Gap PDF ↓
            </a>
          </div>

          <!-- Card 5: Learning Roadmap Summary -->
          <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center text-2xl font-bold mb-4">
                🗺️
              </div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Interactive Roadmap Tracker</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Week-by-week curriculum with checkable assignments and verified resource links.
              </p>
            </div>
            <button onclick="state.setView('roadmap')" class="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs text-center transition-colors">
              Open Roadmap Tracker →
            </button>
          </div>

          <!-- Card 6: Centralized Profile Export -->
          <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center text-2xl font-bold mb-4">
                🛡️
              </div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Profile Version Snapshot</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Inspect immutable snapshot JSON for verifiable Single Source of Truth integrity.
              </p>
            </div>
            <button onclick="state.setView('profile'); ProfileView.switchTab('history');" class="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs text-center transition-colors">
              View Version History →
            </button>
          </div>
        </div>
      </div>
    `;
  }
};

window.ReportsView = ReportsView;

