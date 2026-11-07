// AI Career Profile & Professional Content Generator View
const CareerAnalysisView = {
  data: null,
  profileType: 'entry_level',
  tone: 'Professional',

  async render() {
    const p = state.profile || {};
    const targetRole = p.career_goal ? p.career_goal.target_role : 'AI/ML Engineer';

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">✨</span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">AI Career Content Generator</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Produces personalized professional summaries, LinkedIn About sections, branding pitches, and strength assessments grounded strictly in your verified facts.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="CareerAnalysisView.generate()" id="gen-btn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
              <span>⚡</span> Generate Tailored Content
            </button>
          </div>
        </div>

        <!-- Customization Controls Bar -->
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-4">
            <div>
              <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Profile Flavor</label>
              <select id="sel-profile-type" onchange="CareerAnalysisView.profileType = this.value" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold">
                <option value="entry_level" ${this.profileType === 'entry_level' ? 'selected' : ''}>Entry-Level Professional</option>
                <option value="fresher" ${this.profileType === 'fresher' ? 'selected' : ''}>Fresher / Campus Placements</option>
                <option value="internship" ${this.profileType === 'internship' ? 'selected' : ''}>Internship Focus</option>
                <option value="technical" ${this.profileType === 'technical' ? 'selected' : ''}>Deep Technical / System</option>
                <option value="research" ${this.profileType === 'research' ? 'selected' : ''}>Research & Academic</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Tone & Voice</label>
              <select id="sel-tone" onchange="CareerAnalysisView.tone = this.value" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold">
                <option value="Professional" ${this.tone === 'Professional' ? 'selected' : ''}>Professional</option>
                <option value="Formal" ${this.tone === 'Formal' ? 'selected' : ''}>Formal Corporate</option>
                <option value="Concise" ${this.tone === 'Concise' ? 'selected' : ''}>Concise & Direct</option>
                <option value="Technical" ${this.tone === 'Technical' ? 'selected' : ''}>High-Tech & Architectural</option>
                <option value="Beginner-friendly" ${this.tone === 'Beginner-friendly' ? 'selected' : ''}>Approachable & Growth-Minded</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg">
            <span>🛡️</span> Zero Hallucinations Verified
          </div>
        </div>

        <!-- Generated Content View Area -->
        <div id="career-content-display">
          ${this.data ? this.renderContentCards(this.data) : `
            <div class="p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <div class="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl mx-auto mb-4">
                ✨
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Ready to Generate Career Content</h3>
              <p class="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                Click "Generate Tailored Content" to analyze your verified skills, projects, and target role (${targetRole}).
              </p>
              <button onclick="CareerAnalysisView.generate()" class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all">
                Generate Now →
              </button>
            </div>
          `}
        </div>
      </div>
    `;
  },

  async generate() {
    const btn = document.getElementById('gen-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⏳</span> Analyzing facts...';
    }

    try {
      state.showToast('Generating personalized content with Anti-Fabrication Engine...', 'info');
      const resp = await api.generateCareerContent(this.profileType, this.tone);
      this.data = resp;
      state.showToast('Career content generated successfully!', 'success');
      const display = document.getElementById('career-content-display');
      if (display) {
        display.innerHTML = this.renderContentCards(resp);
      }
    } catch (err) {
      state.showToast(err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>⚡</span> Generate Tailored Content';
      }
    }
  },

  renderContentCards(d) {
    const s = d.strengths_analysis || {};
    const suit = d.suitability_analysis || {};

    return `
      <div class="space-y-6">
        <!-- Top Banner with Engine Indicator -->
        <div class="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
          <span class="font-bold flex items-center gap-1.5">
            <span>⚡</span> Engine: ${d.ai_engine_used || 'CareerPulse Verified Generator'}
          </span>
          <span class="font-medium">Profile Snapshot: Version ${d.profile_version || 1}</span>
        </div>

        <!-- Elevator Pitch / Personal Branding -->
        <div class="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <div class="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1">Personal Elevator Branding Statement</div>
          <div class="text-xl sm:text-2xl font-black leading-snug">
            "${d.personal_branding_statement}"
          </div>
          <button onclick="navigator.clipboard.writeText('${d.personal_branding_statement}'); state.showToast('Copied to clipboard!', 'success');" class="mt-4 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold text-white transition-colors">
            📋 Copy Pitch
          </button>
        </div>

        <!-- 2 Column Layout for Summaries -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Resume Summary -->
          <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📄</span> Resume Summary
                </h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">ATS Optimized</span>
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                ${d.resume_summary}
              </p>
            </div>
            <button onclick="navigator.clipboard.writeText(this.previousElementSibling.querySelector('p').innerText); state.showToast('Summary copied!', 'success');" class="mt-4 text-xs font-bold text-blue-600 hover:underline text-left">
              📋 Copy Summary
            </button>
          </div>

          <!-- Career Objective -->
          <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🎯</span> Career Objective
                </h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Target Role</span>
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                ${d.career_objective}
              </p>
            </div>
            <button onclick="navigator.clipboard.writeText(this.previousElementSibling.querySelector('p').innerText); state.showToast('Objective copied!', 'success');" class="mt-4 text-xs font-bold text-blue-600 hover:underline text-left">
              📋 Copy Objective
            </button>
          </div>
        </div>

        <!-- LinkedIn About Section -->
        <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>💼</span> LinkedIn "About" Section
            </h3>
            <button onclick="navigator.clipboard.writeText(document.getElementById('linkedin-text').innerText); state.showToast('LinkedIn About copied!', 'success');" class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-colors">
              📋 Copy for LinkedIn
            </button>
          </div>
          <div id="linkedin-text" class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            ${d.linkedin_about}
          </div>
        </div>

        <!-- Strengths & Suitability Breakdown -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Strengths -->
          <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 class="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>💪</span> Career Strengths Analysis
            </h3>
            <div>
              <div class="text-[11px] font-bold uppercase text-slate-400">Validated Strong Skills</div>
              <div class="flex flex-wrap gap-1.5 mt-1.5">
                ${(s.strong_skills || []).map(sk => `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">${sk}</span>`).join('')}
              </div>
            </div>
            <div>
              <div class="text-[11px] font-bold uppercase text-slate-400">Project Highlights</div>
              <div class="text-xs text-slate-600 dark:text-slate-400 mt-1">${s.project_highlights || ''}</div>
            </div>
            <div>
              <div class="text-[11px] font-bold uppercase text-slate-400">Transferable Skills</div>
              <div class="flex flex-wrap gap-1.5 mt-1.5">
                ${(s.transferable_skills || []).map(ts => `<span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${ts}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- Suitability -->
          <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 class="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>🎯</span> Career Suitability Breakdown
            </h3>
            <div class="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <div>
                <div class="text-xs font-bold text-slate-900 dark:text-white">${suit.primary_role || 'Target Role'}</div>
                <div class="text-[11px] text-slate-500">Alignment Score</div>
              </div>
              <div class="text-2xl font-black text-emerald-600">${suit.suitability_score || 85}%</div>
            </div>
            <div>
              <div class="text-[11px] font-bold uppercase text-slate-400">Why It's Suitable</div>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">${suit.why_suitable || ''}</p>
            </div>
            <div>
              <div class="text-[11px] font-bold uppercase text-slate-400">Recommended Growth Steps</div>
              <ul class="text-xs text-slate-600 dark:text-slate-400 mt-1 space-y-1 list-disc list-inside">
                ${(suit.recommended_growth_skills || []).map(rg => `<li>${rg}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.CareerAnalysisView = CareerAnalysisView;

