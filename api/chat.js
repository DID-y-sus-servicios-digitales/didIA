export default async function handler(req, res) {
  // Manejo de CORS para permitir la conexión desde tu frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verificamos que sea una petición POST válida
  if (req.method !== 'POST' || !req.body) {
    return res.status(400).json({ 
      error: 'Petición inválida. Usa POST y envía un prompt en el cuerpo JSON.' 
    });
  }

  const { prompt } = req.body;
  
  // USAMOS TU NOMBRE DE VARIABLE: gemini_key
  const API_KEY = process.env.gemini_key; 

  if (!API_KEY) {
    return res.status(500).json({ error: 'La variable gemini_key no está configurada en Vercel.' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al conectar con la API de Gemini' });
  }
}
