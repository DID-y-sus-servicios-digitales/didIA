export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.gemini_key;
  const { prompt } = req.body || {};

  if (!prompt) return res.status(400).json({ error: "Falta el mensaje" });

  try {
    // Esta es la URL que funcionó en tus logs (v1/gemini-1.5-flash)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: "Eres genDID, un asistente experto. Responde a esto: " + prompt }] 
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ error: "Error de Google: " + data.error.message });
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const respuestaTexto = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ respuesta: respuestaTexto });
    } else {
      return res.status(200).json({ error: "Respuesta sin texto", detalles: data });
    }

  } catch (error) {
    return res.status(200).json({ error: "Error de conexión: " + error.message });
  }
}
