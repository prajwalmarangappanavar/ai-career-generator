// Context-Aware AI Career Counselor Chatbot View
const ChatbotView = {
  conversationId: null,
  messages: [],

  async render() {
    return `
      <div class="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
        <!-- Chat Header -->
        <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
              🤖
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">CareerPulse AI Placement Counselor</h3>
              <div class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Profile Memory Active (Zero Hallucinations)
              </div>
            </div>
          </div>
          <button onclick="ChatbotView.clearChat()" class="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            Clear Chat
          </button>
        </div>

        <!-- Chat Stream Area -->
        <div id="chat-stream" class="flex-1 overflow-y-auto p-6 space-y-4">
          <div class="flex items-start gap-3 max-w-2xl">
            <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
              AI
            </div>
            <div class="p-4 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm">
              Hello! 👋 I'm your dedicated Career Counselor. I have analyzed your centralized verified profile. How can I help with your target career role, skill-gaps, placement interview prep, or resume today?
            </div>
          </div>
        </div>

        <!-- Suggested Prompt Pills -->
        <div class="px-6 py-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2" id="prompt-pills">
          <button onclick="ChatbotView.sendSuggested(this.innerText)" class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 transition-colors">
            What skills should I learn next for my role?
          </button>
          <button onclick="ChatbotView.sendSuggested(this.innerText)" class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 transition-colors">
            How can I improve my resume ATS score?
          </button>
          <button onclick="ChatbotView.sendSuggested(this.innerText)" class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 transition-colors">
            How should I prepare for campus placements?
          </button>
        </div>

        <!-- Input Box -->
        <form onsubmit="ChatbotView.handleSend(event)" class="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <input type="text" id="chat-input" placeholder="Ask about career paths, interview questions, or projects..." class="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" id="chat-send-btn" class="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 shrink-0">
            <span>Send</span> <span>➤</span>
          </button>
        </form>
      </div>
    `;
  },

  async handleSend(event) {
    event.preventDefault();
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    this.appendMessage('user', msg);

    const btn = document.getElementById('chat-send-btn');
    btn.disabled = true;

    try {
      const res = await api.sendChatMessage(msg, this.conversationId);
      this.conversationId = res.conversation_id;
      this.appendMessage('assistant', res.reply, res.suggested_followups);
    } catch (e) {
      this.appendMessage('assistant', `⚠️ Error communicating with advisor: ${e.message}`);
    } finally {
      btn.disabled = false;
    }
  },

  sendSuggested(text) {
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = text;
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    }
  },

  appendMessage(role, text, followups = []) {
    const stream = document.getElementById('chat-stream');
    if (!stream) return;

    const div = document.createElement('div');
    if (role === 'user') {
      div.className = 'flex items-start justify-end gap-3';
      div.innerHTML = `
        <div class="p-4 rounded-2xl rounded-tr-none bg-blue-600 text-white text-xs sm:text-sm leading-relaxed max-w-xl shadow-md">
          ${text}
        </div>
      `;
    } else {
      div.className = 'flex items-start gap-3 max-w-2xl animate-fade-in';
      div.innerHTML = `
        <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
          AI
        </div>
        <div class="p-4 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm space-y-2">
          <div>${this.formatMarkdown(text)}</div>
          ${followups && followups.length > 0 ? `
            <div class="pt-3 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap gap-1.5">
              ${followups.map(f => `
                <button onclick="ChatbotView.sendSuggested('${f.replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 hover:underline">
                  ? ${f}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    stream.appendChild(div);
    stream.scrollTop = stream.scrollHeight;
  },

  formatMarkdown(text) {
    return text
      .replace(/### (.*?)\n/g, '<h4 class="font-black text-sm text-slate-900 dark:text-white mb-1 mt-2">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n• /g, '<br/>• ');
  },

  clearChat() {
    this.conversationId = null;
    const stream = document.getElementById('chat-stream');
    if (stream) {
      stream.innerHTML = `
        <div class="flex items-start gap-3 max-w-2xl">
          <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
            AI
          </div>
          <div class="p-4 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm">
            Chat cleared! How can I assist your placement preparation today?
          </div>
        </div>
      `;
    }
  }
};

window.ChatbotView = ChatbotView;

