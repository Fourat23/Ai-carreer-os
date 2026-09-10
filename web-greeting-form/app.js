const input = document.getElementById('name');
const out = document.getElementById('out');
input.addEventListener('input', () => { out.textContent = `Bonjour, ${input.value} !`; });
