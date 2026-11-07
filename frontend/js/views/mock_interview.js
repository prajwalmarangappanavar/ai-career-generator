// Interactive AI Mock Interview Simulator with Speech-to-Text & Text-to-Speech
const MockInterviewView = {
  session: null,
  currentQuestion: null,
  isRecording: false,
  recognition: null,
  isTTSActive: true,
  history: [],

  async render() {
    const p = state.profile || {};
    const defaultRole = p.career_goal ? p.career_goal.target_role : 'AI/ML Engineer';

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🎙️</span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">AI Mock Interview Simulator</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Interactive turn-by-turn placement interviewer with speech recognition, STAR methodology scoring, and immediate constructive coaching feedback.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="MockInterviewView.toggleTTS()" id="tts-toggle-btn" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all">
              🔊 Voice: ON
            </button>
            <button onclick="MockInterviewView.startNewSession('${defaultRole}')" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all">
              ⚡ Start New Session
            </button>
          </div>
        </div>

        <!-- Main Interview Session Area -->
        <div id="mock-active-container">
          <div class="p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <div class="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl mx-auto mb-4">
              🎙️
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Practice Live Technical & Behavioral Rounds</h3>
            <p class="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Our AI interviewer evaluates your technical accuracy, clarity, and STAR response structure for ${defaultRole} placements.
            </p>
            <button onclick="MockInterviewView.startNewSession('${defaultRole}')" class="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md transition-all">
              Start Session (5 Questions) →
            </button>
          </div>
        </div>

        <!-- History of Past Sessions -->
        <div class="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Completed Practice Sessions</h3>
          <div id="mock-history-list" class="space-y-3">
            <div class="text-slate-400 text-xs">Loading past sessions...</div>
          </div>
        </div>
      </div>
    `;
  },

  async startNewSession(targetRole) {
    try {
      state.showToast('Initializing interview session...', 'info');
      const res = await api.startMockInterview(targetRole);
      this.session = res;
      this.currentQuestion = res.current_question;
      this.renderQuestionScreen(res);
      this.speakText(this.currentQuestion.question);
    } catch (e) {
      state.showToast(e.message, 'error');
    }
  },

  renderQuestionScreen(s) {
    const container = document.getElementById('mock-active-container');
    if (!container) return;

    container.innerHTML = `
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <!-- Progress Banner -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              Question ${s.current_question_index} of ${s.total_questions}
            </span>
            <span class="text-xs font-semibold text-slate-400">• Role: ${s.target_role}</span>
          </div>
          <button onclick="MockInterviewView.speakText('${s.current_question.question}')" class="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            🔊 Replay Audio
          </button>
        </div>

        <!-- Question Box -->
        <div class="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
          <div class="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Interviewer Question:</div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed">
            "${s.current_question.question}"
          </h2>
        </div>

        <!-- Answer Input Area -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Your Spoken or Written Answer:</label>
            <!-- Microphone Speech-to-Text Button -->
            <button onclick="MockInterviewView.toggleRecording()" id="mic-btn" class="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 transition-all">
              <span id="mic-icon">🎙️</span> <span id="mic-label">Record Voice (STT)</span>
            </button>
          </div>

          <textarea id="mock-answer-input" rows="6" placeholder="Type your answer, or click 'Record Voice' to speak..." class="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <button onclick="MockInterviewView.submitCurrentAnswer()" id="submit-ans-btn" class="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
          <span>⚡</span> Submit Answer for AI Evaluation →
        </button>

        <!-- Evaluation Feedback Display Area -->
        <div id="eval-feedback-area"></div>
      </div>
    `;
  },

  async submitCurrentAnswer() {
    const input = document.getElementById('mock-answer-input');
    const answer = input ? input.value.trim() : '';

    if (!answer || answer.length < 5) {
      state.showToast('Please provide an answer before submitting.', 'warning');
      return;
    }

    const btn = document.getElementById('submit-ans-btn');
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Analyzing technical accuracy & STAR structure...';

    try {
      state.showToast('Evaluating answer across placement rubrics...', 'info');
      const evalRes = await api.submitMockAnswer(
        this.session.mock_interview_id,
        this.currentQuestion.id,
        this.currentQuestion.question,
        answer
      );

      this.renderEvaluationResult(evalRes);
    } catch (e) {
      state.showToast(e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>⚡</span> Submit Answer for AI Evaluation →';
    }
  },

  renderEvaluationResult(res) {
    const area = document.getElementById('eval-feedback-area');
    if (!area) return;

    area.innerHTML = `
      <div class="mt-6 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-6 animate-fade-in">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
          <h4 class="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>📊</span> Evaluation Breakdown
          </h4>
          <span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Overall: ${res.overall_score}/10
          </span>
        </div>

        <!-- 4 Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div class="text-xl font-black text-blue-600">${res.relevance_score}/10</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Relevance</div>
          </div>
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div class="text-xl font-black text-indigo-600">${res.technical_score}/10</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Tech Depth</div>
          </div>
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div class="text-xl font-black text-purple-600">${res.clarity_score}/10</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Clarity</div>
          </div>
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div class="text-xl font-black text-emerald-600">${res.communication_score}/10</div>
            <div class="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Communication</div>
          </div>
        </div>

        <!-- Feedback & Missing Concepts -->
        <div>
          <div class="text-xs font-bold uppercase text-slate-400 mb-1">Constructive Feedback:</div>
          <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${res.constructive_feedback}</p>
        </div>

        ${res.missing_concepts && res.missing_concepts.length > 0 ? `
          <div>
            <div class="text-xs font-bold uppercase text-rose-500 mb-1">Key Concepts to Mention:</div>
            <div class="flex flex-wrap gap-1.5">
              ${res.missing_concepts.map(mc => `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">💡 ${mc}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Next Question or Completion Button -->
        <div class="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          ${res.is_finished ? `
            <button onclick="MockInterviewView.showCompletionSummary()" class="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md">
              ✓ View Full Session Summary →
            </button>
          ` : `
            <button onclick="MockInterviewView.proceedNextQuestion(${JSON.stringify(res.next_question).replace(/"/g, '&quot;')})" class="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md">
              Proceed to Next Question (${this.session.current_question_index + 1}/${this.session.total_questions}) →
            </button>
          `}
        </div>
      </div>
    `;

    // Speak constructive feedback
    this.speakText(res.constructive_feedback);
  },

  proceedNextQuestion(nextQ) {
    this.session.current_question_index += 1;
    this.session.current_question = nextQ;
    this.currentQuestion = nextQ;
    this.renderQuestionScreen(this.session);
    this.speakText(nextQ.question);
  },

  showCompletionSummary() {
    const container = document.getElementById('mock-active-container');
    if (!container) return;

    container.innerHTML = `
      <div class="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto font-black">
          ✓
        </div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white">Mock Interview Completed!</h2>
        <p class="text-sm text-slate-500 max-w-md mx-auto">
          Outstanding practice! You completed all questions for ${this.session.target_role}. Your answers have been recorded in your interview preparation analytics.
        </p>
        <div class="pt-4 flex justify-center gap-3">
          <button onclick="MockInterviewView.startNewSession('${this.session.target_role}')" class="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md">
            Practice Another Session
          </button>
          <button onclick="state.setView('dashboard')" class="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs">
            Return to Dashboard
          </button>
        </div>
      </div>
    `;
    this.loadHistory();
  },

  // Web Speech API: Text-to-Speech
  speakText(text) {
    if (!this.isTTSActive || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  },

  toggleTTS() {
    this.isTTSActive = !this.isTTSActive;
    if (!this.isTTSActive && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const btn = document.getElementById('tts-toggle-btn');
    if (btn) {
      btn.innerText = this.isTTSActive ? '🔊 Voice: ON' : '🔇 Voice: OFF';
    }
  },

  // Web Speech API: Speech-to-Text
  toggleRecording() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      state.showToast('Speech Recognition API not supported in this browser. Please type your response.', 'warning');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (this.isRecording) {
      if (this.recognition) this.recognition.stop();
      this.isRecording = false;
      this.updateMicUI(false);
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isRecording = true;
      this.updateMicUI(true);
      state.showToast('Listening to microphone...', 'info');
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      const input = document.getElementById('mock-answer-input');
      if (input && finalTranscript) {
        input.value += (input.value ? ' ' : '') + finalTranscript;
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isRecording = false;
      this.updateMicUI(false);
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      this.updateMicUI(false);
    };

    this.recognition.start();
  },

  updateMicUI(isRec) {
    const btn = document.getElementById('mic-btn');
    const label = document.getElementById('mic-label');
    const icon = document.getElementById('mic-icon');
    if (!btn) return;

    if (isRec) {
      btn.className = 'px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-2 animate-pulse';
      label.innerText = 'Listening... (Click to stop)';
      icon.innerText = '🔴';
    } else {
      btn.className = 'px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 transition-all';
      label.innerText = 'Record Voice (STT)';
      icon.innerText = '🎙️';
    }
  },

  async loadHistory() {
    try {
      const container = document.getElementById('mock-history-list');
      if (!container) return;
      const history = await api.getMockHistory();
      if (!history || history.length === 0) {
        container.innerHTML = '<div class="text-slate-400 text-xs">No previous practice sessions recorded yet.</div>';
        return;
      }

      container.innerHTML = history.map(h => `
        <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
          <div>
            <span class="font-extrabold text-slate-900 dark:text-white">${h.target_role}</span>
            <span class="text-slate-400 ml-2">• ${new Date(h.started_at).toLocaleDateString()}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-bold text-emerald-600">Score: ${h.overall_score || 80}/100</span>
            <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">${h.status}</span>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  }
};

window.MockInterviewView = MockInterviewView;

