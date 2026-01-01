export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.gemini_key;
  const { prompt } = req.body || {};

  if (!prompt) return res.status(400).json({ error: "No hay prompt" });

  try {
    // CAMBIO 1: Usamos 'gemini-pro', que es el nombre más estable y compatible
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: "Actúa como genDID, un asistente experto. Responde a: " + prompt }] 
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        error: "Google dice: " + data.error.message,
        ayuda: "Revisa que tu API KEY sea válida en Google AI Studio" 
      });
    }

    // CAMBIO 2: Verificación ultra-segura para evitar el crash o el object Object
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const texto = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ respuesta: texto });
    } else {
      return res.status(200).json({ error: "Respuesta vacía de la IA", debug: data });
    }

  } catch (error) {
    return res.status(200).json({ error: "Error de servidor: " + error.message });
  }
}
