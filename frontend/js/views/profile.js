// Centralized Student Profile View (Single Source of Truth)
const ProfileView = {
  activeTab: 'personal', // personal, education, skills, projects, internships, certs, goals, history

  async render() {
    const p = state.profile || await api.getProfile();
    state.setProfile(p);

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Centralized Career Profile</h1>
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                Version ${p.current_version || 1}
              </span>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              The single source of truth for all AI generation. Updates create an immutable snapshot and maintain verified consistency.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="ProfileView.saveProfile()" class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all">
              Save & Create Snapshot
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          ${[
            ['personal', '👤 Personal Info'],
            ['education', '🎓 Education'],
            ['skills', '⚡ Skills Matrix'],
            ['projects', '📂 Projects'],
            ['internships', '💼 Internships'],
            ['certs', '📜 Certifications'],
            ['goals', '🎯 Career Preferences'],
            ['history', '🕒 Version History']
          ].map(([id, label]) => `
            <button onclick="ProfileView.switchTab('${id}')" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${this.activeTab === id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}">
              ${label}
            </button>
          `).join('')}
        </div>

        <!-- Tab Content -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          ${this.renderActiveTab(p)}
        </div>
      </div>
    `;
  },

  switchTab(tab) {
    this.activeTab = tab;
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = this.render();
    }
  },

  renderActiveTab(p) {
    if (this.activeTab === 'personal') {
      return `
        <div class="max-w-3xl space-y-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
              <input type="text" id="prof-fullname" value="${p.full_name || ''}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
              <input type="email" id="prof-email" value="${p.email || ''}" disabled class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-sm font-medium text-slate-400" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
              <input type="text" id="prof-phone" value="${p.phone || ''}" placeholder="+91 98765 43210" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Location</label>
              <input type="text" id="prof-location" value="${p.location || ''}" placeholder="Bengaluru, Karnataka, India" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Headline</label>
            <input type="text" id="prof-headline" value="${p.headline || ''}" placeholder="Aspiring AI Engineer | Final Year CS Student" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Professional Bio / About</label>
            <textarea id="prof-bio" rows="4" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium leading-relaxed">${p.bio || ''}</textarea>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'education') {
      const edus = p.educations || [];
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Academic Qualifications</h3>
            <button onclick="ProfileView.addEducationRow()" class="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100">
              + Add Degree
            </button>
          </div>
          <div id="education-rows" class="space-y-4">
            ${edus.map((e, idx) => `
              <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" data-index="${idx}">
                <div>
                  <label class="text-[11px] font-bold text-slate-500 uppercase">College / University</label>
                  <input type="text" value="${e.institution}" class="edu-inst w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                </div>
                <div>
                  <label class="text-[11px] font-bold text-slate-500 uppercase">Degree</label>
                  <input type="text" value="${e.degree}" class="edu-degree w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                </div>
                <div>
                  <label class="text-[11px] font-bold text-slate-500 uppercase">Department</label>
                  <input type="text" value="${e.department}" class="edu-dept w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                </div>
                <div>
                  <label class="text-[11px] font-bold text-slate-500 uppercase">Graduation Year</label>
                  <input type="number" value="${e.graduation_year}" class="edu-year w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                </div>
                <div>
                  <label class="text-[11px] font-bold text-slate-500 uppercase">CGPA / Percentage</label>
                  <input type="text" value="${e.cgpa || ''}" class="edu-cgpa w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                </div>
                <div>
                  <label class="text-[11px] font-bold text-slate-500 uppercase">Relevant Subjects</label>
                  <input type="text" value="${e.relevant_courses || ''}" class="edu-courses w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'skills') {
      const skills = p.skills || [];
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Skills Matrix & Proficiency</h3>
              <p class="text-xs text-slate-500">Rate your proficiency from 1 (Beginner) to 5 (Expert). Clearly distinguished from verified assessments.</p>
            </div>
            <button onclick="ProfileView.addSkillRow()" class="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100">
              + Add Skill
            </button>
          </div>

          <div id="skills-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${skills.map((s, idx) => `
              <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4 skill-row" data-index="${idx}">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <input type="text" value="${s.name}" class="skill-name font-bold text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none text-slate-900 dark:text-white" />
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${s.is_verified ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}">
                      ${s.is_verified ? 'Verified' : 'Self-Reported'}
                    </span>
                  </div>
                  <div class="flex items-center gap-3">
                    <select class="skill-cat text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1">
                      <option value="technical" ${s.category === 'technical' ? 'selected' : ''}>Technical</option>
                      <option value="framework" ${s.category === 'framework' ? 'selected' : ''}>Framework</option>
                      <option value="database" ${s.category === 'database' ? 'selected' : ''}>Database</option>
                      <option value="tool" ${s.category === 'tool' ? 'selected' : ''}>Tool</option>
                      <option value="soft" ${s.category === 'soft' ? 'selected' : ''}>Soft Skill</option>
                    </select>
                    <div class="flex items-center gap-1.5 flex-1">
                      <input type="range" min="1" max="5" value="${s.proficiency}" oninput="this.nextElementSibling.innerText = this.value + '/5'" class="skill-prof w-full accent-blue-600" />
                      <span class="text-xs font-bold text-slate-600 dark:text-slate-400 w-8">${s.proficiency}/5</span>
                    </div>
                  </div>
                </div>
                <button onclick="this.closest('.skill-row').remove()" class="text-slate-400 hover:text-rose-500 font-bold text-lg p-1">
                  ✕
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'projects') {
      const projs = p.projects || [];
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Technical Projects</h3>
              <p class="text-xs text-slate-500">Showcase software products, architectures, and measurable outcomes.</p>
            </div>
            <button onclick="ProfileView.addProjectRow()" class="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100">
              + Add Project
            </button>
          </div>

          <div id="projects-list" class="space-y-4">
            ${projs.map((pj, idx) => `
              <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 project-row" data-index="${idx}">
                <div class="flex items-center justify-between">
                  <input type="text" value="${pj.title}" placeholder="Project Title" class="proj-title text-base font-extrabold bg-transparent text-slate-900 dark:text-white border-b border-transparent focus:border-blue-500 focus:outline-none w-2/3" />
                  <button onclick="this.closest('.project-row').remove()" class="text-slate-400 hover:text-rose-500 font-bold text-sm">
                    Delete Project
                  </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="text-[11px] font-bold text-slate-500 uppercase">Technologies Used</label>
                    <input type="text" value="${pj.technologies || ''}" placeholder="Python, FastAPI, React, Docker" class="proj-tech w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                  </div>
                  <div>
                    <label class="text-[11px] font-bold text-slate-500 uppercase">Your Role</label>
                    <input type="text" value="${pj.role || 'Developer'}" placeholder="Lead Developer" class="proj-role w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                  </div>
                </div>
                <div>
                  <label class="text-[11px] font-bold text-slate-500 uppercase">Description & Implementation Details</label>
                  <textarea rows="2" class="proj-desc w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium">${pj.description || ''}</textarea>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="text-[11px] font-bold text-slate-500 uppercase">Problem Statement</label>
                    <input type="text" value="${pj.problem_statement || ''}" class="proj-prob w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                  </div>
                  <div>
                    <label class="text-[11px] font-bold text-slate-500 uppercase">Measurable Outcomes</label>
                    <input type="text" value="${pj.outcomes || ''}" placeholder="Reduced latency by 40%, served 1200+ users" class="proj-outcomes w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'internships') {
      const interns = p.internships || [];
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Internships & Practical Work</h3>
            <button onclick="ProfileView.addInternshipRow()" class="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100">
              + Add Internship
            </button>
          </div>

          <div id="internships-list" class="space-y-4">
            ${interns.map((it, idx) => `
              <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 intern-row" data-index="${idx}">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <input type="text" value="${it.company}" placeholder="Company Name" class="it-comp font-extrabold text-base bg-transparent text-slate-900 dark:text-white border-b border-transparent focus:border-blue-500 focus:outline-none" />
                    <input type="text" value="${it.position}" placeholder="Position / Role" class="it-pos text-sm font-semibold text-blue-600 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none" />
                  </div>
                  <button onclick="this.closest('.intern-row').remove()" class="text-slate-400 hover:text-rose-500 font-bold text-sm">
                    Delete
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-[11px] font-bold text-slate-500 uppercase">Start Date</label>
                    <input type="text" value="${it.start_date || ''}" placeholder="June 2025" class="it-start w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                  </div>
                  <div>
                    <label class="text-[11px] font-bold text-slate-500 uppercase">End Date</label>
                    <input type="text" value="${it.end_date || ''}" placeholder="August 2025" class="it-end w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                  </div>
                </div>
                <div>
                  <label class="text-[11px] font-bold text-slate-500 uppercase">Key Responsibilities & Achievements</label>
                  <textarea rows="2" class="it-desc w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium">${it.description || ''}</textarea>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'certs') {
      const certs = p.certifications || [];
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Certifications & Accreditations</h3>
            <button onclick="ProfileView.addCertRow()" class="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100">
              + Add Certification
            </button>
          </div>

          <div id="certs-list" class="space-y-4">
            ${certs.map((c, idx) => `
              <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 grid grid-cols-1 sm:grid-cols-3 gap-3 cert-row" data-index="${idx}">
                <div>
                  <label class="text-[11px] font-bold text-slate-500 uppercase">Certification Name</label>
                  <input type="text" value="${c.name}" class="cert-name w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                </div>
                <div>
                  <label class="text-[11px] font-bold text-slate-500 uppercase">Issuing Organization</label>
                  <input type="text" value="${c.issuing_org}" class="cert-org w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                </div>
                <div class="flex items-end gap-2">
                  <div class="flex-1">
                    <label class="text-[11px] font-bold text-slate-500 uppercase">Issue Date / Credential ID</label>
                    <input type="text" value="${c.issue_date || ''}" class="cert-date w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
                  </div>
                  <button onclick="this.closest('.cert-row').remove()" class="text-slate-400 hover:text-rose-500 font-bold p-1">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'goals') {
      const g = p.career_goal || {};
      return `
        <div class="max-w-2xl space-y-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Career Goals & Preferences</h3>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Target Job Role</label>
            <input type="text" id="goal-role" value="${g.target_role || 'AI/ML Engineer'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Preferred Industry</label>
            <input type="text" id="goal-ind" value="${g.preferred_industry || 'Information Technology'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Short-Term Goals (Next 6-12 Months)</label>
            <textarea id="goal-short" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium">${g.short_term_goals || ''}</textarea>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Preferred Learning Style</label>
            <select id="goal-style" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium">
              <option value="Hands-on Project & Practical Code Labs" ${g.preferred_learning_style === 'Hands-on Project & Practical Code Labs' ? 'selected' : ''}>Hands-on Project & Practical Code Labs</option>
              <option value="Video Lectures & Step-by-Step Tutorials" ${g.preferred_learning_style === 'Video Lectures & Step-by-Step Tutorials' ? 'selected' : ''}>Video Lectures & Step-by-Step Tutorials</option>
              <option value="Official Documentation & Deep Reference Reading" ${g.preferred_learning_style === 'Official Documentation & Deep Reference Reading' ? 'selected' : ''}>Official Documentation & Deep Reference Reading</option>
            </select>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'history') {
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Profile Version History</h3>
              <p class="text-xs text-slate-500">Immutable snapshots recorded every time profile facts are updated.</p>
            </div>
            <button onclick="ProfileView.loadVersions()" class="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100">
              Refresh History
            </button>
          </div>

          <div id="versions-container" class="space-y-3">
            <div class="text-center py-8 text-slate-400 text-sm">Loading version history...</div>
          </div>
        </div>
      `;
    }

    return '';
  },

  async loadVersions() {
    try {
      const container = document.getElementById('versions-container');
      if (!container) return;
      const versions = await api.getProfileVersions();
      if (!versions || versions.length === 0) {
        container.innerHTML = '<div class="text-center text-slate-400 text-sm py-4">No snapshots recorded yet.</div>';
        return;
      }
      container.innerHTML = versions.map(v => `
        <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-sm text-slate-900 dark:text-white">Version ${v.version_number}</span>
              <span class="text-xs text-slate-400">• ${new Date(v.created_at).toLocaleString()}</span>
            </div>
            <div class="text-xs text-slate-600 dark:text-slate-400 mt-1">${v.change_summary}</div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            Immutable
          </span>
        </div>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  addSkillRow() {
    const list = document.getElementById('skills-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4 skill-row';
    div.innerHTML = `
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <input type="text" value="New Skill" class="skill-name font-bold text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none text-slate-900 dark:text-white" />
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Self-Reported</span>
        </div>
        <div class="flex items-center gap-3">
          <select class="skill-cat text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1">
            <option value="technical">Technical</option>
            <option value="framework">Framework</option>
            <option value="database">Database</option>
            <option value="tool">Tool</option>
            <option value="soft">Soft Skill</option>
          </select>
          <div class="flex items-center gap-1.5 flex-1">
            <input type="range" min="1" max="5" value="3" oninput="this.nextElementSibling.innerText = this.value + '/5'" class="skill-prof w-full accent-blue-600" />
            <span class="text-xs font-bold text-slate-600 dark:text-slate-400 w-8">3/5</span>
          </div>
        </div>
      </div>
      <button onclick="this.closest('.skill-row').remove()" class="text-slate-400 hover:text-rose-500 font-bold text-lg p-1">✕</button>
    `;
    list.prepend(div);
  },

  addProjectRow() {
    const list = document.getElementById('projects-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 project-row';
    div.innerHTML = `
      <div class="flex items-center justify-between">
        <input type="text" value="New Portfolio Project" placeholder="Project Title" class="proj-title text-base font-extrabold bg-transparent text-slate-900 dark:text-white border-b border-transparent focus:border-blue-500 focus:outline-none w-2/3" />
        <button onclick="this.closest('.project-row').remove()" class="text-slate-400 hover:text-rose-500 font-bold text-sm">Delete Project</button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="text-[11px] font-bold text-slate-500 uppercase">Technologies Used</label>
          <input type="text" value="Python, FastAPI, React" class="proj-tech w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
        </div>
        <div>
          <label class="text-[11px] font-bold text-slate-500 uppercase">Your Role</label>
          <input type="text" value="Developer" class="proj-role w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium" />
        </div>
      </div>
      <div>
        <label class="text-[11px] font-bold text-slate-500 uppercase">Description</label>
        <textarea rows="2" class="proj-desc w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium">Engineered scalable components and integrated database schema.</textarea>
      </div>
    `;
    list.prepend(div);
  },

  addEducationRow() {
    const rows = document.getElementById('education-rows');
    if (!rows) return;
    const div = document.createElement('div');
    div.className = 'p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4';
    div.innerHTML = `
      <div><label class="text-[11px] font-bold text-slate-500 uppercase">College</label><input type="text" value="University Name" class="edu-inst w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs" /></div>
      <div><label class="text-[11px] font-bold text-slate-500 uppercase">Degree</label><input type="text" value="Bachelor of Technology" class="edu-degree w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs" /></div>
      <div><label class="text-[11px] font-bold text-slate-500 uppercase">Department</label><input type="text" value="Computer Science" class="edu-dept w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs" /></div>
      <div><label class="text-[11px] font-bold text-slate-500 uppercase">Grad Year</label><input type="number" value="2026" class="edu-year w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs" /></div>
      <div><label class="text-[11px] font-bold text-slate-500 uppercase">CGPA</label><input type="text" value="8.5" class="edu-cgpa w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs" /></div>
      <div><label class="text-[11px] font-bold text-slate-500 uppercase">Subjects</label><input type="text" value="DSA, DBMS" class="edu-courses w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs" /></div>
    `;
    rows.prepend(div);
  },

  async saveProfile() {
    const p = state.profile || {};
    
    // Gather all fields
    const headline = document.getElementById('prof-headline') ? document.getElementById('prof-headline').value : p.headline;
    const phone = document.getElementById('prof-phone') ? document.getElementById('prof-phone').value : p.phone;
    const location = document.getElementById('prof-location') ? document.getElementById('prof-location').value : p.location;
    const bio = document.getElementById('prof-bio') ? document.getElementById('prof-bio').value : p.bio;

    // Skills
    const skillRows = document.querySelectorAll('.skill-row');
    let skills = p.skills || [];
    if (skillRows.length > 0) {
      skills = Array.from(skillRows).map(r => ({
        name: r.querySelector('.skill-name').value.trim(),
        category: r.querySelector('.skill-cat').value,
        proficiency: parseInt(r.querySelector('.skill-prof').value, 10),
        years_experience: 1.5,
        is_verified: true
      }));
    }

    // Projects
    const projRows = document.querySelectorAll('.project-row');
    let projects = p.projects || [];
    if (projRows.length > 0) {
      projects = Array.from(projRows).map(r => ({
        title: r.querySelector('.proj-title').value.trim(),
        technologies: r.querySelector('.proj-tech').value.trim(),
        role: r.querySelector('.proj-role').value.trim(),
        description: r.querySelector('.proj-desc').value.trim(),
        problem_statement: r.querySelector('.proj-prob') ? r.querySelector('.proj-prob').value.trim() : '',
        outcomes: r.querySelector('.proj-outcomes') ? r.querySelector('.proj-outcomes').value.trim() : ''
      }));
    }

    // Goals
    const goalRole = document.getElementById('goal-role');
    let career_goal = p.career_goal;
    if (goalRole) {
      career_goal = {
        target_role: goalRole.value.trim(),
        preferred_industry: document.getElementById('goal-ind').value.trim(),
        short_term_goals: document.getElementById('goal-short').value.trim(),
        preferred_learning_style: document.getElementById('goal-style').value
      };
    }

    const payload = {
      headline,
      phone,
      location,
      bio,
      skills,
      projects,
      career_goal,
      change_summary: `Snapshot Version ${p.current_version + 1} update`
    };

    try {
      state.showToast('Saving and creating immutable snapshot...', 'info');
      const updated = await api.updateProfile(payload);
      state.setProfile(updated);
      state.showToast(`Profile snapshot v${updated.current_version} created successfully!`, 'success');
      this.switchTab(this.activeTab);
    } catch (err) {
      state.showToast(err.message, 'error');
    }
  }
};

window.ProfileView = ProfileView;

