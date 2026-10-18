/* Bedienung der Kinder-Plus/Minus-Tasten. Keine Steuerberechnung. */
(() => {
  'use strict';
  const range = document.getElementById('kids');
  const minus = document.getElementById('kidsMinus');
  const plus = document.getElementById('kidsPlus');

  function updateButtons() {
    const value = Number(range.value);
    minus.disabled = value <= Number(range.min);
    plus.disabled = value >= Number(range.max);
  }

  function step(delta) {
    const value = Number(range.value) + delta;
    range.value = String(Math.max(Number(range.min), Math.min(Number(range.max), value)));
    range.dispatchEvent(new Event('input', { bubbles: true }));
    updateButtons();
  }

  minus.addEventListener('click', () => step(-1));
  plus.addEventListener('click', () => step(1));
  range.addEventListener('input', updateButtons);
  updateButtons();
})();
