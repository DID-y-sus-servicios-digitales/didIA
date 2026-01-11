import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.gemini_key;
  // Recibimos: prompt (pregunta), historial (el chat previo) e instruccion
  const { prompt, historial, instruccion } = req.body || {};

  if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const systemText = instruccion || "Eres genDID, un asistente experto en conversación.";

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemText,
    });

    // Iniciamos el chat con el historial que viene del navegador
    // El historial debe ser un array de objetos: { role: "user" o "model", parts: [{ text: "..." }] }
    const chat = model.startChat({
      history: historial || [], 
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ respuesta: text });

  } catch (error) {
    return res.status(200).json({ 
      error: "Error en la conversación", 
      mensaje: error.message 
    });
  }
}
