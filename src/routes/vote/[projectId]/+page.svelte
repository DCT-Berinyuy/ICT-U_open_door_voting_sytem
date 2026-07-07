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


<main class="pt-6 pb-16 px-4 md:px-8 min-h-screen flex flex-col justify-center max-w-md mx-auto">
  
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
    <div class="text-center mb-5">
      <h1 class="text-[20px] md:text-[26px] font-bold text-on-surface mb-2 font-headline-lg-mobile">Confirm Your Vote</h1>
      <p class="text-[13px] md:text-[15px] text-on-surface-variant leading-relaxed">
        You are voting for <span class="text-secondary font-bold">Project #{formatNum(data.project.number)}: {data.project.title}</span>
      </p>
    </div>

    <!-- Project Preview Card (Bento/Glassmorphism style) -->
    <div class="glass-card rounded-xl overflow-hidden mb-5 relative border border-white/10 shadow-lg">
      <div class="h-32 md:h-40 w-full relative">
        <img class="w-full h-full object-cover opacity-60" alt="Campus backdrop" src="/Assets/ict_campus.jpeg" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#0B1F3F] to-transparent"></div>
        <div class="absolute bottom-3 left-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary text-sm" style="font-variation-settings: 'FILL' 1;">shield</span>
          <span class="text-[10px] md:text-label-sm font-label-sm uppercase tracking-wider text-white font-bold">{data.project.category} Department</span>
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
        <div class="space-y-1.5">
          <label class="text-[11px] md:text-label-sm font-label-sm uppercase text-on-surface-variant ml-1" for="fullName">Full Name</label>
          <div class="relative">
            <input
              class="w-full bg-surface-container border border-white/20 rounded-xl px-4 py-2.5 text-[14px] md:text-[16px] text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all"
              id="fullName"
              name="fullName"
              placeholder="Enter your official name"
              required
              type="text"
            />
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">person</span>
          </div>
        </div>
        
        <!-- Phone Number Input -->
        <div class="space-y-1.5">
          <label class="text-[11px] md:text-label-sm font-label-sm uppercase text-on-surface-variant ml-1" for="phoneNumber">Phone Number</label>
          <div class="relative">
            <input
              class="w-full bg-surface-container border border-white/20 rounded-xl px-4 py-2.5 text-[14px] md:text-[16px] text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="e.g. 677123456"
              required
              type="tel"
            />
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">smartphone</span>
          </div>
        </div>

        <!-- Disclaimer -->
        <div class="flex items-start gap-2.5 px-1 py-1 opacity-80">
          <span class="material-symbols-outlined text-secondary text-[18px] mt-0.5">info</span>
          <p class="text-[10px] md:text-label-sm font-label-sm text-on-surface-variant leading-relaxed">
            One vote per person — your phone number is used strictly to prevent duplicate votes.
          </p>
        </div>

        <!-- Submit Button -->
        <button
          disabled={loading}
          class="w-full bg-secondary hover:bg-secondary/90 disabled:bg-secondary/50 text-white text-[14px] md:text-[16px] py-3 md:py-4 rounded-xl orange-glow transition-all active:scale-95 flex items-center justify-center gap-2 mt-3 font-bold uppercase tracking-wider cursor-pointer"
          type="submit"
        >
          {#if loading}
            <span>PROCESSING...</span>
            <span class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
          {:else}
            <span>SUBMIT VOTE</span>
            <span class="material-symbols-outlined text-[18px]">how_to_vote</span>
          {/if}
        </button>
      </form>
    {:else}
      <!-- Voting Closed State -->
      <div class="glass-card rounded-xl p-5 text-center border-l-4 border-l-error">
        <span class="material-symbols-outlined text-4xl text-error mb-2">lock_clock</span>
        <h2 class="text-[18px] md:text-[22px] font-bold text-on-surface mb-2 font-headline-lg-mobile">Voting is Closed</h2>
        <p class="text-[13px] md:text-[15px] text-on-surface-variant mb-4">The voting window has closed. Thank you for your interest!</p>
        <a href="/leaderboard" class="block w-full py-3 bg-secondary text-on-secondary font-semibold uppercase tracking-wider rounded-lg text-center shadow-md text-sm">
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
      <div class="flex items-center gap-1.5 mb-2.5">
        <div class="w-2 h-2 rounded-full bg-secondary status-pulse"></div>
        <span class="text-[11px] md:text-label-sm font-label-sm text-secondary uppercase tracking-widest ml-1 font-bold">Confirmation</span>
      </div>
      <h2 class="text-[18px] md:text-[22px] text-on-surface mb-2 font-bold font-headline-lg-mobile">Your vote is in!</h2>
      <p class="text-[13px] md:text-[15px] text-on-surface-variant mb-6 leading-relaxed">
        Thanks for supporting <span class="text-secondary font-bold">{form.projectTitle}</span>. Your contribution helps recognize the most innovative tech at ICTU.
      </p>
      <a href="/leaderboard" class="w-full py-3.5 bg-secondary text-on-secondary font-semibold uppercase tracking-wider rounded-lg shadow-md text-center text-sm">
        View Live Leaderboard
      </a>
    </div>

  {:else if form.alreadyVoted}
    <!-- ALREADY VOTED STATE CARD -->
    <div class="glass-card rounded-xl p-5 flex flex-col items-center text-center rotate-entrance border-l-4 border-l-outline mt-12 border border-white/10 shadow-xl">
      <div class="w-16 h-16 bg-surface-variant/30 rounded-full flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-[36px] text-outline">history</span>
      </div>
      <div class="flex items-center gap-1.5 mb-2.5">
        <span class="text-[11px] md:text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Entry Recorded</span>
      </div>
      <h2 class="text-[18px] md:text-[22px] text-on-surface mb-2 font-bold font-headline-lg-mobile">Already Voted</h2>
      <p class="text-[13px] md:text-[15px] text-on-surface-variant mb-6 leading-relaxed">
        You already voted for <span class="text-primary-fixed-dim font-bold">{form.projectTitle}</span>. Thanks for participating! Duplicate votes are not permitted.
      </p>
      <a href="/leaderboard" class="w-full py-3.5 bg-secondary text-on-secondary font-semibold uppercase tracking-wider rounded-lg shadow-md text-center text-sm">
        View Live Leaderboard
      </a>
    </div>

  {:else}
    <!-- General Error State -->
    <div class="glass-card rounded-xl p-5 text-center border-l-4 border-l-error mt-12 border border-white/10 shadow-xl">
      <span class="material-symbols-outlined text-4xl text-error mb-2">error</span>
      <h2 class="text-[18px] md:text-[22px] font-bold text-on-surface mb-2 font-headline-lg-mobile">Submission Error</h2>
      <p class="text-[13px] md:text-[15px] text-on-surface-variant mb-6">{form.error || 'Something went wrong.'}</p>
      <a href="/vote/{data.project.id}" class="block w-full py-3.5 bg-secondary text-on-secondary font-semibold uppercase tracking-wider rounded-lg text-center shadow-md text-sm">
        Try Again
      </a>
    </div>
  {/if}

</main>


