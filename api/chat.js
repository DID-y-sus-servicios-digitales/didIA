import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

export default async function handler(req, res) {
    // Configuración de cabeceras para evitar bloqueos de red
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, historial, instruccion, esConversacion } = req.body || {};
        const API_KEY = process.env.gemini_key;

        if (!API_KEY) throw new Error("API_KEY no configurada en Vercel");

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: instruccion || "Eres genDID, un asistente experto."
        });

        let texto = "";
        if (esConversacion && historial) {
            const chat = model.startChat({ history: historial });
            const result = await chat.sendMessage(prompt);
            texto = result.response.text();
        } else {
            const result = await model.generateContent(prompt);
            texto = result.response.text();
        }

        return res.status(200).json({ respuesta: texto });

    } catch (error) {
        // Esto hará que veas el error real en tu navegador
        return res.status(500).json({ 
            error: "Error en el servidor", 
            mensaje: error.message,
            stack: error.stack 
        });
    }
}
