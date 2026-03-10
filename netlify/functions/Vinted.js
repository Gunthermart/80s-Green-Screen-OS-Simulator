exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Méthode non autorisée. Utilisez POST.' };
    }

    try {
        const { prompt, schema, isJson, images } = JSON.parse(event.body);
        
        const apiKey = process.env.Vinted_key;
        if (!apiKey) {
            return { 
                statusCode: 500, 
                body: JSON.stringify({ error: "La variable d'environnement Vinted_key est introuvable sur le serveur Netlify." }) 
            };
        }

        // Modèle de production stable
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent?key=${apiKey}`;
        
        const parts = [{ text: prompt }];
        if (images && Array.isArray(images)) {
            images.forEach(img => parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } }));
        }

        const payload = {
            contents: [{ role: "user", parts: parts }],
            systemInstruction: { 
                parts: [{ text: "Expert e-commerce brutal et pragmatique. Réponds en français, de manière directe, sans fioritures et avec une rationalité absolue." }] 
            }
        };

        if (isJson) {
            payload.generationConfig = { 
                responseMimeType: "application/json", 
                responseSchema: schema 
            };
        }

        const response = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        
        const data = await response.json();

        if (!response.ok) {
            return { 
                statusCode: response.status, 
                body: JSON.stringify({ error: data.error?.message || "Erreur de l'API Google" }) 
            };
        }

        return { 
            statusCode: 200, 
            body: JSON.stringify(data) 
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
