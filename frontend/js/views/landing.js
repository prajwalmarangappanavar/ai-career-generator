// Landing Page View
const LandingView = {
  render() {
    return `
      <div class="relative overflow-hidden">
        <!-- Hero Background Glows -->
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute top-20 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Navigation Bar -->
        <header class="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 font-black text-xl">
              CP
            </div>
            <div>
              <span class="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">CareerPulse<span class="text-blue-600">.ai</span></span>
              <span class="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Intelligent Career OS</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="state.toggleTheme()" class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span class="dark:hidden">🌙</span>
              <span class="hidden dark:inline">☀️</span>
            </button>
            <button onclick="AuthView.open('login')" class="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors">
              Sign In
            </button>
            <button onclick="AuthView.open('register')" class="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5">
              Get Started Free
            </button>
          </div>
        </header>

        <!-- Hero Section -->
        <section class="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-sm">
            <span class="flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
            Production-Ready AI-Powered Career Guidance & Placement OS
          </div>

          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Transform Your Skills Into An <span class="gradient-text">Elite Career</span>
          </h1>

          <p class="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-4xl max-w-2xl mx-auto leading-relaxed">
            The single source of truth for your professional profile. Automated skill-gap analysis, ATS resumes, interactive mock interviews, and tailored 90-day roadmaps—grounded strictly in your verified facts.
          </p>

          <!-- CTA Buttons -->
          <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onclick="AuthView.open('register')" class="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-1">
              Start Free Assessment →
            </button>
            <button onclick="AuthView.quickDemoStudent()" class="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-blue-500 shadow-sm transition-all flex items-center justify-center gap-2">
              <span>🚀</span> 1-Click Demo Student Experience
            </button>
          </div>

          <!-- Feature Badges -->
          <div class="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-1.5"><span class="text-emerald-500 font-bold">✓</span> Zero AI Hallucinations</span>
            <span class="flex items-center gap-1.5"><span class="text-emerald-500 font-bold">✓</span> ATS Resume Scoring</span>
            <span class="flex items-center gap-1.5"><span class="text-emerald-500 font-bold">✓</span> Voice Mock Interviewer</span>
            <span class="flex items-center gap-1.5"><span class="text-emerald-500 font-bold">✓</span> PDF & DOCX Real Exports</span>
          </div>
        </section>

        <!-- Core Modules Grid -->
        <section class="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/80 dark:border-slate-800/80">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white">Complete Placement & Career Suite</h2>
            <p class="mt-3 text-slate-600 dark:text-slate-400">Everything needed to transition from university student to top-tier industry engineering talent.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Card 1 -->
            <div class="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-hover transition-smooth">
              <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold mb-6">
                🎯
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Centralized Profile & Anti-Fabrication</h3>
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Single Source of Truth (SSOT) architecture. Every generated document cross-references verified student facts, preventing fabricated qualifications.
              </p>
            </div>

            <!-- Card 2 -->
            <div class="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-hover transition-smooth">
              <div class="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold mb-6">
                📊
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Interactive Skill-Gap Analyzer</h3>
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Compares existing skills against structured role frameworks. Visual radar charts, missing skill prioritization, and sequenced learning curricula.
              </p>
            </div>

            <!-- Card 3 -->
            <div class="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-hover transition-smooth">
              <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl font-bold mb-6">
                📄
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Resume Builder & ATS Checker</h3>
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Modern ATS-optimized resume templates with live side-by-side editing, keyword density analysis, and instant PDF/DOCX downloads.
              </p>
            </div>

            <!-- Card 4 -->
            <div class="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-hover transition-smooth">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold mb-6">
                🎙️
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Voice & AI Mock Interviewer</h3>
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Turn-by-turn interactive interviewer with Web Speech API speech-to-text. Real-time rubric evaluation on relevance, technical depth, and STAR structure.
              </p>
            </div>

            <!-- Card 5 -->
            <div class="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-hover transition-smooth">
              <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold mb-6">
                🗺️
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">30/60/90-Day Career Roadmaps</h3>
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Week-by-week progressive milestones, verified Coursera/MIT resources, practical coding tasks, and interactive checkable progress tracking.
              </p>
            </div>

            <!-- Card 6 -->
            <div class="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-hover transition-smooth">
              <div class="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl font-bold mb-6">
                🔍
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Job Description Semantic Matcher</h3>
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Paste any employer job posting to extract required keywords, view transparent match indicators, and generate tailored cover letters and resume summaries.
              </p>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 dark:text-slate-400 gap-4">
          <div>
            © 2026 CareerPulse AI. Academic Capstone & Professional Development Platform.
          </div>
          <div class="flex items-center gap-6">
            <button onclick="AuthView.quickDemoAdmin()" class="hover:text-blue-600 transition-colors">Admin Portal Demo</button>
            <a href="/api/v1/health" target="_blank" class="hover:text-blue-600 transition-colors">System Health API</a>
          </div>
        </footer>
      </div>
    `;
  }
};

window.LandingView = LandingView;

