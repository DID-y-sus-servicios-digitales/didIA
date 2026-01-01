export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt } = req.body;
  const API_KEY = process.env.gemini_key;

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "Eres genDID, un asistente virtual experto en resolver problemas técnicos y búsqueda de información. Respondes de forma clara y concisa." }]
        },
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(data.error.code || 500).json({ error: data.error.message });
    }

    const textoIA = data.candidates[0].content.parts[0].text;
    
    return res.status(200).json({ respuesta: textoIA });

  } catch (error) {
    return res.status(500).json({ error: 'Error de conexión' });
  }
}
