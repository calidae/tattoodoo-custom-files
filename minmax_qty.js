(function () {

    /* v.13 */
    /* -------------------------------------------------------- */
    /* Ocultar etiquetes min- i max- de la pantalla de producte */
    /* -------------------------------------------------------- */
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("span").forEach(span => {
            const text = span.textContent.trim().toLowerCase();
            if (text.startsWith("min-") || text.startsWith("max-")) {
                span.style.display = "none";
            }
        });
    });

    /* ------------------------------------------------------------------------------- */
    /* Modificar el input per un de number amb els valors min- i max- de les etiquetes */
    /* ------------------------------------------------------------------------------- */
    const QTY_SEL = 'div.css_quantity input[name="add_qty"], input.form-control.quantity[name="add_qty"]';
    const BTN_MINUS = '.css_quantity_minus';
    const BTN_PLUS = '.css_quantity_plus';
    const ADD_BTNS = [
        'button[name="add_to_cart"]',
        '.o_wsale_add_to_cart',
        '.oe_website_sale .o_add_to_cart',
        'a.o_wsale_add_to_cart'
    ];

    function getMinMax () {
        // Busca spans amb text tipus "min-50" o "max-30000"
        const minSpan = [...document.querySelectorAll('span')]
            .find(s => s.textContent.trim().toLowerCase().startsWith('min-'));
        const maxSpan = [...document.querySelectorAll('span')]
            .find(s => s.textContent.trim().toLowerCase().startsWith('max-'));

        // Extreu els números, si no hi són posa valors per defecte
        const minQty = minSpan ? parseInt(minSpan.textContent.replace(/[^0-9]/g, '')) || 1 : 1;
        const maxQty = maxSpan ? parseInt(maxSpan.textContent.replace(/[^0-9]/g, '')) || 30000 : 30000;

        console.log('🧩 Mínim detectat:', minQty, 'Màxim detectat:', maxQty);

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

        const { minQty, maxQty } = getMinMax();
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
                        qtyInput.focus();
                    }
                }, { capture: true });
            });
        });
        return true;
    }
    function boot () {
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

    /* ----------------------------------------- */
    /* Modificar el input del modal de opcionals */
    /* ----------------------------------------- */
    const LOG = (...a) => console.log('[optional-modal]', ...a);

    function formatPrice (num) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(num);
    }

    function updateModalTotals (modal) {
        modal.querySelectorAll('tr').forEach((row) => {
            // Ignorem files dins de taules opcionals
            if (row.closest('.o_sale_optional_products')) return;

            const priceEl = row.querySelector(
                '[name="sale_product_configurator_formatted_price"]'
            );
            const qtyInput = row.querySelector('input[name="sale_quantity"]');
            if (!priceEl || !qtyInput) return;

            const priceText = priceEl.textContent
                .replace(/[^\d,.-]/g, '')
                .replace(',', '.');
            const unitPrice = parseFloat(priceText) || 0;
            const qty = parseFloat(qtyInput.value || '1') || 1;
            const total = unitPrice * qty;

            priceEl.textContent = formatPrice(total);
        });

        // Recalcular si canvien selects (variants / opcions)
        modal.querySelectorAll('select').forEach((sel) => {
            if (sel.dataset._totalHooked) return;
            sel.dataset._totalHooked = '1';
            sel.addEventListener('change', () => updateModalTotals(modal));
        });
    }

    function lockQuantities (modal) {
        modal.querySelectorAll('input[name="sale_quantity"]').forEach((input) => {
            // Evitem bloquejar els inputs dins de taules opcionals
            if (input.closest('.o_sale_optional_products')) return;

            input.setAttribute('readonly', 'true');
            input.style.pointerEvents = 'none';
            input.style.opacity = '0.5';
        });
        modal
            .querySelectorAll(
                'button[name="sale_quantity_button_minus"], button[name="sale_quantity_button_plus"]'
            )
            .forEach((btn) => {
                if (btn.closest('.o_sale_optional_products')) return;
                btn.style.display = 'none';
            });
    }

    function handleModal (table) {
        // Ignorem completament les taules opcionals
        if (table.closest('.o_sale_optional_products')) return;

        const modal = table.closest('.modal-body');
        if (!modal || modal.dataset.jsHandled) return;
        modal.dataset.jsHandled = 'true';

        LOG('Modal detectat, aplicant canvis…');
        lockQuantities(modal);
        updateModalTotals(modal);
    }

    function startObserver () {
        const target = document.body || document.documentElement;
        if (!target) return false;

        const observer = new MutationObserver(() => {
            document
                .querySelectorAll(
                    '.o_sale_product_configurator_table, .oe_sale_product_configurator_table'
                )
                .forEach(handleModal);
        });

        observer.observe(target, { childList: true, subtree: true });
        // Primera passada per si el modal ja és present
        document
            .querySelectorAll(
                '.o_sale_product_configurator_table, .oe_sale_product_configurator_table'
            )
            .forEach(handleModal);

        LOG('Observer iniciat ✅');
        return true;
    }

    (function boot () {
        if (startObserver()) return;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => startObserver());
        } else {
            const t = setInterval(() => {
                if (startObserver()) clearInterval(t);
            }, 100);
        }
        window.addEventListener('load', () => startObserver());
    })();
})();