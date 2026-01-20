(function () {
    /* --------------------------------------------------------------- */
    /* v.1 – Bloqueja quantitats i amaga + / - a la pàgina del carretó */
    /* --------------------------------------------------------------- */

    const LOG = (...a) => console.log('[cart-lock]', ...a);

    function lockCartQuantities () {
        const cart = document.querySelector('#shop_cart, #cart_products');
        if (!cart) return false;

        LOG('Aplicant bloqueig de quantitats…');

        // 🔹 Desactivar tots els inputs de quantitat
        cart.querySelectorAll('input.js_quantity, input.quantity').forEach((input) => {
            input.setAttribute('readonly', 'true');
            input.style.pointerEvents = 'none';
            input.style.opacity = '0.5';
        });

        // 🔹 Amagar tots els botons + i -
        cart.querySelectorAll('.css_quantity a, .css_quantity button').forEach((btn) => {
            btn.style.setProperty('display', 'none', 'important');
            btn.style.setProperty('visibility', 'hidden', 'important');
        });

        // 🔹 Evitar clics al contenidor complet
        cart.querySelectorAll('.css_quantity').forEach((wrap) => {
            wrap.style.setProperty('pointer-events', 'none', 'important');
        });

        return true;
    }

    // 🔹 Reinjectar el bloqueig si Odoo re-renderitza la pàgina
    function startObserver () {
        const target = document.body || document.documentElement;
        if (!target) return;

        const observer = new MutationObserver(() => {
            lockCartQuantities();
        });

        observer.observe(target, { childList: true, subtree: true });

        // Primera passada immediata
        lockCartQuantities();

        LOG('Observer iniciat ✅');
    }

    // 🔹 Boot segur
    (function boot () {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startObserver);
        } else {
            startObserver();
        }
        window.addEventListener('load', startObserver);
    })();

    document.addEventListener("DOMContentLoaded", function () {
        LOG('------>>')
        setTimeout(() => {
            const path = window.location.pathname;
            if (path.match(/^\/([a-z]{2}\/)?shop(\/category\/tatuatges-temporals-personalitzats-7)?\/?$/)) {
                LOG(document.querySelectorAll(".o_wsale_product_btn"))
                function hideAddToCart () {
                    document.querySelectorAll(".o_wsale_product_btn")
                        .forEach(btn => btn.style.display = "none");
                }
                // Amaga al carregar
                hideAddToCart();
                // Observa canvis al DOM (AJAX) i amaga de nou si apareixen botons
                const observer = new MutationObserver(hideAddToCart);
                observer.observe(document.body, { childList: true, subtree: true });
            }
        }, 1000);
        LOG('<<------')
    });
})();