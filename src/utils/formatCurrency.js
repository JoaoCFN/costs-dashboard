export function formatCurrency(value) {
  return `$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}
