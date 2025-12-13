let firstValue;
let secondValue;
let count = 0;
let match = 0;

// ...existing code...
async function getArray() {
  try {
    const response = await fetch('/api/numbers');

    // Defensive check for status
    if (typeof response.status !== 'number') {
      throw new Error('Invalid HTTP response from server (no status code)');
    }

    if (response.status === 500) {
      const body = await response.text().catch(() => '');
      console.error('Server 500:', body);
      throw new Error('Server returned 500');
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`HTTP error ${response.status}: ${body}`);
    }

    const res = await response.json();
    if (!res || !Array.isArray(res.numbers)) {
      throw new Error('Unexpected payload from /api/numbers');
    }

    for (let index = 0; index < res.numbers.length; index++) {
      const block = document.querySelector(`[id='${index}']`);
      if (!block) continue;
      // clear existing content if rerun
      block.innerHTML = '';
      const image = document.createElement('img');
      image.src = `/images/${res.numbers[index]}`;
      image.setAttribute('id', `image${index}`);
      image.style.display = 'none';
      block.appendChild(image);

      block.addEventListener('click', () => {
        block.firstChild.style.display = 'block';
        if (firstValue === undefined) {
          firstValue = block.firstChild.src;
          firstBlock = block.firstChild;
          firstIndex = index;
          count++;
          document.getElementById('count').innerText = count;
          return;
        }
        if (firstValue !== undefined && secondValue === undefined) {
          secondValue = block.firstChild.src;
          secondBlock = block.firstChild;
          secondIndex = index;
          count++;
          document.getElementById('count').innerText = count;
        }

        if (firstValue === secondValue && firstIndex !== secondIndex) {
          match++;
          document.getElementById('match').innerText = match;
          firstValue = undefined;
          secondValue = undefined;
          if (match === 8) {
            const button = document.createElement('button');
            button.innerText = 'Restart the game';
            button.addEventListener('click', () => { location.reload(); });
            const resultEl = document.getElementById('result');
            resultEl.innerText = 'You won the match! ';
            resultEl.append(button);
          }
        } else {
          // use numeric delay
          setTimeout(() => {
            if (firstBlock) firstBlock.style.display = 'none';
            if (secondBlock) secondBlock.style.display = 'none';
            firstValue = undefined;
            secondValue = undefined;
          }, 100);
        }
      });
    }
  } catch (err) {
    console.error('getArray error:', err);
    // optionally show friendly UI message
    const resultEl = document.getElementById('result');
    if (resultEl) resultEl.innerText = 'Unable to load game data. Please try again later.';
  }
}
getArray();
// ...existing code...