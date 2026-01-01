export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt } = req.body;
  const API_KEY = process.env.gemini_key;

  try {
    // URL usando v1 y el modelo 'gemini-1.5-flash' (sin guiones extraños)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Instrucción: Eres genDID, un asistente experto. Pregunta del usuario: ${prompt}`
          }]
        }]
      })
    });

    const data = await response.json();

    // Si data tiene un error, lo enviamos al log para que lo veas
    if (data.error) {
      console.error("Error de Google:", data.error);
      return res.status(data.error.code || 500).json({ error: data.error.message });
    }

    // Extracción segura del texto
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      const textoIA = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ respuesta: textoIA });
    } else {
      return res.status(500).json({ error: "Formato de respuesta inesperado de Google" });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Error de conexión total' });
  }
}
