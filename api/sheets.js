export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const sheetsHost = process.env.GSHEET_HOST;
    const spreadsheetId = process.env.GSHEET_ID;
    const apiKey = process.env.GSHEET_API_KEY;

    const response = await fetch(
      `${sheetsHost}/spreadsheets/${spreadsheetId}/values/A:Z?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status}`);
    }

    const data = await response.json();

    res.status(200).json({ data: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
