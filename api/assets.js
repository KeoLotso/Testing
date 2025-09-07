import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SB_URL,
  process.env.SB_ANON
);

export default async function handler(req, res) {
  const { method } = req;
  const { userId } = req.query;

  if (method === 'GET') {
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    try {
      const { data, error } = await supabase
        .from('user_assets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.status(200).json({ success: true, assets: data });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch assets' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}