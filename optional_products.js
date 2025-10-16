(function () {

    /* v.14 */

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