const btn = document.getElementById('inc');
const out = document.getElementById('count');
btn.addEventListener('click', () => {
  out.textContent = String(Number(out.textContent) + 1);
});
