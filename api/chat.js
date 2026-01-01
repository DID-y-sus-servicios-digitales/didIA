export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST' || !req.body || !req.body.prompt) {
    return res.status(400).json({ error: 'Falta el prompt en el cuerpo de la petición.' });
  }

  const { prompt } = req.body;
  const API_KEY = process.env.gemini_key; 

  if (!API_KEY) {
    return res.status(500).json({ error: 'La variable gemini_key no está configurada.' });
  }

  try {
    // URL corregida para evitar el error 404
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // AQUÍ EDITAS QUIÉN ES LA IA
        system_instruction: {
          parts: [{ text: "Eres genDID, un asistente experto y conciso." }]
        },
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // Si Google responde con error, lo enviamos detallado para debuggear
    if (data.error) {
      return res.status(data.error.code || 500).json({ error: data.error.message });
    }

    // EXTRAEMOS EL TEXTO AQUÍ (Esto evita el object Object)
    const textoIA = data.candidates[0].content.parts[0].text;

    // Enviamos solo la propiedad "respuesta"
    res.status(200).json({ respuesta: textoIA });

  } catch (error) {
    res.status(500).json({ error: 'Error al conectar con la API de Gemini' });
  }
}
