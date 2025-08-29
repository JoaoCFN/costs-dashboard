export async function fetchGeminiAnalysis(detailedCosts) {
  const resonse = await fetch("/api/data-analyzer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ detailedCosts }),
  });

  if (!resonse.ok) {
    throw new Error("Failed to fetch Gemini analysis");
  }

  const data = await resonse.json();
  return data.result;
}
