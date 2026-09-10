const q = document.getElementById('q');
const hits = document.getElementById('hits');
q.addEventListener('input', () => {
  const needle = q.value.toLowerCase();
  const n = window.FRUITS.filter((f) => f.toLowerCase().includes(needle)).length;
  hits.textContent = String(n);
});
