<script lang="ts">
  import { page } from '$app/state';
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';

  let { children } = $props();

  // Route control: show standard header and nav only on public pages
  // Excluding leaderboard and admin which have their own layouts/TV displays
  let showHeader = $derived(page.route.id === '/' || page.route.id === '/vote/[projectId]');

  // Mobile menu open state
  let mobileMenuOpen = $state(false);

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{#if showHeader}
  <!-- Unified Header Navigation -->
  <header class="bg-surface/85 backdrop-blur-md dark:bg-surface-container-low/85 border-b border-outline-variant/20 dark:border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-6 py-3.5 z-[90] fixed top-0 left-0">
    <!-- Left Logo & Branding -->
    <a href="/" class="flex items-center gap-3 hover:opacity-90 transition-opacity" onclick={closeMobileMenu}>
      <div class="w-8 h-8 md:w-9 md:h-9 overflow-hidden flex items-center justify-center rounded bg-white p-0.5 shadow-sm shrink-0">
        <img alt="ICT University Logo" class="h-full object-contain" src="/Assets/logo.jpeg" />
      </div>
      <div class="flex flex-col">
        <span class="text-[14px] md:text-[16px] font-bold text-secondary dark:text-secondary-fixed tracking-tight leading-tight">Open Doors Voting</span>
        <span class="text-[10px] md:text-[11px] font-label-sm text-on-surface-variant leading-none mt-0.5">Tech Expo Exhibition</span>
      </div>
    </a>

    <!-- Right Desktop Menu Navigation -->
    <nav class="hidden md:flex items-center gap-2">
      <a 
        href="/" 
        class="text-label-sm font-bold transition-all relative py-1.5 px-3 rounded-lg hover:bg-surface-variant/25
          {page.url.pathname === '/' ? 'text-secondary bg-secondary/10' : 'text-on-surface-variant'}"
      >
        <span>PROJECTS</span>
      </a>
      <a 
        href="/leaderboard" 
        class="text-label-sm font-bold transition-all relative py-1.5 px-3 rounded-lg hover:bg-surface-variant/25
          {page.url.pathname === '/leaderboard' ? 'text-secondary bg-secondary/10' : 'text-on-surface-variant'}"
      >
        <span>LEADERBOARD</span>
      </a>
      <a 
        href="/admin" 
        class="text-label-sm font-bold transition-all relative py-1.5 px-3 rounded-lg hover:bg-surface-variant/25
          {page.url.pathname.startsWith('/admin') ? 'text-secondary bg-secondary/10' : 'text-on-surface-variant'}"
      >
        <span>ADMIN</span>
      </a>
    </nav>

    <!-- Mobile Menu Hamburger Button -->
    <button 
      onclick={() => mobileMenuOpen = !mobileMenuOpen}
      class="md:hidden p-2 rounded-xl hover:bg-surface-variant/10 text-on-surface transition-colors cursor-pointer flex items-center justify-center"
      aria-label="Toggle Menu"
    >
      <span class="material-symbols-outlined text-2xl">
        {mobileMenuOpen ? 'close' : 'menu'}
      </span>
    </button>
  </header>

  <!-- Mobile Drawer Menu (Collapsible glassmorphic sidebar) -->
  {#if mobileMenuOpen}
    <!-- Backdrop overlay -->
    <button
      onclick={closeMobileMenu}
      class="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80] md:hidden transition-opacity cursor-default border-none w-full h-full block"
      aria-label="Close menu"
    ></button>

    <!-- Drawer container -->
    <aside class="fixed right-0 top-[60px] bottom-0 w-64 bg-surface-container/95 backdrop-blur-md border-l border-outline-variant/20 z-[85] p-6 shadow-2xl flex flex-col justify-between md:hidden slide-in-right">
      <div class="space-y-6">
        <p class="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase opacity-60 font-label-sm">Navigation Menu</p>
        <nav class="flex flex-col gap-3">
          <a 
            href="/" 
            onclick={closeMobileMenu}
            class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm
              {page.url.pathname === '/' 
                ? 'bg-secondary text-white shadow-md' 
                : 'text-on-surface-variant hover:bg-surface-variant/20'}"
          >
            <span class="material-symbols-outlined">grid_view</span>
            <span>Showcase Grid</span>
          </a>
          <a 
            href="/leaderboard" 
            onclick={closeMobileMenu}
            class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm
              {page.url.pathname === '/leaderboard' 
                ? 'bg-secondary text-white shadow-md' 
                : 'text-on-surface-variant hover:bg-surface-variant/20'}"
          >
            <span class="material-symbols-outlined">leaderboard</span>
            <span>Live Leaderboard</span>
          </a>
          <a 
            href="/admin" 
            onclick={closeMobileMenu}
            class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm
              {page.url.pathname.startsWith('/admin') 
                ? 'bg-secondary text-white shadow-md' 
                : 'text-on-surface-variant hover:bg-surface-variant/20'}"
          >
            <span class="material-symbols-outlined">admin_panel_settings</span>
            <span>Admin Portal</span>
          </a>
        </nav>
      </div>

      <div class="border-t border-outline-variant/15 pt-6 flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center">
          <span class="material-symbols-outlined text-secondary text-sm">info</span>
        </div>
        <div class="text-[11px] text-on-surface-variant/70 leading-relaxed font-semibold">
          Expo Exhibition Voting<br/>© 2026 ICTU Campus
        </div>
      </div>
    </aside>
  {/if}

  <div class="pt-[60px] md:pt-[68px]">
    {@render children()}
  </div>
{:else}
  {@render children()}
{/if}
