export async function fetchSheetsData() {
  const response = await fetch('/api/sheets');
  if (!response.ok) {
    throw new Error(`Erro ao buscar dados da planilha: ${response.status}`);
  }
  const data = await response.json();
  return data;
}
