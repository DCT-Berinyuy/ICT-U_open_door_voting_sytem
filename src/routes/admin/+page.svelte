<script lang="ts">
  import { onMount } from 'svelte';

  let passcode = $state('');
  let isLoggedIn = $state(false);
  let loginError = $state('');
  let loading = $state(false);

  // Dashboard Data
  let results = $state<any[]>([]);
  let voteLogs = $state<any[]>([]);
  let votingOpen = $state(true);

  // Tab navigation
  let activeTab = $state('dashboard'); // 'dashboard', 'logs', or 'projects'

  // Modal States
  let showAddModal = $state(false);
  let showEditModal = $state(false);
  let selectedProjectId = $state('');

  // Project Form States
  let projectForm = $state({
    number: '',
    title: '',
    category: 'AI',
    hall: 'George Mbarika Hall',
    presenters: ''
  });

  const categories = [
    'AI',
    'Cybersecurity',
    'Networking',
    'IoT',
    'Software Engineering',
    'Embedded Systems',
    'Renewable Energy'
  ];

  const halls = [
    'George Mbarika Hall',
    'Chumbow Hall',
    'Eric Mbarika Hall',
    'Courtyard'
  ];

  // Statistics
  let totalProjects = $derived(results.length);
  let totalVotes = $derived(voteLogs.length);
  let uniqueVoters = $derived(new Set(voteLogs.map(log => log.voter_phone)).size);

  async function fetchAdminData(authPasscode: string) {
    loading = true;
    try {
      const res = await fetch('/admin/api', {
        headers: {
          'x-admin-passcode': authPasscode
        }
      });

      if (res.status === 401) {
        loginError = 'Incorrect passcode. Access Denied.';
        isLoggedIn = false;
        sessionStorage.removeItem('admin_passcode');
      } else if (res.ok) {
        const data = await res.json();
        results = data.results;
        voteLogs = data.voteLogs;
        votingOpen = data.votingOpen;
        isLoggedIn = true;
        loginError = '';
        sessionStorage.setItem('admin_passcode', authPasscode);
      } else {
        loginError = 'An error occurred while fetching dashboard data.';
      }
    } catch (err) {
      console.error(err);
      loginError = 'Connection error.';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    const savedPasscode = sessionStorage.getItem('admin_passcode');
    if (savedPasscode) {
      fetchAdminData(savedPasscode);
    }
  });

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    if (!passcode) return;
    await fetchAdminData(passcode);
  }

  async function toggleVoting() {
    const activePasscode = sessionStorage.getItem('admin_passcode');
    if (!activePasscode) return;

    try {
      const res = await fetch('/admin/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': activePasscode
        },
        body: JSON.stringify({ action: 'toggle_voting', open: !votingOpen })
      });

      if (res.ok) {
        const data = await res.json();
        votingOpen = data.votingOpen;
      } else {
        alert('Failed to update voting status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to settings API.');
    }
  }

  // CREATE project
  async function submitCreateProject(e: SubmitEvent) {
    e.preventDefault();
    const activePasscode = sessionStorage.getItem('admin_passcode');
    if (!activePasscode) return;

    // Validation: check unique number
    const numExists = results.some(p => Number(p.number) === Number(projectForm.number));
    if (numExists) {
      alert(`Project number ${projectForm.number} already exists.`);
      return;
    }

    try {
      const res = await fetch('/admin/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': activePasscode
        },
        body: JSON.stringify({
          action: 'create_project',
          project: projectForm
        })
      });

      if (res.ok) {
        showAddModal = false;
        // reset form
        projectForm = { number: '', title: '', category: 'AI', hall: 'George Mbarika Hall', presenters: '' };
        await fetchAdminData(activePasscode);
      } else {
        const err = await res.json();
        alert('Failed to create project: ' + (err.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error creating project.');
    }
  }

  // Open Edit Modal
  function openEditModal(project: any) {
    selectedProjectId = project.project_id || project.id;
    projectForm = {
      number: String(project.number),
      title: project.title,
      category: project.category,
      hall: project.hall,
      presenters: project.presenters || ''
    };
    showEditModal = true;
  }

  // UPDATE project
  async function submitEditProject(e: SubmitEvent) {
    e.preventDefault();
    const activePasscode = sessionStorage.getItem('admin_passcode');
    if (!activePasscode) return;

    // Validation: check unique number excluding the project itself
    const numExists = results.some(p => p.project_id !== selectedProjectId && Number(p.number) === Number(projectForm.number));
    if (numExists) {
      alert(`Project number ${projectForm.number} already exists.`);
      return;
    }

    try {
      const res = await fetch('/admin/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': activePasscode
        },
        body: JSON.stringify({
          action: 'update_project',
          id: selectedProjectId,
          project: projectForm
        })
      });

      if (res.ok) {
        showEditModal = false;
        // reset form
        projectForm = { number: '', title: '', category: 'AI', hall: 'George Mbarika Hall', presenters: '' };
        await fetchAdminData(activePasscode);
      } else {
        const err = await res.json();
        alert('Failed to update project: ' + (err.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error updating project.');
    }
  }

  // DELETE project
  async function deleteProject(project: any) {
    const activePasscode = sessionStorage.getItem('admin_passcode');
    if (!activePasscode) return;

    const projectId = project.project_id || project.id;
    const confirmDelete = confirm(`Are you sure you want to delete Project #${project.number}: "${project.title}"?\nThis will ALSO permanently delete all associated votes for this project!`);
    if (!confirmDelete) return;

    try {
      const res = await fetch('/admin/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': activePasscode
        },
        body: JSON.stringify({
          action: 'delete_project',
          id: projectId
        })
      });

      if (res.ok) {
        await fetchAdminData(activePasscode);
      } else {
        const err = await res.json();
        alert('Failed to delete project: ' + (err.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting project.');
    }
  }

  function exportCSV() {
    if (results.length === 0) return;

    const headers = ['Rank', 'Project Number', 'Project Title', 'Category', 'Hall', 'Vote Count'];
    const rows = results.map((r, i) => [
      i + 1,
      r.number,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.category.replace(/"/g, '""')}"`,
      `"${r.hall.replace(/"/g, '""')}"`,
      r.vote_count
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tech_expo_voting_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_passcode');
    isLoggedIn = false;
    passcode = '';
    results = [];
    voteLogs = [];
  }

  // Format date to local readable format
  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString();
  }

  // Format numbers
  function formatNum(num: number) {
    return String(num).padStart(2, '0');
  }
</script>

<svelte:head>
  <title>Admin Portal - Open Doors Voting</title>
</svelte:head>

{#if !isLoggedIn}
  <!-- Passcode Login Overlay (Displayed on top) -->
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md" id="login-overlay">
    <div class="w-full max-w-sm mx-4 glass-panel rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center rotate-entrance">
      <div class="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(245,130,32,0.4)]">
        <span class="material-symbols-outlined text-white text-3xl" style="font-variation-settings: 'FILL' 1;">lock</span>
      </div>
      <h3 class="text-headline-lg font-headline-lg text-on-surface mb-2 font-bold text-[24px]">Admin Access</h3>
      <p class="text-body-md text-on-surface-variant mb-6 text-[14px]">Please enter the administrator passcode to unlock the voting control dashboard.</p>
      
      <form onsubmit={handleLogin} class="w-full space-y-4">
        <div>
          <input
            bind:value={passcode}
            type="password"
            class="w-full bg-surface-container border border-outline-variant/30 rounded-xl py-3 px-4 text-center text-xl text-secondary font-bold focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all placeholder:text-on-surface-variant/30"
            placeholder="••••••"
            required
          />
        </div>

        {#if loginError}
          <p class="text-error text-label-sm font-semibold">{loginError}</p>
        {/if}

        <button
          type="submit"
          disabled={loading}
          class="w-full py-4 bg-secondary text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(245,130,32,0.3)] hover:scale-[1.01] active:scale-95 transition-all cursor-pointer disabled:bg-secondary/60"
        >
          {#if loading}
            <span>UNLOCKING...</span>
          {:else}
            <span>UNLOCK DASHBOARD</span>
          {/if}
        </button>
      </form>
    </div>
  </div>
{/if}

{#if isLoggedIn}
  <div class="flex min-h-screen bg-primary-container text-on-surface font-body-md">
    
    <!-- Navigation Drawer (SideNav) -->
    <aside class="fixed left-0 top-0 h-full flex flex-col p-4 z-50 bg-surface-container-high dark:bg-surface-container-lowest w-64 border-r border-outline-variant/20 shadow-xl hidden md:flex">
      <div class="flex items-center gap-3 px-2 py-4 mb-8">
        <div class="w-8 h-8 overflow-hidden flex items-center justify-center rounded bg-white p-0.5 shadow-sm shrink-0">
          <img alt="ICT University Logo" class="h-full object-contain" src="/Assets/logo.jpeg" />
        </div>
        <div>
          <h1 class="font-headline-lg text-secondary dark:text-secondary-fixed leading-tight font-extrabold text-[16px] md:text-[18px]">Admin Portal</h1>
          <p class="text-[10px] md:text-[11px] font-label-sm text-on-surface-variant leading-none mt-0.5">ICTU Tech Expo</p>
        </div>
      </div>
      <nav class="flex-1 space-y-2">
        <button
          onclick={() => activeTab = 'dashboard'}
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-left cursor-pointer
            {activeTab === 'dashboard' 
              ? 'bg-secondary text-on-secondary shadow-[0_4px_20px_rgba(245,130,32,0.3)] brightness-110' 
              : 'text-on-surface-variant hover:bg-surface-variant/20 hover:translate-x-1'}"
        >
          <span class="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </button>
        <button
          onclick={() => activeTab = 'logs'}
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-left cursor-pointer
            {activeTab === 'logs' 
              ? 'bg-secondary text-on-secondary shadow-[0_4px_20px_rgba(245,130,32,0.3)] brightness-110' 
              : 'text-on-surface-variant hover:bg-surface-variant/20 hover:translate-x-1'}"
        >
          <span class="material-symbols-outlined">group</span>
          <span>Voter Logs</span>
        </button>
        <button
          onclick={() => activeTab = 'projects'}
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-left cursor-pointer
            {activeTab === 'projects' 
              ? 'bg-secondary text-on-secondary shadow-[0_4px_20px_rgba(245,130,32,0.3)] brightness-110' 
              : 'text-on-surface-variant hover:bg-surface-variant/20 hover:translate-x-1'}"
        >
          <span class="material-symbols-outlined">folder_open</span>
          <span>Manage Projects</span>
        </button>
      </nav>
      <div class="mt-auto p-4 flex items-center justify-between rounded-xl bg-surface-variant/10 border border-outline-variant/10">
        <div class="flex items-center gap-2 overflow-hidden">
          <div class="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-secondary text-sm">account_circle</span>
          </div>
          <span class="text-label-sm text-on-surface-variant truncate font-semibold">ICTU Admin</span>
        </div>
        <button onclick={handleLogout} class="text-error hover:text-error/80 p-1 rounded hover:bg-white/5" title="Logout">
          <span class="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Canvas -->
    <main class="md:ml-64 flex-1 p-6 md:p-8 flex flex-col gap-6 w-full overflow-hidden">
      
      <!-- Top header for mobile -->
      <div class="flex items-center justify-between md:hidden border-b border-outline-variant/20 pb-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 overflow-hidden flex items-center justify-center rounded bg-white p-0.5 shadow-sm shrink-0">
            <img alt="ICT University Logo" class="h-full object-contain" src="/Assets/logo.jpeg" />
          </div>
          <span class="font-bold text-base text-secondary">Admin Portal</span>
        </div>
        <div class="flex items-center gap-2 overflow-x-auto">
          <button 
            onclick={() => activeTab = 'dashboard'}
            class="px-2.5 py-1.5 text-on-surface text-label-sm rounded-lg {activeTab === 'dashboard' ? 'bg-secondary text-white' : 'bg-surface-variant/40'}"
          >
            Dashboard
          </button>
          <button 
            onclick={() => activeTab = 'logs'}
            class="px-2.5 py-1.5 text-on-surface text-label-sm rounded-lg ml-1 {activeTab === 'logs' ? 'bg-secondary text-white' : 'bg-surface-variant/40'}"
          >
            Logs
          </button>
          <button 
            onclick={() => activeTab = 'projects'}
            class="px-2.5 py-1.5 text-on-surface text-label-sm rounded-lg ml-1 {activeTab === 'projects' ? 'bg-secondary text-white' : 'bg-surface-variant/40'}"
          >
            Projects
          </button>
          <button onclick={handleLogout} class="text-error p-1 ml-2 shrink-0">
            <span class="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>

      <!-- Header Content -->
      <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 class="text-display-lg font-display-lg text-on-surface mb-1 font-black text-[28px] md:text-[36px]">
            {#if activeTab === 'dashboard'}Project Overview{:else if activeTab === 'logs'}Voter Submission Logs{:else}Project Directory{/if}
          </h2>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full {votingOpen ? 'bg-secondary animate-pulse shadow-[0_0_8px_#F58220]' : 'bg-error'}"></span>
            <span class="text-label-sm font-label-sm text-on-surface-variant tracking-widest uppercase">
              {votingOpen ? 'LIVE VOTING SESSION ACTIVE' : 'VOTING SESSION CLOSED'}
            </span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <!-- Add Project Button (Shown only in projects tab) -->
          {#if activeTab === 'projects'}
            <button
              onclick={() => {
                projectForm = { number: '', title: '', category: 'AI', hall: 'George Mbarika Hall', presenters: '' };
                showAddModal = true;
              }}
              class="flex items-center gap-2 px-5 py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all font-bold tracking-tight cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              <span>ADD PROJECT</span>
            </button>
          {/if}

          <!-- Refresh button -->
          <button
            onclick={() => fetchAdminData(sessionStorage.getItem('admin_passcode') || '')}
            class="flex items-center justify-center p-3 bg-surface-variant text-on-surface rounded-xl hover:bg-surface-variant/80 transition-all border border-outline-variant/30 cursor-pointer"
            title="Refresh Data"
          >
            <span class="material-symbols-outlined text-sm">refresh</span>
          </button>
          
          <!-- Export CSV Button -->
          <button
            onclick={exportCSV}
            disabled={results.length === 0}
            class="flex items-center gap-2 px-5 py-3 bg-surface-variant text-on-surface disabled:opacity-50 rounded-xl hover:bg-surface-variant/80 transition-all border border-outline-variant/30 font-bold tracking-tight cursor-pointer"
          >
            <span class="material-symbols-outlined text-sm">download</span>
            <span>EXPORT CSV</span>
          </button>
          
          <!-- Close Voting Toggle -->
          <div class="flex items-center gap-4 bg-surface-container-high px-5 py-3 rounded-xl border border-outline-variant/30">
            <span class="text-label-sm font-bold text-on-surface uppercase tracking-tight text-[11px] md:text-[12px]">VOTING ACTIVE</span>
            <button
              class="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer
                {votingOpen ? 'bg-secondary' : 'bg-outline-variant'}"
              onclick={toggleVoting}
              aria-label="Toggle Voting Active"
            >
              <div
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  {votingOpen ? 'translate-x-6' : 'translate-x-1'}"
              ></div>
            </button>
          </div>
        </div>
      </header>

      <!-- Stats Overview Row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-5 rounded-2xl glass-panel flex flex-col justify-between h-28 border-l-4 border-l-secondary shadow-md">
          <span class="text-label-sm font-label-sm text-on-surface-variant font-semibold">TOTAL PROJECTS</span>
          <span class="text-headline-lg font-headline-lg font-black text-2xl md:text-3xl">{totalProjects}</span>
        </div>
        <div class="p-5 rounded-2xl glass-panel flex flex-col justify-between h-28 border-l-4 border-l-primary shadow-md">
          <span class="text-label-sm font-label-sm text-on-surface-variant font-semibold">TOTAL VOTES CAST</span>
          <span class="text-headline-lg font-headline-lg font-black text-2xl md:text-3xl">{totalVotes.toLocaleString()}</span>
        </div>
        <div class="p-5 rounded-2xl glass-panel flex flex-col justify-between h-28 border-l-4 border-l-tertiary shadow-md">
          <span class="text-label-sm font-label-sm text-on-surface-variant font-semibold">UNIQUE VOTERS</span>
          <span class="text-headline-lg font-headline-lg font-black text-2xl md:text-3xl">{uniqueVoters.toLocaleString()}</span>
        </div>
      </div>

      {#if activeTab === 'dashboard'}
        <!-- Data Table Section: Projects Rankings -->
        <div class="flex-1 rounded-2xl glass-panel overflow-hidden border border-outline-variant/20 flex flex-col shadow-lg">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr class="bg-surface-container-highest/30 border-b border-outline-variant/30">
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Rank</th>
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Project Name</th>
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Booth/Hall</th>
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Category</th>
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold text-center">Total Votes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/10">
                {#each results as project, i (project.project_id)}
                  <tr class="hover:bg-white/5 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center font-bold font-label-sm shadow-sm
                        {i === 0 ? 'bg-secondary/35 text-secondary font-black scale-105' : ''}">
                        {formatNum(i + 1)}
                      </div>
                    </td>
                    <td class="px-6 py-4 font-bold text-on-surface text-[15px]">{project.title}</td>
                    <td class="px-6 py-4 text-on-surface-variant font-semibold text-[13px]">{project.hall} (Booth #{project.number})</td>
                    <td class="px-6 py-4">
                      <span class="bg-primary-container/20 text-primary px-3 py-1 rounded-full text-label-sm border border-primary/20">
                        {project.category}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex flex-col items-center justify-center">
                        <span class="text-body-lg font-bold text-secondary">{project.vote_count}</span>
                        <div class="w-24 h-1 bg-outline-variant/20 rounded-full mt-1 overflow-hidden">
                          <div 
                            class="h-full bg-secondary transition-all duration-500 {i === 0 ? 'shimmer-bg' : ''}" 
                            style="width: {results[0]?.vote_count > 0 ? Math.round((project.vote_count / results[0].vote_count) * 100) : 0}%;"
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                {:else}
                  <tr>
                    <td colspan="5" class="py-12 text-center text-on-surface-variant">
                      <span class="material-symbols-outlined text-4xl mb-2 opacity-50">description</span>
                      <p>No project data loaded. Clear seeds or add projects to begin.</p>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>

      {:else if activeTab === 'logs'}
        <!-- Data Table Section: Voter Logs -->
        <div class="flex-1 rounded-2xl glass-panel overflow-hidden border border-outline-variant/20 flex flex-col shadow-lg">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr class="bg-surface-container-highest/30 border-b border-outline-variant/30">
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Voter Name</th>
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Phone Number</th>
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Voted For</th>
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/10">
                {#each voteLogs as log (log.id)}
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4 font-bold text-on-surface text-[14px]">{log.voter_name}</td>
                    <td class="px-6 py-4 font-label-sm text-secondary font-semibold text-[13px]">{log.voter_phone}</td>
                    <td class="px-6 py-4 text-[14px]">
                      {#if log.projects}
                        <span class="font-bold text-on-surface">Project #{formatNum(log.projects.number)}:</span> {log.projects.title}
                      {:else}
                        <span class="text-on-surface-variant italic">Unknown Project</span>
                      {/if}
                    </td>
                    <td class="px-6 py-4 text-[13px] text-on-surface-variant font-semibold">{formatDate(log.created_at)}</td>
                  </tr>
                {:else}
                  <tr>
                    <td colspan="4" class="py-12 text-center text-on-surface-variant">
                      <span class="material-symbols-outlined text-4xl mb-2 opacity-50">how_to_vote</span>
                      <p>No votes have been cast yet.</p>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>

      {:else}
        <!-- Data Table Section: Manage Projects Directory -->
        <div class="flex-1 rounded-2xl glass-panel overflow-hidden border border-outline-variant/20 flex flex-col shadow-lg">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr class="bg-surface-container-highest/30 border-b border-outline-variant/30">
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Booth #</th>
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Title</th>
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Category</th>
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Hall Location</th>
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Presenters / Team</th>
                  <th class="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/10">
                {#each results as project (project.project_id)}
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4 font-bold text-secondary text-[15px]">{formatNum(project.number)}</td>
                    <td class="px-6 py-4 font-bold text-on-surface text-[14px]">{project.title}</td>
                    <td class="px-6 py-4">
                      <span class="bg-secondary-container/10 text-secondary border border-secondary/25 px-2.5 py-0.5 rounded-full text-label-sm font-semibold">
                        {project.category}
                      </span>
                    </td>
                    <td class="px-6 py-4 font-semibold text-on-surface-variant text-[13px]">{project.hall}</td>
                    <td class="px-6 py-4 text-on-surface-variant text-[13px]">{project.presenters || '—'}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center gap-2">
                        <button
                          onclick={() => openEditModal(project)}
                          class="p-2 bg-white/5 hover:bg-secondary/20 text-on-surface hover:text-secondary rounded-lg transition-colors border border-white/10 cursor-pointer"
                          title="Edit Project"
                        >
                          <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onclick={() => deleteProject(project)}
                          class="p-2 bg-white/5 hover:bg-error/25 text-on-surface hover:text-error rounded-lg transition-colors border border-white/10 cursor-pointer"
                          title="Delete Project"
                        >
                          <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                {:else}
                  <tr>
                    <td colspan="6" class="py-12 text-center text-on-surface-variant">
                      <span class="material-symbols-outlined text-4xl mb-2 opacity-50">folder_zip</span>
                      <p>No projects registered. Click "Add Project" above to create one.</p>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}

      <footer class="text-center py-4 text-label-sm text-outline-variant/40 border-t border-outline-variant/10 mt-auto">
        © 2026 ICT University Tech Expo Admin System. All actions are logged.
      </footer>
    </main>
  </div>
{/if}

<!-- ADD PROJECT MODAL -->
{#if showAddModal}
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div class="w-full max-w-lg mx-4 glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl rotate-entrance">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-title-md font-bold text-secondary flex items-center gap-2">
          <span class="material-symbols-outlined">add_box</span>
          <span>Add New Exhibition Project</span>
        </h3>
        <button onclick={() => showAddModal = false} class="text-on-surface-variant hover:text-white">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <form onsubmit={submitCreateProject} class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5 col-span-1">
            <label class="text-label-sm text-on-surface-variant" for="projNum">Project Number</label>
            <input
              id="projNum"
              type="number"
              bind:value={projectForm.number}
              class="w-full bg-surface-container border border-white/20 rounded-lg p-2.5 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
              placeholder="e.g. 14"
              required
            />
          </div>
          <div class="space-y-1.5 col-span-1">
            <label class="text-label-sm text-on-surface-variant" for="projCat">Category</label>
            <select
              id="projCat"
              bind:value={projectForm.category}
              class="w-full bg-surface-container border border-white/20 rounded-lg p-2.5 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
            >
              {#each categories as cat}
                <option value={cat}>{cat}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-label-sm text-on-surface-variant" for="projTitle">Project Title</label>
          <input
            id="projTitle"
            type="text"
            bind:value={projectForm.title}
            class="w-full bg-surface-container border border-white/20 rounded-lg p-2.5 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
            placeholder="e.g. Medical Image AI Diagnostic Hub"
            required
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-label-sm text-on-surface-variant" for="projHall">Exhibition Hall / Location</label>
          <select
            id="projHall"
            bind:value={projectForm.hall}
            class="w-full bg-surface-container border border-white/20 rounded-lg p-2.5 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
          >
            {#each halls as hall}
              <option value={hall}>{hall}</option>
            {/each}
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="text-label-sm text-on-surface-variant" for="projPres">Presenters / Team Members (Optional)</label>
          <input
            id="projPres"
            type="text"
            bind:value={projectForm.presenters}
            class="w-full bg-surface-container border border-white/20 rounded-lg p-2.5 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
            placeholder="e.g. Brenda Nfor, Collins Ndip"
          />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onclick={() => showAddModal = false}
            class="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-on-surface cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 bg-secondary hover:bg-secondary/95 text-white font-bold rounded-lg shadow-md cursor-pointer"
          >
            Create Entry
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- EDIT PROJECT MODAL -->
{#if showEditModal}
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div class="w-full max-w-lg mx-4 glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl rotate-entrance">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-title-md font-bold text-secondary flex items-center gap-2">
          <span class="material-symbols-outlined">edit_square</span>
          <span>Edit Project Details</span>
        </h3>
        <button onclick={() => showEditModal = false} class="text-on-surface-variant hover:text-white">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <form onsubmit={submitEditProject} class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5 col-span-1">
            <label class="text-label-sm text-on-surface-variant" for="editProjNum">Project Number</label>
            <input
              id="editProjNum"
              type="number"
              bind:value={projectForm.number}
              class="w-full bg-surface-container border border-white/20 rounded-lg p-2.5 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
              placeholder="e.g. 14"
              required
            />
          </div>
          <div class="space-y-1.5 col-span-1">
            <label class="text-label-sm text-on-surface-variant" for="editProjCat">Category</label>
            <select
              id="editProjCat"
              bind:value={projectForm.category}
              class="w-full bg-surface-container border border-white/20 rounded-lg p-2.5 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
            >
              {#each categories as cat}
                <option value={cat}>{cat}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-label-sm text-on-surface-variant" for="editProjTitle">Project Title</label>
          <input
            id="editProjTitle"
            type="text"
            bind:value={projectForm.title}
            class="w-full bg-surface-container border border-white/20 rounded-lg p-2.5 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
            placeholder="e.g. Medical Image AI Diagnostic Hub"
            required
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-label-sm text-on-surface-variant" for="editProjHall">Exhibition Hall / Location</label>
          <select
            id="editProjHall"
            bind:value={projectForm.hall}
            class="w-full bg-surface-container border border-white/20 rounded-lg p-2.5 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
          >
            {#each halls as hall}
              <option value={hall}>{hall}</option>
            {/each}
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="text-label-sm text-on-surface-variant" for="editProjPres">Presenters / Team Members (Optional)</label>
          <input
            id="editProjPres"
            type="text"
            bind:value={projectForm.presenters}
            class="w-full bg-surface-container border border-white/20 rounded-lg p-2.5 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
            placeholder="e.g. Brenda Nfor, Collins Ndip"
          />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onclick={() => showEditModal = false}
            class="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-on-surface cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 bg-secondary hover:bg-secondary/95 text-white font-bold rounded-lg shadow-md cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  /* Custom transitions */
  .rotate-entrance {
    animation: rotateIn 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  }
  @keyframes rotateIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
