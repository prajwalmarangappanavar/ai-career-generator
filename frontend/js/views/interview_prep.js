// Curated Interview Preparation Question Bank View
const InterviewPrepView = {
  activeCategory: 'technical', // technical, hr, behavioral, project
  questions: [],

  async render() {
    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">💡</span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Interview Preparation Bank</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Curated technical algorithms, behavioral STAR scenarios, HR discussions, and project architecture challenges with verified answer frameworks.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="state.setView('mock-interview')" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2">
              <span>🎙️</span> Launch Interactive AI Mock Interview
            </button>
          </div>
        </div>

        <!-- Category Filter Tabs -->
        <div class="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          ${[
            ['technical', '💻 Technical & Algorithms'],
            ['behavioral', '⭐ Behavioral (STAR Method)'],
            ['hr', '🤝 HR & Cultural Fit'],
            ['project', '🏗️ Project & Architecture Defense']
          ].map(([id, label]) => `
            <button onclick="InterviewPrepView.switchCategory('${id}')" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${this.activeCategory === id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}">
              ${label}
            </button>
          `).join('')}
        </div>

        <!-- Questions List Container -->
        <div id="questions-container" class="space-y-4">
          <div class="p-12 text-center text-slate-400 text-sm">Loading interview questions...</div>
        </div>
      </div>
    `;
  },

  async switchCategory(cat) {
    this.activeCategory = cat;
    await this.loadQuestions();
  },

  async loadQuestions() {
    const container = document.getElementById('questions-container');
    if (container) {
      container.innerHTML = '<div class="p-12 text-center text-slate-400 text-sm">Loading questions...</div>';
    }

    try {
      this.questions = await api.getInterviewQuestions(this.activeCategory);
      if (container) {
        container.innerHTML = this.renderQuestionsList(this.questions);
      }
    } catch (e) {
      state.showToast(e.message, 'error');
    }
  },

  renderQuestionsList(qs) {
    if (!qs || qs.length === 0) {
      return '<div class="p-8 text-center text-slate-400 text-sm">No questions found in this category.</div>';
    }

    return qs.map((q, idx) => `
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
              ${idx + 1}
            </span>
            <span class="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              ${q.target_role}
            </span>
          </div>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${q.difficulty === 'Advanced' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}">
            ${q.difficulty}
          </span>
        </div>

        <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
          "${q.question}"
        </h3>

        <!-- Collapsible Framework Toggle -->
        <div>
          <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <span>💡</span> View Recommended Answer Framework & Rubric Criteria
          </button>
          <div class="hidden mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <div class="text-[11px] font-bold uppercase text-slate-400 mb-1">Answer Framework:</div>
              <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">${q.sample_answer_framework}</p>
            </div>
            ${q.criteria && q.criteria.length > 0 ? `
              <div>
                <div class="text-[11px] font-bold uppercase text-slate-400 mb-1">What Interviewers Expect:</div>
                <div class="flex flex-wrap gap-1.5">
                  ${q.criteria.map(c => `<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">✓ ${c}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }
};

window.InterviewPrepView = InterviewPrepView;

