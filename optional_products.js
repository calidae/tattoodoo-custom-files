(function () {

    /* ---------------------------------------------- */
    /* V.20 Modificar el input del modal de opcionals */
    /* ---------------------------------------------- */
    const LOG = (...a) => console.log('[optional-modal]', ...a);

    function formatPrice (num) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(num);
    }

    // 🔹 Bloqueja tots els inputs i botons de quantitat (sense excepcions)
    function lockAllQuantities (modal) {
        // 🔹 Bloqueja tots els inputs numèrics
        modal.querySelectorAll('input[name="sale_quantity"]').forEach((input) => {
            input.setAttribute('readonly', 'true');
            input.style.pointerEvents = 'none';
            input.style.opacity = '0.5';
        });

        // 🔹 Amaga els botons + i -
        modal
            .querySelectorAll(
                'button[name="sale_quantity_button_minus"], button[name="sale_quantity_button_plus"]'
            )
            .forEach((btn) => {
                btn.style.setProperty('display', 'none', 'important');
                btn.style.setProperty('visibility', 'hidden', 'important');
            });

        // 🔹 També amaga el contenidor complet (opcional)
        modal.querySelectorAll('[name="quantity_buttons_wrapper"]').forEach((wrapper) => {
            wrapper.style.setProperty('pointer-events', 'none', 'important');
        });
    }

    // 🔹 Inicialitza una taula: bloqueja quantitats i enganxa esdeveniments locals
    function initConfiguratorTable (table) {
        if (table.dataset.jsHandled) return;
        table.dataset.jsHandled = 'true';

        LOG('Inicialitzant taula de configurador…');

        const modal = table.closest('.modal-body');
        if (!modal) return;

        // Bloquejar totes les quantitats del modal (no només la taula)
        lockAllQuantities(modal);
    }

    // 🔹 Detecta quan s’injecten taules noves
    function startObserver () {
        const target = document.body || document.documentElement;
        if (!target) return false;

        const observer = new MutationObserver(() => {
            document
                .querySelectorAll('.o_sale_product_configurator_table, .oe_sale_product_configurator_table')
                .forEach(initConfiguratorTable);
        });

        observer.observe(target, { childList: true, subtree: true });

        // Primera passada immediata
        document
            .querySelectorAll('.o_sale_product_configurator_table, .oe_sale_product_configurator_table')
            .forEach(initConfiguratorTable);

        LOG('Observer iniciat ✅');
        return true;
    }

    // 🔹 Boot segur
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