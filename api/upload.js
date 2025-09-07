import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.SB_URL,
  process.env.SB_ANON
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({
    maxFileSize: 50 * 1024 * 1024,
  });

  try {
    const [fields, files] = await form.parse(req);
    
    const file = files.file[0];
    const title = fields.title[0];
    const desc = fields.description?.[0] || '';
    const userId = fields.userId[0];
    const username = fields.username[0];

    const fileBuffer = fs.readFileSync(file.filepath);
    const fileName = `${Date.now()}-${file.originalFilename}`;
    const filePath = `assets/${userId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      return res.status(400).json({ success: false, error: uploadError.message });
    }

    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('user_assets')
      .insert({
        user_id: userId,
        username: username,
        title: title,
        description: desc,
        file_name: fileName,
        file_url: urlData.publicUrl,
        file_type: file.mimetype,
        file_size: file.size,
      });

    if (dbError) {
      return res.status(400).json({ success: false, error: dbError.message });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
}