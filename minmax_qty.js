document.addEventListener("DOMContentLoaded", function () {
    const qtyInput = document.querySelector('input[name="add_qty"]');
    const form = document.querySelector('form[action*="/shop/cart/update"]');
    if (!qtyInput || !form) return;

    qtyInput.setAttribute("type", "number");

    const minField = document.querySelector('[data-oe-field="x_studio_x_min_qty"]');
    const maxField = document.querySelector('[data-oe-field="x_studio_x_max_qty"]');

    const minQty = minField ? parseInt(minField.textContent.trim()) || 1 : 1;
    const maxQty = maxField ? parseInt(maxField.textContent.trim()) || 30000 : 30000;

    qtyInput.min = minQty;
    qtyInput.max = maxQty;
    qtyInput.step = 1;
    qtyInput.value = Math.max(minQty, parseInt(qtyInput.value || 0) || minQty);

    qtyInput.addEventListener("input", function () {
        let val = parseInt(this.value || 0);
        if (isNaN(val)) val = minQty;
        if (val < minQty) val = minQty;
        if (val > maxQty) val = maxQty;
        this.value = val;
    });

    form.addEventListener("submit", function (e) {
        const val = parseInt(qtyInput.value || 0);
        if (val < minQty || val > maxQty) {
            e.preventDefault();
            alert(`Aquest producte té un mínim de ${minQty} unitats i un màxim de ${maxQty}.`);
            qtyInput.focus();
            return false;
        }
    });
});