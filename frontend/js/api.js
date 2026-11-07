// CareerPulse AI - Central API Client
const API_BASE = '/api/v1';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('careerpulse_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('careerpulse_token', token);
    } else {
      localStorage.removeItem('careerpulse_token');
    }
  }

  getToken() {
    return this.token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);

      if (response.status === 401) {
        this.setToken(null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  // --- Auth ---
  async register(data) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async login(data) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // --- Profile (Single Source of Truth) ---
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(data) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getProfileVersions() {
    return this.request('/profile/versions');
  }

  // --- Career Content Generation ---
  async generateCareerContent(profileType = 'entry_level', tone = 'Professional') {
    return this.request('/career-content/generate', {
      method: 'POST',
      body: JSON.stringify({ version_profile_type: profileType, tone })
    });
  }

  // --- Skill Gap Analysis ---
  async getCareerRoles() {
    return this.request('/skill-gap/roles');
  }

  async analyzeSkillGap(roleId = null, roleName = null) {
    return this.request('/skill-gap/analyze', {
      method: 'POST',
      body: JSON.stringify({ target_role_id: roleId, target_role_name: roleName })
    });
  }

  // --- Learning & Assessments ---
  async getLearningResources(skill = null, type = null) {
    let url = '/learning/resources?';
    if (skill) url += `skill=${encodeURIComponent(skill)}&`;
    if (type) url += `resource_type=${encodeURIComponent(type)}&`;
    return this.request(url);
  }

  async getAssessments(skill = null) {
    const url = skill ? `/learning/assessments?skill=${encodeURIComponent(skill)}` : '/learning/assessments';
    return this.request(url);
  }

  async submitAssessment(assessmentId, selectedIndex) {
    return this.request('/learning/assessments/submit', {
      method: 'POST',
      body: JSON.stringify({ assessment_id: assessmentId, selected_option_index: selectedIndex })
    });
  }

  // --- Career Roadmaps ---
  async getCurrentRoadmap(timeframe = '90_days') {
    return this.request(`/roadmap/current?timeframe=${timeframe}`);
  }

  async generateRoadmap(targetRole, timeframe = '90_days') {
    return this.request('/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify({ target_role: targetRole, timeframe })
    });
  }

  async toggleRoadmapTask(taskId) {
    return this.request(`/roadmap/task/${taskId}/toggle`, { method: 'POST' });
  }

  async updateTaskNotes(taskId, notes, deadline) {
    return this.request(`/roadmap/task/${taskId}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes, deadline })
    });
  }

  // --- AI Resume Builder ---
  async getLatestResume(template = 'modern') {
    return this.request(`/resume/latest?template=${template}`);
  }

  async generateResume(template = 'modern', targetRole = null) {
    return this.request('/resume/generate', {
      method: 'POST',
      body: JSON.stringify({ template_name: template, target_role: targetRole })
    });
  }

  async updateResume(resumeId, content) {
    return this.request(`/resume/${resumeId}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  }

  // --- AI Cover Letter ---
  async generateCoverLetter(targetCompany, targetRole, jobDesc = '', tone = 'Professional', letterType = 'fresher') {
    return this.request('/cover-letter/generate', {
      method: 'POST',
      body: JSON.stringify({
        target_company: targetCompany,
        target_role: targetRole,
        job_description: jobDesc,
        tone: tone,
        letter_type: letterType
      })
    });
  }

  // --- Interview Prep & Mock Interview ---
  async getInterviewQuestions(category = null, targetRole = null, difficulty = null) {
    let url = '/interview/questions?';
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (targetRole) url += `target_role=${encodeURIComponent(targetRole)}&`;
    if (difficulty) url += `difficulty=${encodeURIComponent(difficulty)}&`;
    return this.request(url);
  }

  async startMockInterview(targetRole, interviewType = 'Technical & Behavioral', totalQ = 5) {
    return this.request('/interview/mock/start', {
      method: 'POST',
      body: JSON.stringify({ target_role: targetRole, interview_type: interviewType, total_questions: totalQ })
    });
  }

  async submitMockAnswer(mockInterviewId, questionId, questionText, answer, transcript = '') {
    return this.request('/interview/mock/submit-answer', {
      method: 'POST',
      body: JSON.stringify({
        mock_interview_id: mockInterviewId,
        question_id: questionId,
        question_text: questionText,
        student_answer: answer,
        audio_transcript: transcript
      })
    });
  }

  async getMockHistory() {
    return this.request('/interview/mock/history');
  }

  // --- Job Description Matcher ---
  async analyzeJobDescription(title, company, text) {
    return this.request('/job-matcher/analyze', {
      method: 'POST',
      body: JSON.stringify({ job_title: title, company_name: company, job_description_text: text })
    });
  }

  // --- Project Recommendations ---
  async getProjectRecommendations(role = null) {
    const url = role ? `/projects/recommendations?target_role=${encodeURIComponent(role)}` : '/projects/recommendations';
    return this.request(url);
  }

  async adoptProject(title) {
    return this.request(`/projects/adopt/${encodeURIComponent(title)}`, { method: 'POST' });
  }

  // --- Chatbot ---
  async sendChatMessage(message, conversationId = null) {
    return this.request('/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId })
    });
  }

  async getChatHistory() {
    return this.request('/chatbot/history');
  }

  // --- Export Download URLs ---
  getResumePdfUrl() {
    return `${API_BASE}/export/resume/pdf?token=${this.token}`;
  }

  getResumeDocxUrl() {
    return `${API_BASE}/export/resume/docx?token=${this.token}`;
  }

  getCoverLetterPdfUrl() {
    return `${API_BASE}/export/cover-letter/pdf?token=${this.token}`;
  }

  getSkillGapPdfUrl() {
    return `${API_BASE}/export/skill-gap/pdf?token=${this.token}`;
  }

  // --- Admin ---
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async listAdminUsers() {
    return this.request('/admin/users');
  }

  async toggleUserStatus(userId) {
    return this.request(`/admin/users/${userId}/toggle-status`, { method: 'POST' });
  }
}

const api = new APIClient();
window.api = api;

