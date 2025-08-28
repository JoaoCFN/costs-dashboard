export function parseSheetsData(rawData) {
  const headers = rawData.values[0];
  const rows = rawData.values.slice(1);

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });

    return {
      month: obj.Mês,
      provider: obj.Provedor,
      service: obj.Serviço,
      cost: parseFloat(obj.Custo.replace('$', '').replace(',', '.')) || 0
    };
  });
}
