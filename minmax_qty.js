(function () {
    const LOG = (...a) => console.log("[minmax]", ...a);

    // Selectors
    const QTY_SEL = 'div.css_quantity input[name="add_qty"], input.form-control.quantity[name="add_qty"]';
    const BTN_MINUS = '.css_quantity_minus';
    const BTN_PLUS = '.css_quantity_plus';
    const ADD_BTNS = [
        'button[name="add_to_cart"]',
        '.o_wsale_add_to_cart',
        '.oe_website_sale .o_add_to_cart',
        'a.o_wsale_add_to_cart'
    ];

    function getMinMax (qtyInput) {
        const minField = document.querySelector('[data-oe-field="x_studio_x_min_qty"]');
        const maxField = document.querySelector('[data-oe-field="x_studio_x_max_qty"]');
        const fromStudioMin = minField ? parseInt(minField.textContent.trim()) : NaN;
        const fromStudioMax = maxField ? parseInt(maxField.textContent.trim()) : NaN;

        const fromAttrMin = parseInt(qtyInput.getAttribute('data-min'));
        const minQty = Number.isFinite(fromStudioMin) ? fromStudioMin :
            Number.isFinite(fromAttrMin) ? fromAttrMin : 1;
        const maxQty = Number.isFinite(fromStudioMax) ? fromStudioMax : 30000;

        return { minQty, maxQty };
    }

    function clampFactory (qtyInput, minQty, maxQty) {
        return function clamp () {
            let v = parseInt(qtyInput.value || "0");
            if (!Number.isFinite(v)) v = minQty;
            if (v < minQty) v = minQty;
            if (v > maxQty) v = maxQty;
            qtyInput.value = String(v);
            return v;
        };
    }

    function setup () {
        const qtyInput = document.querySelector(QTY_SEL);
        if (!qtyInput) return false;

        // Forcem type=number
        try { qtyInput.type = 'number'; } catch (_) { }

        const { minQty, maxQty } = getMinMax(qtyInput);
        const clamp = clampFactory(qtyInput, minQty, maxQty);

        qtyInput.min = String(minQty);
        qtyInput.max = String(maxQty);
        qtyInput.step = '1';
        clamp();

        // Lliguem esdeveniments d'entrada
        ['input', 'change', 'blur'].forEach(ev => qtyInput.addEventListener(ev, () => clamp()));

        // Lliguem plus/minus (Odoo canvia el valor per JS)
        const minus = document.querySelector(BTN_MINUS);
        const plus = document.querySelector(BTN_PLUS);
        if (minus) minus.addEventListener('click', () => setTimeout(clamp, 0));
        if (plus) plus.addEventListener('click', () => setTimeout(clamp, 0));

        // Bloqueig a "Add to cart" (pot ser botó JS, no <form>)
        ADD_BTNS.forEach(sel => {
            document.querySelectorAll(sel).forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const val = clamp();
                    if (val < minQty || val > maxQty) {
                        e.preventDefault();
                        alert(`Aquest producte té un mínim de ${minQty} i un màxim de ${maxQty}.`);
                        qtyInput.focus();
                        LOG("Bloquejat add_to_cart per fora de rang", { val, minQty, maxQty, sel });
                    }
                }, { capture: true });
            });
        });

        // // Missatge visual sota el camp
        // const hint = document.createElement('div');
        // hint.textContent = `Mínim ${minQty} / Màxim ${maxQty}`;
        // hint.style.fontSize = '13px';
        // hint.style.color = '#888';
        // hint.style.marginTop = '4px';
        // qtyInput.insertAdjacentElement('afterend', hint);

        LOG("Aplicat", { minQty, maxQty });
        return true;
    }

    function boot () {
        LOG("Inici");
        // Intent immediat
        if (setup()) return;

        // Observer per injeccions dinàmiques
        const obs = new MutationObserver(() => { if (setup()) obs.disconnect(); });
        obs.observe(document.body, { childList: true, subtree: true });

        // Poll de suport (per SPA/iframes rars)
        const poll = setInterval(() => {
            if (setup()) { clearInterval(poll); }
        }, 300);

        // Reintenta en load també
        window.addEventListener('load', () => { setup(); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();