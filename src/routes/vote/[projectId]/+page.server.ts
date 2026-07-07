import { supabase } from '$lib/supabase';
import { supabaseAdmin } from '$lib/server/supabase';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { projectId } = params;

  // 1. Fetch project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    throw error(404, 'Project not found');
  }

  // 2. Fetch voting settings
  const { data: settings } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'voting_open')
    .single();

  const votingOpen = settings ? settings.value === 'true' : false;

  return {
    project,
    votingOpen
  };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const { projectId } = params;
    const formData = await request.formData();
    const fullName = formData.get('fullName')?.toString().trim();
    const phoneNumber = formData.get('phoneNumber')?.toString().trim();

    if (!fullName || !phoneNumber) {
      return fail(400, { success: false, error: 'Name and Phone Number are required.' });
    }

    // 1. Check if voting is open
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'voting_open')
      .single();

    if (!settings || settings.value !== 'true') {
      return fail(400, { success: false, error: 'Voting has closed.' });
    }

    // 2. Insert the vote using service_role client to bypass client RLS restriction
    const { error: insertError } = await supabaseAdmin
      .from('votes')
      .insert({
        project_id: projectId,
        voter_name: fullName,
        voter_phone: phoneNumber
      });

    if (insertError) {
      // Postgres error code for unique constraint violation is 23505
      if (insertError.code === '23505') {
        const { data: priorVote } = await supabaseAdmin
          .from('votes')
          .select('projects(title)')
          .eq('voter_phone', phoneNumber)
          .single();

        const priorProjectTitle = (priorVote as any)?.projects?.title || 'another project';
        return fail(400, {
          success: false,
          alreadyVoted: true,
          projectTitle: priorProjectTitle
        });
      }

      console.error('Vote insertion error:', insertError);
      return fail(500, { success: false, error: insertError.message || 'Failed to submit vote.' });
    }

    // Fetch project title to confirm
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('title')
      .eq('id', projectId)
      .single();

    return {
      success: true,
      projectTitle: project?.title || ''
    };
  }
};
