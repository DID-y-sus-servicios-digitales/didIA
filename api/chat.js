import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.gemini_key;
  // Recibimos el prompt y opcionalmente la instruccion desde el body
  const { prompt, instruccion } = req.body || {};

  if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Si el cliente envía 'instruccion', la usamos. Si no, usamos la de genDID.
    const systemText = instruccion || "Eres genDID, un asistente experto y conciso.";

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemText,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ respuesta: text });

  } catch (error) {
    return res.status(200).json({ 
      error: "Error del SDK", 
      mensaje: error.message 
    });
  }
}
