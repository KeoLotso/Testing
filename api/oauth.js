export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, redirect_uri } = req.body;
  if (!code || !redirect_uri) return res.status(400).json({ error: 'Missing code or redirect_uri' });

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: '1404211875775909958',
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri
      })
    });
    const tokenData = await tokenResponse.json();
    if (tokenData.error) return res.status(400).json(tokenData);
    return res.status(200).json({ success: true, tokens: tokenData });
  } catch {
    return res.status(500).json({ success: false });
  }
}