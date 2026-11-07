// Administrator Portal View
const AdminView = {
  stats: null,
  users: [],

  async render() {
    return `
      <div class="space-y-8 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">⚙️</span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Administrator Control Center</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Platform administration, user account governance, role framework monitoring, and AI inference metrics.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <span class="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span> Role-Based Isolation Active
            </span>
          </div>
        </div>

        <!-- Metrics Overview Grid -->
        <div id="admin-stats-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
            <div class="text-xs text-slate-400 font-bold uppercase">Loading analytics...</div>
          </div>
        </div>

        <!-- Registered Students Table -->
        <div class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Registered Student Accounts</h3>
              <p class="text-xs text-slate-500">Manage account activation status without exposing private student credentials.</p>
            </div>
            <button onclick="AdminView.loadUsers()" class="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100">
              Refresh Users
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th class="py-3 px-4">Student ID</th>
                  <th class="py-3 px-4">Name</th>
                  <th class="py-3 px-4">Email</th>
                  <th class="py-3 px-4">Role</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody id="admin-users-table" class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr><td colspan="6" class="py-6 text-center text-slate-400">Loading student directory...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async loadStats() {
    try {
      const s = await api.getAdminStats();
      this.stats = s;
      const c = document.getElementById('admin-stats-container');
      if (!c) return;

      c.innerHTML = `
        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="text-xs font-bold text-slate-400 uppercase">Registered Students</div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mt-1">${s.total_students}</div>
          <div class="text-xs text-emerald-600 font-semibold mt-1">Active: ${s.active_students}</div>
        </div>
        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="text-xs font-bold text-slate-400 uppercase">Resumes Built</div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mt-1">${s.total_resumes_generated}</div>
          <div class="text-xs text-blue-600 font-semibold mt-1">100% ATS Verified</div>
        </div>
        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="text-xs font-bold text-slate-400 uppercase">Mock Interviews Conducted</div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mt-1">${s.total_mock_interviews}</div>
          <div class="text-xs text-purple-600 font-semibold mt-1">Voice & Text Enabled</div>
        </div>
        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="text-xs font-bold text-slate-400 uppercase">AI Inferences Run</div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mt-1">${s.ai_requests_processed}</div>
          <div class="text-xs text-emerald-600 font-semibold mt-1">Status: Operational</div>
        </div>
      `;
    } catch (e) {
      console.error(e);
    }
  },

  async loadUsers() {
    try {
      const users = await api.listAdminUsers();
      this.users = users;
      const tbody = document.getElementById('admin-users-table');
      if (!tbody) return;

      tbody.innerHTML = users.map(u => `
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
          <td class="py-3 px-4 font-mono text-slate-400">#${u.id}</td>
          <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${u.full_name}</td>
          <td class="py-3 px-4 text-slate-500">${u.email}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}">
              ${u.role}
            </span>
          </td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}">
              ${u.is_active ? 'Active' : 'Deactivated'}
            </span>
          </td>
          <td class="py-3 px-4 text-right">
            ${u.role !== 'admin' ? `
              <button onclick="AdminView.toggleStatus(${u.id})" class="px-3 py-1 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                ${u.is_active ? 'Deactivate' : 'Activate'}
              </button>
            ` : '<span class="text-slate-400 text-[11px]">System Admin</span>'}
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async toggleStatus(userId) {
    try {
      const res = await api.toggleUserStatus(userId);
      state.showToast(res.message, 'success');
      await this.loadUsers();
      await this.loadStats();
    } catch (e) {
      state.showToast(e.message, 'error');
    }
  }
};

window.AdminView = AdminView;

