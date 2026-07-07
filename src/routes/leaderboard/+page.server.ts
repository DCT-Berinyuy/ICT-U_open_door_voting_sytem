import { supabase } from '$lib/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const { data: results, error } = await supabase.rpc('get_results');

  if (error) {
    console.error('Error fetching leaderboard results:', error);
  }

  // Fetch voting settings
  const { data: settings } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'voting_open')
    .single();

  const votingOpen = settings ? settings.value === 'true' : false;

  return {
    results: results || [],
    votingOpen
  };
};
