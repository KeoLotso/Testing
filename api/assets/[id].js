import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SB_URL,
  process.env.SB_ANON
);

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const { data: asset, error: fetchError } = await supabase
      .from('user_assets')
      .select('file_name, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    const filePath = `assets/${asset.user_id}/${asset.file_name}`;
    
    await supabase.storage
      .from('assets')
      .remove([filePath]);

    const { error: deleteError } = await supabase
      .from('user_assets')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({ success: false, error: deleteError.message });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
}