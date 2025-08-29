export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { detailedCosts } = req.body;

    if (!detailedCosts) {
      return res.status(400).json({ error: "Missing detailedCosts parameter" });
    }

    const geminiApiURL = process.env.GEMINI_API_URL;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(geminiApiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `Com base nos dados a seguir, gere duas seções: Principais Descobertas e Recomendações. Gere as considerações em tópicos. Os dados estão em CSV. Me retorne apenas as análises. Não precisa de texto introdutório. Dados:\n${detailedCosts}` }
            ]
          }
        ]
      }),
    });

    const data = await response.json();

    return res.status(200).json({ result: data });
  } catch (error) {
    console.error("IA analyser API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
