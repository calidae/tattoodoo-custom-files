(function () {
    const QTY_SEL = 'div.css_quantity input[name="add_qty"], input.form-control.quantity[name="add_qty"]';
    const BTN_MINUS = '.css_quantity_minus';
    const BTN_PLUS = '.css_quantity_plus';
    const ADD_BTNS = [
        'button[name="add_to_cart"]',
        '.o_wsale_add_to_cart',
        '.oe_website_sale .o_add_to_cart',
        'a.o_wsale_add_to_cart'
    ];

    const TYPING_DEBOUNCE_MS = 600;
    function debounce (fn, wait) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    // Determinar min/max segons el color seleccionat
    function getMinMax () {
        const colorInputs = document.querySelectorAll('input[name="ptal-6"][type="radio"]');
        const checked = Array.from(colorInputs).find(i => i.checked);
        let minQty = 1;
        const maxQty = 30000;

        if (!checked) return { minQty, maxQty };

        const color = (checked.getAttribute('data-value-name') || '').toLowerCase();

        if (['1 Tinta', 'A todo color'].includes(color)) return { minQty: 50, maxQty };
        if (['Efecto glitter', 'Efecto dorado', 'Efecto metalizado', 'Efecto luminiscente'].includes(color)) return { minQty: 2500, maxQty };
        return { minQty, maxQty };
    }

    function clampFactory (qtyInput, getMinMax) {
        return function clamp () {
            const { minQty, maxQty } = getMinMax();
            let v = parseInt(qtyInput.value || "0");
            if (!Number.isFinite(v)) v = minQty;
            if (v < minQty) v = minQty;
            if (v > maxQty) v = maxQty;
            qtyInput.value = String(v);
            qtyInput.min = String(minQty);
            qtyInput.max = String(maxQty);
            return v;
        };
    }

    function setup () {
        const qtyInput = document.querySelector(QTY_SEL);
        if (!qtyInput) return false;

        try { qtyInput.type = 'number'; } catch (_) { }

        const clamp = clampFactory(qtyInput, getMinMax);
        clamp();

        const debouncedClamp = debounce(clamp, TYPING_DEBOUNCE_MS);
        qtyInput.addEventListener('input', debouncedClamp);
        qtyInput.addEventListener('change', clamp);
        qtyInput.addEventListener('blur', clamp);

        qtyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                qtyInput.blur();
            }
        });

        const minus = document.querySelector(BTN_MINUS);
        const plus = document.querySelector(BTN_PLUS);
        if (minus) minus.addEventListener('click', () => setTimeout(clamp, 0));
        if (plus) plus.addEventListener('click', () => setTimeout(clamp, 0));

        ADD_BTNS.forEach(sel => {
            document.querySelectorAll(sel).forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const val = clamp();
                    const { minQty, maxQty } = getMinMax();
                    if (val < minQty || val > maxQty) {
                        e.preventDefault();
                        qtyInput.focus();
                    }
                }, { capture: true });
            });
        });

        // 🔄 Quan canvia el color (radio change), actualitzar min i clamp
        const colorRadios = document.querySelectorAll('input[name="ptal-6"][type="radio"]');
        colorRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                // deixem que Odoo actualitzi el DOM abans de recalcular
                setTimeout(() => {
                    clamp();
                    console.log('🎨 Color canviat → mínim actualitzat');
                }, 100);
            });
        });

        // 🔍 Si els inputs apareixen més tard
        const observer = new MutationObserver(() => {
            const newRadios = document.querySelectorAll('input[name="ptal-6"][type="radio"]');
            newRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    setTimeout(() => {
                        clamp();
                        console.log('🎨 Color canviat (DOM nou) → mínim actualitzat');
                    }, 100);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return true;
    }

    function boot () {
        if (setup()) return;
        const obs = new MutationObserver(() => { if (setup()) obs.disconnect(); });
        obs.observe(document.body, { childList: true, subtree: true });
        const poll = setInterval(() => { if (setup()) clearInterval(poll); }, 300);
        window.addEventListener('load', () => { setup(); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();