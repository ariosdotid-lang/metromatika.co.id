(() => {
  const launcher = document.querySelector('#start-equipment-demo');
  const container = document.querySelector('#equipment-demo');
  const form = document.querySelector('#equipment-demo-form');
  if (!launcher || !container || !form) return;

  const select = form.elements.device;
  const quantity = form.elements.quantity;
  const review = container.querySelector('#demo-review');
  const success = container.querySelector('#demo-success');
  const confirm = container.querySelector('#confirm-demo-request');
  const status = container.querySelector('#equipment-demo-status');
  const stockHint = container.querySelector('#demo-stock-hint');
  const progress = [...container.querySelectorAll('.demo-progress li')];
  const inventory = new Map([...select.options].filter(option => option.value).map(option => [
    option.value,
    { title: option.textContent, initial: Number(option.dataset.stock), available: Number(option.dataset.stock) }
  ]));
  let stage = 'choose';
  let request = null;
  launcher.hidden = false;

  function showStage(nextStage) {
    stage = nextStage;
    form.hidden = stage !== 'choose';
    review.hidden = stage !== 'review';
    success.hidden = stage !== 'complete';
    const currentStep = { choose: 0, review: 1, complete: 2 }[stage];
    for (const [index, item] of progress.entries()) {
      if (index === currentStep) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    }
  }

  function renderStock() {
    const showcase = container.closest('.service-showcase');
    for (const [id, item] of inventory) {
      for (const value of showcase.querySelectorAll(`[data-stock-for="${id}"], [data-preview-stock="${id}"]`)) {
        value.textContent = `${item.available} unit`;
      }
    }
    showcase.querySelector('[data-demo-total]').textContent =
      String([...inventory.values()].reduce((total, item) => total + item.available, 0));
  }

  function updateStockHint() {
    const device = inventory.get(select.value);
    quantity.max = String(device?.available || 1);
    quantity.setCustomValidity('');
    stockHint.textContent = device ? `Tersedia ${device.available} unit dalam data demo.` :
      'Pilih perangkat untuk melihat stok demo.';
  }

  launcher.addEventListener('click', () => {
    container.hidden = false;
    launcher.hidden = true;
    select.focus();
  });
  select.addEventListener('change', updateStockHint);
  quantity.addEventListener('input', () => quantity.setCustomValidity(''));

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (stage !== 'choose') return;
    updateStockHint();
    const device = inventory.get(select.value);
    const units = Number(quantity.value);
    if (!form.reportValidity() || !device) return;
    if (!Number.isInteger(units) || units < 1 || units > device.available) {
      quantity.setCustomValidity(`Masukkan jumlah bulat antara 1 dan ${device.available} unit.`);
      quantity.reportValidity();
      return;
    }
    request = { deviceId: select.value, units };
    container.querySelector('#review-device').textContent = device.title;
    container.querySelector('#review-quantity').textContent = `${units} unit`;
    container.querySelector('#review-remaining').textContent = `${device.available - units} unit`;
    showStage('review');
    container.querySelector('#demo-review-title').focus();
    status.textContent = 'Periksa perangkat dan jumlah sebelum menyimpan simulasi.';
  });

  container.querySelector('#edit-demo-request').addEventListener('click', () => {
    showStage('choose');
    status.textContent = '';
    select.focus();
  });

  confirm.addEventListener('click', () => {
    if (stage !== 'review' || !request) return;
    const device = inventory.get(request.deviceId);
    if (request.units > device.available) {
      showStage('choose');
      updateStockHint();
      status.textContent = 'Stok demo berubah. Periksa kembali jumlah permintaan.';
      quantity.focus();
      return;
    }
    // Advance synchronously so repeated clicks cannot deduct stock twice.
    showStage('complete');
    device.available -= request.units;
    renderStock();
    container.querySelector('#demo-receipt').textContent =
      `DEMO-001 · ${request.units} unit ${device.title}. Sisa stok demo ${device.available} unit.`;
    status.textContent = 'Simulasi selesai. Stok pada panel inventaris telah diperbarui.';
    container.querySelector('#demo-success-title').focus();
  });

  container.querySelector('#reset-equipment-demo').addEventListener('click', () => {
    for (const item of inventory.values()) item.available = item.initial;
    renderStock();
    request = null;
    form.reset();
    updateStockHint();
    showStage('choose');
    status.textContent = 'Data awal demo telah dipulihkan.';
    select.focus();
  });
  updateStockHint();
})();
