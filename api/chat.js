export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.gemini_key;
  const { prompt } = req.body || {};

  if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

  try {
    // ESTA COMBINACIÓN ES LA CORRECTA: v1beta + gemini-1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: "Eres genDID, un asistente experto. Responde a: " + prompt }] 
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        error: "Google dice: " + data.error.message,
        debug: "Revisa si tu API KEY tiene restricciones en Google AI Studio"
      });
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return res.status(200).json({ respuesta: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(200).json({ error: "Respuesta vacía", raw: data });
    }

  } catch (error) {
    return res.status(200).json({ error: "Error interno: " + error.message });
  }
}
