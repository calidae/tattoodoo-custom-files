document.addEventListener("DOMContentLoaded", function () {
    console.log("Script carregat correctament ✅");

    // 🔁 Esperem fins que el DOM tingui el formulari i el camp de quantitat
    const checkInterval = setInterval(() => {
        const qtyInput = document.querySelector('input[name="add_qty"]');
        const form = document.querySelector('form[action*="/shop/cart/update"]');
        if (!qtyInput || !form) return; // Encara no hi és

        clearInterval(checkInterval); // Aturem el bucle
        console.log("Camp de quantitat trobat ✅");

        qtyInput.setAttribute("type", "number");

        // Llegim els valors dels camps personalitzats de Studio
        const minField = document.querySelector('[data-oe-field="x_studio_x_min_qty"]');
        const maxField = document.querySelector('[data-oe-field="x_studio_x_max_qty"]');
        const minQty = minField ? parseInt(minField.textContent.trim()) || 1 : 1;
        const maxQty = maxField ? parseInt(maxField.textContent.trim()) || 30000 : 30000;

        // Aplicar restriccions
        qtyInput.min = minQty;
        qtyInput.max = maxQty;
        qtyInput.step = 1;
        qtyInput.value = Math.max(minQty, parseInt(qtyInput.value || 0) || minQty);

        // Validació en temps real
        qtyInput.addEventListener("input", function () {
            let val = parseInt(this.value || 0);
            if (isNaN(val)) val = minQty;
            if (val < minQty) val = minQty;
            if (val > maxQty) val = maxQty;
            this.value = val;
        });

        // Bloqueig a l’afegir al carro
        form.addEventListener("submit", function (e) {
            const val = parseInt(qtyInput.value || 0);
            if (val < minQty || val > maxQty) {
                e.preventDefault();
                alert(`Aquest producte té un mínim de ${minQty} unitats i un màxim de ${maxQty}.`);
                qtyInput.focus();
                return false;
            }
        });

        // Missatge visual
        const hint = document.createElement("div");
        hint.textContent = `Mínim ${minQty} / Màxim ${maxQty}`;
        hint.style.fontSize = "13px";
        hint.style.color = "#888";
        hint.style.marginTop = "4px";
        qtyInput.insertAdjacentElement("afterend", hint);

        console.log(`Restriccions aplicades: min=${minQty}, max=${maxQty}`);
    }, 500); // comprova cada mig segon fins que existeixi
});