export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = datePart.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${m}/${d}/${y}`;
}
