import { supabase } from '$lib/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('number', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
  }

  return {
    projects: projects || []
  };
};
