import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

export default async function handler(req, res) {
    // Cabeceras de respuesta para evitar el "Failed to fetch" por CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, historial, instruccion, esConversacion } = req.body || {};
        const API_KEY = process.env.gemini_key;

        if (!API_KEY) throw new Error("API_KEY no encontrada en las variables de entorno");

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: instruccion || "Eres genDID, un asistente experto."
        });

        let respuesta = "";

        if (esConversacion && historial) {
            const chat = model.startChat({ history: historial });
            const result = await chat.sendMessage(prompt);
            respuesta = result.response.text();
        } else {
            const result = await model.generateContent(prompt);
            respuesta = result.response.text();
        }

        return res.status(200).json({ respuesta: respuesta });

    } catch (error) {
        // Al enviar el error como JSON, ayudamos a que el chat no se bloquee
        return res.status(500).json({ 
            error: "Error en el servidor genDID", 
            mensaje: error.message 
        });
    }
}
