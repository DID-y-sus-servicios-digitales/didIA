// Importación directa desde CDN (sin necesidad de package.json)
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

export default async function handler(req, res) {
    // Cabeceras CORS para permitir peticiones desde cualquier origen
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responder rápido a la petición de control (OPTIONS)
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt, historial, instruccion, esConversacion } = req.body || {};
    const API_KEY = process.env.gemini_key;

    if (!API_KEY) return res.status(500).json({ error: "Falta la variable gemini_key en Vercel" });

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // Configuramos el modelo con la identidad original de genDID
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            // Si el cliente no envía una instrucción específica, usamos la estándar
            systemInstruction: instruccion || "Eres genDID, un asistente experto, atento y resolutivo."
        });

        let respuestaTexto = "";

        if (esConversacion === true) {
            // MODO CONVERSACIÓN: Usa el historial enviado por el cliente
            const chat = model.startChat({ 
                history: historial || [] 
            });
            const result = await chat.sendMessage(prompt);
            respuestaTexto = result.response.text();
        } else {
            // MODO RESPUESTA ÚNICA: Solo responde al prompt actual
            const result = await model.generateContent(prompt);
            respuestaTexto = result.response.text();
        }

        // Devolvemos la respuesta limpia
        return res.status(200).json({ respuesta: respuestaTexto });

    } catch (error) {
        console.error("Error en la función:", error);
        return res.status(500).json({ 
            error: "Error en el servidor de genDID", 
            mensaje: error.message 
        });
    }
}
