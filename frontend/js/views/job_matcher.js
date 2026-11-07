// Job Description Semantic Matcher View
const JobMatcherView = {
  result: null,

  async render() {
    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🎯</span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Job Description Semantic Matcher</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Paste an employer job description to analyze keyword coverage against your centralized profile and produce tailored applications.
            </p>
          </div>
        </div>

        <!-- Input Box -->
        <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Job Title</label>
              <input type="text" id="jd-title" value="Associate AI & Backend Engineer" placeholder="e.g. Software Developer" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Company Name</label>
              <input type="text" id="jd-company" value="Stripe / Google Cloud" placeholder="e.g. Amazon, Uber" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Paste Full Job Description Text</label>
            <textarea id="jd-text" rows="6" placeholder="Paste requirements, tech stack, and responsibilities here..." class="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium leading-relaxed">We are seeking an ambitious software engineer to join our high-growth platform team. You will build and scale reliable backend REST APIs using Python and FastAPI, design PostgreSQL database schemas, write unit tests, and deploy services via Docker and GitHub Actions. Familiarity with machine learning pipelines or Scikit-Learn is a strong plus. Requirements: Bachelor's in CS, strong SQL skills, Git version control, and analytical problem solving.</textarea>
          </div>

          <div class="flex items-center justify-between pt-2">
            <span class="text-xs text-slate-400">Analyzes semantic keywords & requirements</span>
            <button onclick="JobMatcherView.analyze()" id="jd-btn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
              <span>⚡</span> Analyze Alignment & Tailor Content
            </button>
          </div>
        </div>

        <!-- Results Display Container -->
        <div id="jd-results-container">
          ${this.result ? this.renderResult(this.result) : ''}
        </div>
      </div>
    `;
  },

  async analyze() {
    const title = document.getElementById('jd-title').value.trim();
    const company = document.getElementById('jd-company').value.trim();
    const text = document.getElementById('jd-text').value.trim();

    if (!text || text.length < 20) {
      state.showToast('Please paste a full job description (at least 20 characters)', 'warning');
      return;
    }

    const btn = document.getElementById('jd-btn');
    btn.disabled = true;
    btn.innerText = 'Analyzing requirements...';

    try {
      state.showToast('Extracting keywords and calculating semantic match score...', 'info');
      const res = await api.analyzeJobDescription(title, company, text);
      this.result = res;
      const container = document.getElementById('jd-results-container');
      if (container) {
        container.innerHTML = this.renderResult(res);
      }
      state.showToast('Job description analysis complete!', 'success');
    } catch (e) {
      state.showToast(e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = '⚡ Analyze Alignment & Tailor Content';
    }
  },

  renderResult(r) {
    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Match Score Banner -->
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase text-slate-400">Semantic Alignment Score</span>
            <div class="flex items-baseline gap-3 my-1">
              <span class="text-4xl font-black text-slate-900 dark:text-white">${r.match_score}%</span>
              <span class="text-xs font-bold ${r.match_score >= 70 ? 'text-emerald-600' : 'text-amber-600'}">
                ${r.match_score >= 70 ? 'Strong Candidate Alignment' : 'Partial Match'}
              </span>
            </div>
            <p class="text-xs text-slate-500">${r.disclaimer}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              ${r.company_name}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              ${r.job_title}
            </span>
          </div>
        </div>

        <!-- Matched vs Missing Keywords -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Matched Skills In Your Profile
            </h4>
            <div class="flex flex-wrap gap-1.5">
              ${(r.matching_skills || []).map(m => `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">✓ ${m}</span>`).join('')}
            </div>
          </div>

          <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span> Missing Keywords in Profile
            </h4>
            <div class="flex flex-wrap gap-1.5">
              ${(r.missing_skills || []).map(ms => `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">+ ${ms}</span>`).join('')}
            </div>
          </div>
        </div>

        <!-- Tailored Resume Summary -->
        <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-sm text-slate-900 dark:text-white">Tailored Resume Summary for this Role</h4>
            <button onclick="navigator.clipboard.writeText('${r.tailored_summary}'); state.showToast('Copied to clipboard!', 'success');" class="text-xs font-bold text-blue-600 hover:underline">
              📋 Copy Summary
            </button>
          </div>
          <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            ${r.tailored_summary}
          </p>
        </div>

        <!-- Role-Specific Interview Questions -->
        <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 class="font-bold text-sm text-slate-900 dark:text-white">Predicted Interview Questions for this Opening</h4>
          <div class="space-y-2">
            ${(r.interview_questions || []).map(q => `
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2">
                <span class="text-blue-600 font-bold">Q:</span> <span>${q}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
};

window.JobMatcherView = JobMatcherView;

