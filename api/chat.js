import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.gemini_key;
  // Recibimos la variable 'esConversacion'
  const { prompt, historial, instruccion, esConversacion } = req.body || {};

  if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const systemText = instruccion || "Eres genDID, un asistente experto.";

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemText,
    });

    let textoFinal = "";

    if (esConversacion === true) {
      // --- MODO CONVERSACIÓN ---
      const chat = model.startChat({
        history: historial || [],
      });
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      textoFinal = response.text();
    } else {
      // --- MODO RESPUESTA ÚNICA ---
      const result = await model.generateContent(prompt);
      const response = await result.response;
      textoFinal = response.text();
    }

    return res.status(200).json({ respuesta: textoFinal });

  } catch (error) {
    return res.status(200).json({ 
      error: "Error en la ejecución", 
      mensaje: error.message 
    });
  }
}
