import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

export default async function handler(req, res) {
    // Cabeceras para permitir la conexión desde tu HTML local
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, historial, instruccion, esConversacion } = req.body || {};
        const API_KEY = process.env.gemini_key;

        if (!API_KEY) {
            return res.status(500).json({ error: "La variable gemini_key no está configurada en Vercel." });
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: instruccion || "Eres genDID, un asistente experto y resolutivo."
        });

        let textoFinal = "";

        if (esConversacion && historial) {
            // MODO CONVERSACIÓN
            const chat = model.startChat({ history: historial });
            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            textoFinal = response.text();
        } else {
            // MODO RESPUESTA ÚNICA
            const result = await model.generateContent(prompt);
            const response = await result.response;
            textoFinal = response.text();
        }

        return res.status(200).json({ respuesta: textoFinal });

    } catch (error) {
        // Si hay un error, lo enviamos detallado para saber qué pasa
        return res.status(500).json({ 
            error: "Error en el servidor genDID", 
            mensaje: error.message 
        });
    }
}
