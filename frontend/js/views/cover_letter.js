// AI Cover Letter Generator View
const CoverLetterView = {
  currentLetter: null,

  async render() {
    const p = state.profile || {};
    const defaultRole = p.career_goal ? p.career_goal.target_role : 'AI/ML Engineer';

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">✉️</span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">AI Cover Letter Generator</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Creates compelling, company-tailored cover letters linking your verified projects and technical strengths with zero fabricated experience.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a href="${api.getCoverLetterPdfUrl()}" target="_blank" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
              <span>📥</span> Download PDF
            </a>
          </div>
        </div>

        <!-- Inputs Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Input Form (5 cols) -->
          <div class="lg:col-span-5 p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Application Details</h3>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Target Company</label>
              <input type="text" id="cl-company" value="Google / Cloud Native Labs" placeholder="e.g. Microsoft, Razorpay" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium" />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Target Role</label>
              <input type="text" id="cl-role" value="${defaultRole}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Type</label>
                <select id="cl-type" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium">
                  <option value="fresher">Fresher Graduate</option>
                  <option value="internship">Internship</option>
                  <option value="entry_level">Entry-Level Engineer</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Tone</label>
                <select id="cl-tone" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium">
                  <option value="Professional">Professional</option>
                  <option value="Formal">Formal</option>
                  <option value="Technical">Technical</option>
                  <option value="Enthusiastic">Enthusiastic</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Job Description Snippet (Optional)</label>
              <textarea id="cl-jd" rows="3" placeholder="Paste requirements from the job posting..." class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"></textarea>
            </div>

            <button onclick="CoverLetterView.generate()" id="cl-gen-btn" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
              <span>⚡</span> Generate Personalized Cover Letter
            </button>
          </div>

          <!-- Preview & Editor (7 cols) -->
          <div class="lg:col-span-7 p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Letter Preview & Live Editor</h3>
              <button onclick="navigator.clipboard.writeText(document.getElementById('cl-content-area').value); state.showToast('Copied to clipboard!', 'success');" class="text-xs font-bold text-blue-600 hover:underline">
                📋 Copy Text
              </button>
            </div>

            <div id="cl-display">
              <textarea id="cl-content-area" rows="18" class="w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs sm:text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500">
Click "Generate Personalized Cover Letter" to draft an application letter tailored to your chosen company.
              </textarea>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async generate() {
    const comp = document.getElementById('cl-company').value.trim();
    const role = document.getElementById('cl-role').value.trim();
    const type = document.getElementById('cl-type').value;
    const tone = document.getElementById('cl-tone').value;
    const jd = document.getElementById('cl-jd').value.trim();

    if (!comp) {
      state.showToast('Please enter a target company name', 'warning');
      return;
    }

    const btn = document.getElementById('cl-gen-btn');
    btn.disabled = true;
    btn.innerText = 'Drafting tailored letter...';

    try {
      state.showToast('Drafting letter grounded in verified profile facts...', 'info');
      const res = await api.generateCoverLetter(comp, role, jd, tone, type);
      this.currentLetter = res;
      const area = document.getElementById('cl-content-area');
      if (area) {
        area.value = res.content;
      }
      state.showToast('Cover letter generated successfully!', 'success');
    } catch (e) {
      state.showToast(e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = '⚡ Generate Personalized Cover Letter';
    }
  }
};

window.CoverLetterView = CoverLetterView;

