// AI Resume Builder & ATS Compatibility Analyzer View
const ResumeBuilderView = {
  activeTemplate: 'modern', // modern, professional, minimalist, creative
  currentResume: null,

  async render() {
    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">📄</span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">AI ATS Resume Builder</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Construct high-impact ATS-friendly resumes with live preview, keyword coverage checks, and verified profile data binding.
            </p>
          </div>

          <!-- Download Action Buttons -->
          <div class="flex items-center gap-3">
            <a href="${api.getResumePdfUrl()}" target="_blank" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
              <span>📥</span> Download PDF
            </a>
            <a href="${api.getResumeDocxUrl()}" target="_blank" class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center gap-2">
              <span>📝</span> Download Word (DOCX)
            </a>
          </div>
        </div>

        <!-- Controls: Template Selector & Regenerate -->
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <label class="text-xs font-bold text-slate-400 uppercase">Select Template:</label>
            <div class="flex items-center gap-2">
              ${['modern', 'professional', 'minimalist', 'creative'].map(tpl => `
                <button onclick="ResumeBuilderView.switchTemplate('${tpl}')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${this.activeTemplate === tpl ? 'bg-blue-600 text-white' : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                  ${tpl}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="ResumeBuilderView.regenerate()" class="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-colors">
              ⚡ Refresh from Profile
            </button>
          </div>
        </div>

        <!-- Split Screen: ATS Analysis (Left) & Live Resume Preview (Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Left Column: ATS Score & Diagnostics (5 cols) -->
          <div class="lg:col-span-5 space-y-6" id="ats-panel">
            <div class="p-8 text-center text-slate-400 text-sm">Evaluating ATS score...</div>
          </div>

          <!-- Right Column: Live Paper Sheet Simulation (7 cols) -->
          <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden" id="resume-sheet">
            <div class="p-12 text-center text-slate-400 text-sm">Rendering resume sheet...</div>
          </div>
        </div>
      </div>
    `;
  },

  async switchTemplate(tpl) {
    this.activeTemplate = tpl;
    await this.loadResume();
  },

  async loadResume() {
    try {
      const res = await api.getLatestResume(this.activeTemplate);
      this.currentResume = res;
      this.renderATSPanel(res.ats_feedback, res.ats_score);
      this.renderResumeSheet(res.content);
    } catch (e) {
      state.showToast(e.message, 'error');
    }
  },

  async regenerate() {
    try {
      state.showToast('Rebuilding ATS resume from centralized profile...', 'info');
      const res = await api.generateResume(this.activeTemplate);
      this.currentResume = res;
      this.renderATSPanel(res.ats_feedback, res.ats_score);
      this.renderResumeSheet(res.content);
      state.showToast('Resume refreshed!', 'success');
    } catch (e) {
      state.showToast(e.message, 'error');
    }
  },

  renderATSPanel(ats, score) {
    const panel = document.getElementById('ats-panel');
    if (!panel) return;

    const checks = ats.checks || [];
    const missing = ats.missing_keywords || [];

    panel.innerHTML = `
      <!-- ATS Score Card -->
      <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-bold uppercase text-slate-400">ATS Match Gauge</span>
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600">Standard Heuristic</span>
        </div>

        <div class="flex items-baseline gap-3 my-4">
          <div class="text-5xl font-black text-slate-900 dark:text-white">${score}/100</div>
          <div class="text-xs font-bold text-emerald-600">ATS Friendly</div>
        </div>

        <p class="text-xs text-slate-500 leading-relaxed">
          ${ats.disclaimer || 'Indicative compatibility score.'}
        </p>

        <!-- Progress bar -->
        <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full" style="width: ${score}%"></div>
        </div>
      </div>

      <!-- Keyword Coverage -->
      <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h4 class="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
          <span>Keyword Match Coverage</span>
          <span class="text-xs text-blue-600 font-bold">${ats.keyword_match_percentage || 80}%</span>
        </h4>

        ${missing.length > 0 ? `
          <div>
            <div class="text-[11px] font-bold uppercase text-rose-500 mb-1.5">Missing Relevant Keywords:</div>
            <div class="flex flex-wrap gap-1.5">
              ${missing.map(m => `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">${m}</span>`).join('')}
            </div>
          </div>
        ` : `
          <div class="text-xs font-semibold text-emerald-600">✓ All core role keywords present in resume body.</div>
        `}
      </div>

      <!-- Diagnostic Checklist -->
      <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h4 class="font-extrabold text-sm text-slate-900 dark:text-white mb-2">Automated Checks</h4>
        ${checks.map(c => `
          <div class="flex items-start gap-2.5 text-xs">
            <span class="${c.status === 'pass' ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}">
              ${c.status === 'pass' ? '✓' : '⚠'}
            </span>
            <span class="text-slate-600 dark:text-slate-400">${c.item}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderResumeSheet(c) {
    const sheet = document.getElementById('resume-sheet');
    if (!sheet) return;

    const p = c.personal_info || {};
    const t = this.activeTemplate;

    // Styling based on template
    let headerBorder = 'border-b-2 border-slate-900 pb-4';
    let sectionStyle = 'text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1 mb-2 mt-4';
    
    if (t === 'creative') {
      headerBorder = 'border-b-4 border-indigo-600 pb-4';
      sectionStyle = 'text-xs font-black uppercase tracking-wider text-indigo-600 border-b border-indigo-100 dark:border-indigo-900/60 pb-1 mb-2 mt-4';
    } else if (t === 'minimalist') {
      headerBorder = 'pb-3';
      sectionStyle = 'text-xs font-bold uppercase tracking-widest text-slate-400 pb-1 mb-2 mt-4';
    }

    sheet.innerHTML = `
      <div class="space-y-4 text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
        <!-- Header -->
        <div class="${headerBorder}">
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">${p.full_name || 'Alex Sharma'}</h2>
          <div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
            <span>${p.headline || 'Software Engineer'}</span> •
            <span>${p.email || 'alex@example.com'}</span> •
            <span>${p.phone || '+91 98765 43210'}</span> •
            <span>${p.location || 'Bengaluru, India'}</span>
          </div>
        </div>

        <!-- Summary -->
        <div>
          <h3 class="${sectionStyle}">Professional Summary</h3>
          <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">${c.summary || ''}</p>
        </div>

        <!-- Skills -->
        <div>
          <h3 class="${sectionStyle}">Technical & Soft Skills</h3>
          <div class="text-xs text-slate-700 dark:text-slate-300">
            <span class="font-bold">Technologies:</span> ${(c.technical_skills || []).join(', ')}
          </div>
          ${c.soft_skills && c.soft_skills.length > 0 ? `
            <div class="text-xs text-slate-700 dark:text-slate-300 mt-1">
              <span class="font-bold">Competencies:</span> ${c.soft_skills.join(', ')}
            </div>
          ` : ''}
        </div>

        <!-- Experience / Internships -->
        ${c.internships && c.internships.length > 0 ? `
          <div>
            <h3 class="${sectionStyle}">Practical Experience</h3>
            <div class="space-y-3">
              ${c.internships.map(i => `
                <div>
                  <div class="flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white">
                    <span>${i.position} • ${i.company}</span>
                    <span class="text-slate-400 font-normal">${i.duration}</span>
                  </div>
                  <ul class="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 mt-1 space-y-0.5">
                    ${(i.bullets || [i.description]).map(b => `<li>${b}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Projects -->
        ${c.projects && c.projects.length > 0 ? `
          <div>
            <h3 class="${sectionStyle}">Technical Projects</h3>
            <div class="space-y-3">
              ${c.projects.map(pj => `
                <div>
                  <div class="flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white">
                    <span>${pj.title} <span class="font-normal text-slate-400">[${pj.technologies}]</span></span>
                    <span class="text-blue-600 font-semibold">${pj.role}</span>
                  </div>
                  <ul class="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 mt-1 space-y-0.5">
                    ${(pj.bullets || [pj.description]).map(b => `<li>${b}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Education -->
        ${c.education && c.education.length > 0 ? `
          <div>
            <h3 class="${sectionStyle}">Education</h3>
            <div class="space-y-2">
              ${c.education.map(e => `
                <div class="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                  <div>
                    <span class="font-bold text-slate-900 dark:text-white">${e.degree} in ${e.department}</span> • ${e.institution}
                  </div>
                  <span class="text-slate-400">${e.graduation_year} | CGPA: ${e.cgpa || 'N/A'}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Certifications -->
        ${c.certifications && c.certifications.length > 0 ? `
          <div>
            <h3 class="${sectionStyle}">Certifications</h3>
            <ul class="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
              ${c.certifications.map(ct => `<li><span class="font-bold">${ct.name}</span> - ${ct.issuing_org} (${ct.issue_date})</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }
};

window.ResumeBuilderView = ResumeBuilderView;

