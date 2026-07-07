<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Filter state
  let selectedCategory = $state('All');
  let selectedHall = $state('All');

  const categories = [
    'All',
    'AI',
    'Cybersecurity',
    'Networking',
    'IoT',
    'Software Engineering',
    'Embedded Systems',
    'Renewable Energy'
  ];

  const halls = [
    'All',
    'George Mbarika Hall',
    'Chumbow Hall',
    'Eric Mbarika Hall',
    'Courtyard'
  ];

  // Filtered projects
  let filteredProjects = $derived(
    data.projects.filter((project: any) => {
      const matchCategory = selectedCategory === 'All' || project.category === selectedCategory;
      const matchHall = selectedHall === 'All' || project.hall === selectedHall;
      return matchCategory && matchHall;
    })
  );

  // Helper to format number
  function formatNum(num: number) {
    return String(num).padStart(2, '0');
  }

  // Categories badge background classes
  function getCategoryColor(cat: string) {
    switch (cat) {
      case 'AI': return 'bg-secondary-container/20 text-secondary border border-secondary/20';
      case 'Cybersecurity': return 'bg-error-container/20 text-error border border-error/20';
      case 'IoT': return 'bg-tertiary-container/30 text-tertiary border border-tertiary/20';
      default: return 'bg-primary-container/20 text-primary border border-primary/20';
    }
  }
</script>

<svelte:head>
  <title>Open Doors Voting - Projects</title>
</svelte:head>



<main class="pb-28">
  <!-- Floating Ambient Background -->
  <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-secondary/5 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]"></div>
  </div>

  <!-- Sticky Filters Section -->
  <section class="mt-4 px-4 md:px-8 space-y-4">
    <div class="flex flex-col gap-3">
      <!-- Categories -->
      <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
        {#each categories as category}
          <button
            onclick={() => selectedCategory = category}
            class="px-4 py-1.5 rounded-full whitespace-nowrap text-label-sm font-label-sm transition-all border
              {selectedCategory === category 
                ? 'bg-secondary text-on-secondary border-secondary shadow-[0_4px_12px_rgba(245,130,32,0.3)]' 
                : 'bg-surface-variant/40 text-on-surface-variant border-white/5 hover:bg-surface-variant/60'}"
          >
            {category}
          </button>
        {/each}
      </div>
      <!-- Hall Locations -->
      <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
        {#each halls as hall}
          <button
            onclick={() => selectedHall = hall}
            class="flex items-center gap-1.5 px-3.5 py-1 rounded-lg border whitespace-nowrap text-label-sm font-label-sm transition-all
              {selectedHall === hall
                ? 'bg-secondary-container/20 text-secondary border-secondary/40 shadow-[0_4px_12px_rgba(245,130,32,0.1)]'
                : 'bg-surface-container-high/30 text-on-surface border-white/5 opacity-70 hover:opacity-100'}"
          >
            <span class="material-symbols-outlined text-[16px] text-secondary" style="font-variation-settings: 'opsz' 18;">location_on</span>
            <span>{hall === 'All' ? 'All Halls' : hall}</span>
          </button>
        {/each}
      </div>
    </div>
  </section>

  <!-- Project Grid -->
  <section class="px-4 md:px-8 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each filteredProjects as project (project.id)}
      <div class="glass-card rounded-xl p-4 flex flex-col justify-between gap-4 border border-white/10 transition-all hover:bg-surface-variant/20">
        <div>
          <div class="flex justify-between items-start mb-3">
            <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center text-sm md:text-lg border border-white/10 font-bold">
              {formatNum(project.number)}
            </div>
            <div class="flex flex-col items-end gap-1.5">
              <span class="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold {getCategoryColor(project.category)}">
                {project.category}
              </span>
              <div class="flex items-center gap-1 text-on-surface-variant">
                <span class="material-symbols-outlined text-[14px]">location_on</span>
                <span class="text-label-sm font-label-sm text-[11px]">{project.hall}</span>
              </div>
            </div>
          </div>
          <div>
            <h2 class="text-[15px] md:text-[18px] text-on-surface mb-2 font-bold leading-tight font-headline-lg-mobile">{project.title}</h2>
            {#if project.presenters}
              <p class="text-body-md text-on-surface-variant/80 text-[13px] md:text-[14px] leading-relaxed">
                <span class="font-semibold text-secondary">Presenters:</span> {project.presenters}
              </p>
            {/if}
          </div>
        </div>
        <div class="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
          <span class="text-label-sm font-label-sm text-secondary flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            Live Demo
          </span>
          <a
            href="/vote/{project.id}"
            class="bg-secondary hover:bg-secondary/90 text-on-secondary px-6 py-2 rounded-lg font-headline-lg-mobile text-[14px] uppercase tracking-wider text-center font-semibold transition-all active:scale-[0.98] shadow-sm"
          >
            Vote Now
          </a>
        </div>
      </div>
    {:else}
      <div class="col-span-full py-16 text-center text-on-surface-variant">
        <span class="material-symbols-outlined text-5xl mb-3 opacity-50">search_off</span>
        <p class="text-body-lg">No projects match the selected filters.</p>
      </div>
    {/each}
  </section>
</main>


