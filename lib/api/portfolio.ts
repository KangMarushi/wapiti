export async function getAllInvestments() {
  const res = await fetch("/api/portfolio");
  const data = await res.json();
  return data.investments;
}
