import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.gemini_key;
  const { prompt } = req.body || {};

  if (!prompt) return res.status(400).json({ error: "Falta el mensaje" });

  try {
    // Inicializar el SDK
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Configurar el modelo (aquí es donde definimos la identidad)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Eres genDID, un asistente experto en tecnología y búsqueda de información. Responde de forma clara y directa.",
    });

    // Generar contenido
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ respuesta: text });

  } catch (error) {
    // Si el modelo falla, el SDK nos dará un mensaje claro
    return res.status(200).json({ 
      error: "Error del SDK de Gemini", 
      mensaje: error.message 
    });
  }
}
