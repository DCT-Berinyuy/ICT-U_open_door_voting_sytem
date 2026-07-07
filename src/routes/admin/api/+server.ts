import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { ADMIN_PASSCODE } from '$env/static/private';
import type { RequestHandler } from './$types';

// Helper to authenticate passcode from headers
function checkAuth(request: Request) {
  const passcode = request.headers.get('x-admin-passcode');
  return passcode === ADMIN_PASSCODE;
}

export const GET: RequestHandler = async ({ request }) => {
  if (!checkAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // 1. Fetch ranking results
  const { data: results, error: resultsError } = await supabaseAdmin.rpc('get_results');
  if (resultsError) {
    console.error('Error fetching results:', resultsError);
  }

  // 2. Fetch detailed vote logs with voter details and project title
  const { data: voteLogs, error: logsError } = await supabaseAdmin
    .from('votes')
    .select('id, voter_name, voter_phone, created_at, projects(number, title)')
    .order('created_at', { ascending: false });

  if (logsError) {
    console.error('Error fetching logs:', logsError);
  }

  // 3. Fetch setting state
  const { data: setting, error: settingError } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', 'voting_open')
    .single();

  if (settingError) {
    console.error('Error fetching settings:', settingError);
  }

  return json({
    results: results || [],
    voteLogs: voteLogs || [],
    votingOpen: setting ? setting.value === 'true' : false
  });
};

export const POST: RequestHandler = async ({ request }) => {
  if (!checkAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === 'toggle_voting') {
    const { open } = body;
    const valueStr = open ? 'true' : 'false';

    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({ key: 'voting_open', value: valueStr }, { onConflict: 'key' });

    if (error) {
      console.error('Error updating settings:', error);
      return json({ success: false, error: error.message }, { status: 500 });
    }

    return json({ success: true, votingOpen: open });
  }

  if (action === 'create_project') {
    const { project } = body;
    const { error } = await supabaseAdmin
      .from('projects')
      .insert({
        number: Number(project.number),
        title: project.title,
        category: project.category,
        hall: project.hall,
        presenters: project.presenters
      });

    if (error) {
      console.error('Error creating project:', error);
      return json({ success: false, error: error.message }, { status: 500 });
    }

    return json({ success: true });
  }

  if (action === 'update_project') {
    const { id, project } = body;
    const { error } = await supabaseAdmin
      .from('projects')
      .update({
        number: Number(project.number),
        title: project.title,
        category: project.category,
        hall: project.hall,
        presenters: project.presenters
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating project:', error);
      return json({ success: false, error: error.message }, { status: 500 });
    }

    return json({ success: true });
  }

  if (action === 'delete_project') {
    const { id } = body;
    
    // First delete all votes related to the project to maintain integrity
    const { error: votesError } = await supabaseAdmin
      .from('votes')
      .delete()
      .eq('project_id', id);

    if (votesError) {
      console.error('Error deleting project votes:', votesError);
      return json({ success: false, error: votesError.message }, { status: 500 });
    }

    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return json({ success: false, error: error.message }, { status: 500 });
    }

    return json({ success: true });
  }

  return json({ success: false, error: 'Unknown action' }, { status: 400 });
};
