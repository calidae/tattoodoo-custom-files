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

    // Traduccions del missatge de quantitat mínima
    const TRANSLATIONS = {
        'es-ES': {
            quantity: 'Cantidad',
            message: ' - A partir de {min} unidades por diseño (Podrás añadir uno o varios diseños durante el proceso)'
        },
        'ca-ES': {
            quantity: 'Quantitat',
            message: ' - A partir de {min} unitats per disseny (Podràs afegir-ne un o més durant el procés)'
        },
        'nl-NL': {
            quantity: 'Hoeveelheid',
            message: ' - Vanaf {min} eenheden per ontwerp (U kunt tijdens het proces één of meer ontwerpen toevoegen)'
        },
        'fr-FR': {
            quantity: 'Quantité',
            message: ' - À partir de {min} unités par design (vous pourrez en ajouter un ou plusieurs pendant le processus)'
        },
        'de-DE': {
            quantity: 'Menge',
            message: ' - Ab {min} Einheiten pro Design (Sie können während des Prozesses ein oder mehrere Designs hinzufügen)'
        },
        'it-IT': {
            quantity: 'Quantità',
            message: ' - A partire da {min} unità per design (Potrai aggiungerne uno o più durante il processo)'
        },
        'pt-PT': {
            quantity: 'Quantidade',
            message: ' - A partir de {min} unidades por design (Poderá adicionar um ou vários durante o processo)'
        }
    };

    // Obtindre l'idioma actual
    function getLanguage () {
        const lang = document.documentElement.lang || 'en';
        return TRANSLATIONS[lang] || {
            quantity: 'Quantity',
            message: ' - From {min} units per design (You can add one or more designs during the process)'
        };
    }

    // Crear o actualitzar el missatge de quantitat mínima
    function updateMinMessage () {
        const { minQty } = getMin();

        // No mostrar missatge si el mínim és 1
        if (minQty === 1) {
            const existingMsg = document.querySelector('#min_qty_message');
            if (existingMsg) existingMsg.remove();
            return;
        }

        const langData = getLanguage();

        // Cercar el contenidor del bloc add_to_cart
        const wrapper = document.querySelector('#add_to_cart_wrap');
        if (!wrapper) return;

        // Cercar si ja existeix el missatge
        let msgContainer = document.querySelector('#min_qty_message');

        if (!msgContainer) {
            // Crear el contenidor del missatge
            msgContainer = document.createElement('h6');
            msgContainer.id = 'min_qty_message';
            msgContainer.className = 'order-first min-qty-message attribute_name mb-2';
            wrapper.insertBefore(msgContainer, wrapper.firstChild);
        }

        // Actualitzar el contingut
        msgContainer.innerHTML = '<span>' + langData.quantity + '</span><span class="text-muted">' + langData.message.replace('{min}', minQty) + '</span>';
    }

    // Determinar min segons el color seleccionat
    function getMin () {
        let minQty = 1;

        const attrList = document.querySelector('ul[data-attribute-id="1"]');
        if (!attrList) return { minQty };

        const checked = attrList.querySelector('input[type="radio"]:checked');
        if (!checked) return { minQty };

        const val = checked.value;

        // Si value és 32 o 33 → min 50, sinó min 2500
        if (val === '32' || val === '33') {
            minQty = 50;
        } else {
            minQty = 2500;
        }

        return { minQty };
    }

    function clampFactory (qtyInput, getMin) {
        return function clamp () {
            const { minQty } = getMin();
            let v = parseInt(qtyInput.value || "0");
            if (!Number.isFinite(v)) v = minQty;
            if (v < minQty) v = minQty;
            qtyInput.value = String(v);
            qtyInput.min = String(minQty);
            return v;
        };
    }

    function setup () {
        const qtyInput = document.querySelector(QTY_SEL);
        if (!qtyInput) return false;

        try { qtyInput.type = 'number'; } catch (_) { }

        const clamp = clampFactory(qtyInput, getMin);
        clamp();
        updateMinMessage();

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
                    const { minQty } = getMin();
                    if (val < minQty) {
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
                    updateMinMessage();
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
                        updateMinMessage();
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