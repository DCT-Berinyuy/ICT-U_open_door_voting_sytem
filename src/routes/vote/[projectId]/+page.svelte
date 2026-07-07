<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let loading = $state(false);

  // Helper to format number
  function formatNum(num: number) {
    return String(num).padStart(2, '0');
  }
</script>

<svelte:head>
  <title>Confirm Your Vote | Open Doors Voting</title>
</svelte:head>


<main class="pt-6 pb-16 px-gutter min-h-screen flex flex-col justify-center max-w-md mx-auto">
  
  {#if !form}
    <!-- Status Chip -->
    <div class="mb-md flex justify-center mt-6">
      <div class="inline-flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full border border-white/10">
        {#if data.votingOpen}
          <div class="w-2 h-2 rounded-full pulse-orange"></div>
          <span class="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">Voting Open</span>
        {:else}
          <div class="w-2 h-2 rounded-full bg-error"></div>
          <span class="text-label-sm font-label-sm uppercase tracking-widest text-error">Voting Closed</span>
        {/if}
      </div>
    </div>

    <!-- Headline & Subtext -->
    <div class="text-center mb-6">
      <h1 class="text-headline-lg-mobile font-headline-lg-mobile text-on-surface mb-xs font-bold">Confirm Your Vote</h1>
      <p class="text-body-md text-on-surface-variant">
        You are voting for <span class="text-secondary font-bold">Project #{formatNum(data.project.number)}: {data.project.title}</span>
      </p>
    </div>

    <!-- Project Preview Card (Bento/Glassmorphism style) -->
    <div class="glass-card rounded-xl overflow-hidden mb-6 relative border border-white/10 shadow-lg">
      <div class="h-40 w-full relative">
        <img class="w-full h-full object-cover opacity-60" alt="Campus backdrop" src="/Assets/ict_campus.jpeg" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#0B1F3F] to-transparent"></div>
        <div class="absolute bottom-4 left-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">shield</span>
          <span class="text-label-sm font-label-sm uppercase tracking-wider text-white font-bold">{data.project.category} Department</span>
        </div>
      </div>
    </div>

    {#if data.votingOpen}
      <!-- Form Section -->
      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            loading = false;
            await update();
          };
        }}
        class="space-y-4"
        id="voteForm"
      >
        <!-- Full Name Input -->
        <div class="space-y-2">
          <label class="text-label-sm font-label-sm uppercase text-on-surface-variant ml-1" for="fullName">Full Name</label>
          <div class="relative">
            <input
              class="w-full bg-surface-container border border-white/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all"
              id="fullName"
              name="fullName"
              placeholder="Enter your official name"
              required
              type="text"
            />
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">person</span>
          </div>
        </div>
        
        <!-- Phone Number Input -->
        <div class="space-y-2">
          <label class="text-label-sm font-label-sm uppercase text-on-surface-variant ml-1" for="phoneNumber">Phone Number</label>
          <div class="relative">
            <input
              class="w-full bg-surface-container border border-white/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="e.g. 677123456"
              required
              type="tel"
            />
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">smartphone</span>
          </div>
        </div>

        <!-- Disclaimer -->
        <div class="flex items-start gap-3 px-1 py-2 opacity-80">
          <span class="material-symbols-outlined text-secondary text-[20px] mt-0.5">info</span>
          <p class="text-label-sm font-label-sm text-on-surface-variant leading-relaxed">
            One vote per person — your phone number is used strictly to prevent duplicate votes.
          </p>
        </div>

        <!-- Submit Button -->
        <button
          disabled={loading}
          class="w-full bg-secondary hover:bg-secondary/90 disabled:bg-secondary/50 text-white font-headline-lg-mobile text-[16px] py-4 rounded-xl orange-glow transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 font-bold uppercase tracking-wider cursor-pointer"
          type="submit"
        >
          {#if loading}
            <span>PROCESSING...</span>
            <span class="material-symbols-outlined animate-spin">refresh</span>
          {:else}
            <span>SUBMIT VOTE</span>
            <span class="material-symbols-outlined">how_to_vote</span>
          {/if}
        </button>
      </form>
    {:else}
      <!-- Voting Closed State -->
      <div class="glass-card rounded-xl p-6 text-center border-l-4 border-l-error">
        <span class="material-symbols-outlined text-5xl text-error mb-3">lock_clock</span>
        <h2 class="text-headline-lg-mobile font-bold text-on-surface mb-2">Voting is Closed</h2>
        <p class="text-body-md text-on-surface-variant mb-4">The voting window has closed. Thank you for your interest!</p>
        <a href="/leaderboard" class="block w-full py-3 bg-secondary text-on-secondary font-semibold uppercase tracking-wider rounded-lg text-center shadow-md">
          View Live Leaderboard
        </a>
      </div>
    {/if}

  {:else if form.success}
    <!-- SUCCESS STATE CARD -->
    <div class="glass-card rounded-xl p-6 flex flex-col items-center text-center rotate-entrance border-l-4 border-l-secondary mt-12 border border-white/10 shadow-xl">
      <div class="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-6 float-animation">
        <span class="material-symbols-outlined text-[48px] text-secondary" style="font-variation-settings: 'FILL' 1;">check_circle</span>
      </div>
      <div class="flex items-center gap-xs mb-3">
        <div class="w-2 h-2 rounded-full bg-secondary status-pulse"></div>
        <span class="font-label-sm text-label-sm text-secondary uppercase tracking-widest ml-1.5 font-bold">Confirmation</span>
      </div>
      <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2 font-bold">Your vote is in!</h2>
      <p class="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
        Thanks for supporting <span class="text-secondary font-bold">{form.projectTitle}</span>. Your contribution helps recognize the most innovative tech at ICTU.
      </p>
      <a href="/leaderboard" class="w-full py-4 bg-secondary text-on-secondary font-semibold uppercase tracking-wider rounded-lg shadow-md text-center">
        View Live Leaderboard
      </a>
    </div>

  {:else if form.alreadyVoted}
    <!-- ALREADY VOTED STATE CARD -->
    <div class="glass-card rounded-xl p-6 flex flex-col items-center text-center rotate-entrance border-l-4 border-l-outline mt-12 border border-white/10 shadow-xl">
      <div class="w-20 h-20 bg-surface-variant/30 rounded-full flex items-center justify-center mb-6">
        <span class="material-symbols-outlined text-[48px] text-outline">history</span>
      </div>
      <div class="flex items-center gap-xs mb-3">
        <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Entry Recorded</span>
      </div>
      <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2 font-bold">Already Voted</h2>
      <p class="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
        You already voted for <span class="text-primary-fixed-dim font-bold">{form.projectTitle}</span>. Thanks for participating! Duplicate votes are not permitted.
      </p>
      <a href="/leaderboard" class="w-full py-4 bg-secondary text-on-secondary font-semibold uppercase tracking-wider rounded-lg shadow-md text-center">
        View Live Leaderboard
      </a>
    </div>

  {:else}
    <!-- General Error State -->
    <div class="glass-card rounded-xl p-6 text-center border-l-4 border-l-error mt-12 border border-white/10 shadow-xl">
      <span class="material-symbols-outlined text-5xl text-error mb-3">error</span>
      <h2 class="text-headline-lg-mobile font-bold text-on-surface mb-2">Submission Error</h2>
      <p class="text-body-md text-on-surface-variant mb-6">{form.error || 'Something went wrong.'}</p>
      <a href="/vote/{data.project.id}" class="block w-full py-3 bg-secondary text-on-secondary font-semibold uppercase tracking-wider rounded-lg text-center shadow-md">
        Try Again
      </a>
    </div>
  {/if}

</main>


