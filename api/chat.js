export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.gemini_key;
  const { prompt } = req.body || {};

  if (!prompt) return res.status(400).json({ error: "No enviaste ninguna pregunta" });

  try {
    // USANDO VERSIÓN V1 (PRODUCCIÓN)
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

    // Comprobamos si Google devolvió un error antes de intentar leer el texto
    if (data.error) {
      return res.status(data.error.code || 500).json({ 
        error: "Error de Google", 
        mensaje: data.error.message 
      });
    }

    // Extracción segura
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const texto = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ respuesta: texto });
    } else {
      return res.status(500).json({ error: "Formato de respuesta desconocido", raw: data });
    }

  } catch (error) {
    return res.status(500).json({ error: "Error interno: " + error.message });
  }
}
