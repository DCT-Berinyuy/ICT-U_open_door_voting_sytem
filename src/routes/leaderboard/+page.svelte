<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let results = $state(data.results);
  let votingOpen = $state(data.votingOpen);
  
  $effect(() => {
    results = data.results;
  });
  $effect(() => {
    votingOpen = data.votingOpen;
  });

  let totalVotes = $derived(results.reduce((sum: number, r: any) => sum + Number(r.vote_count), 0));

  let realtimeChannel: any;
  let secondsLeft = $state(14 * 60 + 52); // Simulated time remaining

  // Timer countdown
  let timerInterval: any;

  async function refreshResults() {
    const { data: updatedResults, error } = await supabase.rpc('get_results');
    if (!error && updatedResults) {
      results = updatedResults;
    }
  }

  onMount(() => {
    // 1. Subscribe to realtime postgres_changes on the votes table
    realtimeChannel = supabase
      .channel('public-votes-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        (payload) => {
          console.log('Realtime Vote Insert Received:', payload);
          refreshResults();
        }
      )
      .subscribe((status) => {
        console.log('Supabase Realtime Status:', status);
      });

    // 2. Start simulated timer countdown
    timerInterval = setInterval(() => {
      if (secondsLeft > 0) {
        secondsLeft--;
      }
    }, 1000);
  });

  onDestroy(() => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  });

  // Derived formatted timer string
  let timerString = $derived.by(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  // Helper to format number
  function formatNum(num: number) {
    return String(num).padStart(2, '0');
  }

  // Get percentage relative to the first (top) project
  function getPercentage(count: number) {
    if (results.length === 0) return 0;
    const max = Number(results[0].vote_count);
    if (max === 0) return 0;
    return Math.round((count / max) * 100);
  }

  // Mouse parallax movement coordinates
  let moveX = $state(0);
  let moveY = $state(0);
  function handleMouseMove(e: MouseEvent) {
    moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    moveY = (e.clientY - window.innerHeight / 2) * 0.01;
  }
</script>

<svelte:head>
  <title>Live Leaderboard | Open Doors Voting</title>
</svelte:head>

<div 
  onmousemove={handleMouseMove}
  role="presentation"
  style="background-position: calc(50% + {moveX}px) calc(50% + {moveY}px); transition: background-position 0.1s ease-out;"
  class="bg-[#0b1f3f] bg-[radial-gradient(circle_at_center,_#162E55_0%,_#0b1f3f_100%)] text-on-surface h-screen w-screen selection:bg-secondary selection:text-on-secondary overflow-hidden"
>
  <!-- Header adapted for TV/Projector -->
  <header class="relative z-50 flex flex-col md:flex-row justify-between items-center w-full px-6 py-4 bg-surface/10 backdrop-blur-md border-b border-white/5 gap-4">
    <div class="flex items-center gap-3 md:gap-4 w-full md:w-auto">
      <a href="/" class="h-10 w-10 md:h-12 md:w-12 bg-white rounded-lg flex items-center justify-center p-1 shadow-xl shrink-0">
        <img class="h-full object-contain" alt="ICT University Logo" src="/Assets/logo.jpeg" />
      </a>
      <div>
        <h1 class="font-headline-lg text-on-surface tracking-tight font-extrabold text-[18px] sm:text-[22px] md:text-[26px] leading-tight">ICT University Tech Expo</h1>
        <div class="flex items-center gap-1.5 mt-0.5">
          <span class="w-2 h-2 bg-secondary rounded-full pulse-dot"></span>
          <p class="font-label-sm text-[10px] md:text-[11px] text-secondary uppercase tracking-widest font-bold">LIVE LEADERBOARD</p>
        </div>
      </div>
    </div>
    
    <div class="flex items-center gap-6 sm:gap-8 md:gap-10 justify-between w-full md:w-auto border-t border-white/5 md:border-none pt-3 md:pt-0">
      <div class="text-left md:text-right">
        <p class="font-label-sm text-[10px] md:text-[11px] text-on-surface-variant font-bold tracking-wider">TOTAL VOTES</p>
        <p class="font-display-lg text-[24px] sm:text-[30px] md:text-[36px] text-on-surface font-extrabold" id="totalVotes">
          {totalVotes.toLocaleString()}
        </p>
      </div>
      <div class="h-10 w-[1px] bg-outline-variant/30 hidden md:block"></div>
      <div class="text-right">
        <p class="font-label-sm text-[10px] md:text-[11px] text-on-surface-variant font-bold tracking-wider">CLOSING IN</p>
        <p class="font-display-lg text-[24px] sm:text-[30px] md:text-[36px] text-on-surface font-extrabold tabular-nums animate-pulse" id="timer">
          {timerString}
        </p>
      </div>
    </div>
  </header>

  <!-- Main Content Canvas -->
  <main class="relative z-10 max-w-6xl w-full mx-auto px-6 py-4 md:py-6 h-[calc(100vh-140px)] flex flex-col justify-between overflow-y-auto hide-scrollbar">
    <div class="w-full flex flex-col gap-6 mt-2">
      
      <!-- Top 3 High Contrast Podium Cards -->
      <div class="grid grid-cols-3 gap-4 md:gap-8 items-end min-h-[350px] md:min-h-[460px]">
        
        <!-- Rank 2: Silver (Rendered left) -->
        {#if results.length > 1}
          <div class="glass-card p-6 rounded-xl border-b-4 border-silver flex flex-col items-center justify-end h-80 md:h-[350px] relative overflow-hidden group transition-all duration-500 hover:-translate-y-2">
            <div class="absolute top-4 left-4 font-display-lg text-[48px] rank-silver opacity-30 italic font-black">02</div>
            <span class="material-symbols-outlined text-[48px] rank-silver mb-3">military_tech</span>
            <div class="text-center w-full">
              <h3 class="font-headline-lg text-base md:text-xl text-on-surface truncate font-bold">{results[1].title}</h3>
              <p class="font-label-sm text-[11px] md:text-[13px] text-on-surface-variant font-bold mt-1">{results[1].vote_count} VOTES</p>
            </div>
            <div class="w-full h-2 bg-white/5 rounded-full mt-4 overflow-hidden">
              <div class="h-full bg-secondary/60 transition-all duration-500" style="width: {getPercentage(results[1].vote_count)}%"></div>
            </div>
          </div>
        {:else}
          <div class="glass-card p-6 rounded-xl h-80 md:h-[350px] border border-dashed border-white/10 flex items-center justify-center opacity-40">
            <p class="text-label-sm text-on-surface-variant font-bold">2ND PLACE</p>
          </div>
        {/if}

        <!-- Rank 1: Gold (Rendered center and taller) -->
        {#if results.length > 0}
          <div class="glass-card p-6 rounded-xl border-b-4 border-secondary ring-2 ring-secondary/30 flex flex-col items-center justify-end h-[380px] md:h-[430px] relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 shadow-[0_0_50px_rgba(245,130,32,0.25)]">
            <div class="absolute top-4 left-4 font-display-lg text-[56px] rank-gold opacity-50 italic font-black">01</div>
            <span class="material-symbols-outlined text-[56px] rank-gold mb-3 scale-125">workspace_premium</span>
            <div class="text-center w-full">
              <h3 class="font-headline-lg text-[18px] md:text-[26px] text-secondary font-extrabold truncate leading-tight">{results[0].title}</h3>
              <p class="font-label-sm text-xs md:text-base text-on-surface-variant font-black tracking-widest mt-1.5">{results[0].vote_count} VOTES</p>
            </div>
            <div class="w-full h-3 bg-white/10 rounded-full mt-4 overflow-hidden">
              <div class="h-full shimmer transition-all duration-500" style="width: 100%"></div>
            </div>
          </div>
        {:else}
          <div class="glass-card p-6 rounded-xl h-[380px] md:h-[430px] border border-dashed border-white/10 flex items-center justify-center opacity-40">
            <p class="text-label-sm text-on-surface-variant font-bold">1ST PLACE</p>
          </div>
        {/if}

        <!-- Rank 3: Bronze (Rendered right) -->
        {#if results.length > 2}
          <div class="glass-card p-6 rounded-xl border-b-4 border-bronze flex flex-col items-center justify-end h-72 md:h-[310px] relative overflow-hidden group transition-all duration-500 hover:-translate-y-2">
            <div class="absolute top-4 left-4 font-display-lg text-[40px] rank-bronze opacity-30 italic font-black">03</div>
            <span class="material-symbols-outlined text-[40px] rank-bronze mb-3">emoji_events</span>
            <div class="text-center w-full">
              <h3 class="font-headline-lg text-sm md:text-lg text-on-surface truncate font-bold">{results[2].title}</h3>
              <p class="font-label-sm text-[11px] md:text-[13px] text-on-surface-variant font-bold mt-1">{results[2].vote_count} VOTES</p>
            </div>
            <div class="w-full h-2 bg-white/5 rounded-full mt-4 overflow-hidden">
              <div class="h-full bg-secondary/40 transition-all duration-500" style="width: {getPercentage(results[2].vote_count)}%"></div>
            </div>
          </div>
        {:else}
          <div class="glass-card p-6 rounded-xl h-72 md:h-[310px] border border-dashed border-white/10 flex items-center justify-center opacity-40">
            <p class="text-label-sm text-on-surface-variant font-bold">3RD PLACE</p>
          </div>
        {/if}

      </div>

      <!-- Remaining Rankings (Horizontal Lanes) -->
      <div class="space-y-3 pb-16">
        {#each results.slice(3) as project, i}
          <div class="glass-card px-6 py-3 rounded-lg flex items-center gap-6 hover:bg-white/5 transition-colors">
            <span class="font-label-sm text-title-md text-on-surface-variant w-12 shrink-0 font-bold">#{formatNum(i + 4)}</span>
            <div class="w-64 shrink-0">
              <h4 class="font-title-md text-[16px] text-on-surface truncate font-semibold">{project.title}</h4>
            </div>
            <div class="flex-grow h-6 bg-white/5 rounded-full overflow-hidden relative">
              <div class="h-full bg-secondary/30 rounded-full transition-all duration-500 ease-out" style="width: {getPercentage(project.vote_count)}%"></div>
              <div class="absolute inset-0 flex items-center px-3">
                <span class="font-label-sm text-[10px] text-secondary font-bold tracking-tighter opacity-80 uppercase">
                  {project.category} / {project.hall}
                </span>
              </div>
            </div>
            <div class="w-24 text-right shrink-0">
              <span class="font-title-md text-on-surface font-bold">{project.vote_count}</span>
              <span class="font-label-sm text-[10px] text-on-surface-variant ml-1">VOTES</span>
            </div>
          </div>
        {/each}
      </div>

    </div>
  </main>

  <!-- Footer Ticker -->
  <footer class="fixed bottom-0 left-0 w-full bg-secondary text-on-secondary px-6 py-2.5 flex items-center gap-6 overflow-hidden whitespace-nowrap z-50 shadow-xl font-bold">
    <div class="flex items-center gap-1 font-label-sm tracking-widest shrink-0 uppercase">
      <span class="material-symbols-outlined text-[18px]">campaign</span>
      <span>SYSTEM NOTICE:</span>
    </div>
    <div class="animate-marquee inline-block font-label-sm tracking-wide">
      VOTING IS ACTIVE • REALTIME LEADERBOARD CONNECTED • REFRESHING DATA AUTOMATICALLY • CURRENT LEADER: {results[0]?.title || 'None'} • PLEASE SCAN THE OFFICIAL QR CODE TO CAST YOUR VOTE • OPEN DOORS CAMPUS EXHIBITION 
    </div>
  </footer>
</div>

