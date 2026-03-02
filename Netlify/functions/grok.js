exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { userMessage } = JSON.parse(event.body);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.Grok_key}`, // ✅ Netlify env variable
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "Tum ek helpful AI assistant ho. Chat friendly aur natural honi chahiye. jb user english me type kre to english me reply do or jab user hindi me likhe tb Hindi aur English mix (Hinglish) ka use karo."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            max_tokens: 1024,
            temperature: 0.7
        })
    });

    const data = await response.json();
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    };
};