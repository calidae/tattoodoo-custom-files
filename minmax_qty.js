(function () {
    const QTY_SEL = 'div.css_quantity input[name="add_qty"], input.form-control.quantity[name="add_qty"]';
    const ADD_BTNS = [
        'button[name="add_to_cart"]',
        '.o_wsale_add_to_cart',
        '.oe_website_sale .o_add_to_cart',
        'a.o_wsale_add_to_cart'
    ];

    // Traduccions
    const TRANSLATIONS = {
        'es-ES': { quantity: 'Cantidad', message: ' - A partir de {min} unidades por diseño (Podrás añadir uno o varios diseños durante el proceso)' },
        'ca-ES': { quantity: 'Quantitat', message: ' - A partir de {min} unitats per disseny (Podràs afegir-ne un o més durant el procés)' },
        'nl-NL': { quantity: 'Hoeveelheid', message: ' - Vanaf {min} eenheden per ontwerp (U kunt tijdens het proces één of meer ontwerpen toevoegen)' },
        'fr-FR': { quantity: 'Quantité', message: ' - À partir de {min} unités par design (vous pourrez en ajouter un ou plusieurs pendant le processus)' },
        'de-DE': { quantity: 'Menge', message: ' - Ab {min} Einheiten pro Design (Sie können während des Prozesses ein oder mehrere Designs hinzufügen)' },
        'it-IT': { quantity: 'Quantità', message: ' - A partire da {min} unità per design (Potrai aggiungerne uno o più durante il processo)' },
        'pt-PT': { quantity: 'Quantidade', message: ' - A partir de {min} unidades por design (Poderá adicionar um ou vários durante o processo)' }
    };

    function getLanguage () {
        const lang = document.documentElement.lang || 'en';
        return TRANSLATIONS[lang] || {
            quantity: 'Quantity',
            message: ' - From {min} units per design (You can add one or more designs during the process)'
        };
    }

    function getMin () {
        const path = window.location.pathname;
        const parts = path.split("-");
        const productId = parts[parts.length - 1];

        const map = {
            "11": 50,
            "16": 50,
            "12": 2500,
            "13": 2500,
            "14": 2500,
            "15": 2500
        };

        return { minQty: map[productId] ?? 1 };
    }

    function updateMinMessage () {
        const { minQty } = getMin();
        const wrapper = document.querySelector('#add_to_cart_wrap');
        if (!wrapper) return;

        const lang = getLanguage();

        let msg = document.querySelector('#min_qty_message');

        if (minQty === 1) {
            if (msg) msg.remove();
            return;
        }

        if (!msg) {
            msg = document.createElement('h6');
            msg.id = 'min_qty_message';
            msg.className = 'order-first min-qty-message attribute_name mb-2';
            wrapper.insertBefore(msg, wrapper.firstChild);
        }

        msg.innerHTML =
            `<span>${lang.quantity}</span><span class="text-muted">${lang.message.replace('{min}', minQty)}</span>`;
    }

    function clampFactory (qtyInput) {
        return function clamp () {
            const { minQty } = getMin();
            let v = parseInt(qtyInput.value || "0");
            if (!Number.isFinite(v) || v < minQty) v = minQty;
            qtyInput.value = v;
            qtyInput.min = minQty;
            return v;
        };
    }

    function setup () {
        const qtyInput = document.querySelector(QTY_SEL);
        if (!qtyInput) return false;

        qtyInput.type = 'number';

        const clamp = clampFactory(qtyInput);

        clamp();
        updateMinMessage();

        qtyInput.addEventListener('change', clamp);
        qtyInput.addEventListener('blur', clamp);

        ADD_BTNS.forEach(sel => {
            document.querySelectorAll(sel).forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const val = clamp();
                    const { minQty } = getMin();
                    if (val < minQty) {
                        e.preventDefault();
                        qtyInput.focus();
                    }
                }, { capture: true });
            });
        });

        return true;
    }

    function boot () {
        if (setup()) return;

        const obs = new MutationObserver(() => {
            if (setup()) obs.disconnect();
        });

        obs.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();