export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt } = req.body;
  const API_KEY = process.env.gemini_key;

  try {
    // URL CORREGIDA: Usamos gemini-1.5-flash sin puntos intermedios en el nombre
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // AQUÍ ES DONDE DICES QUIÉN ES LA IA Y PARA QUÉ SIRVE
        system_instruction: {
          parts: [{ text: "Eres genDID, un asistente virtual experto en resolver problemas técnicos y búsqueda de información. Respondes de forma clara, amable y concisa." }]
        },
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(data.error.code || 500).json({ error: data.error.message });
    }

    // Extraemos solo el texto para evitar el [object Object]
    const textoFinal = data.candidates[0].content.parts[0].text;
    
    return res.status(200).json({ respuesta: textoFinal });

  } catch (error) {
    return res.status(500).json({ error: 'Error al conectar con la API' });
  }
}
