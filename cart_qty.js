(function () {
  /* --------------------------------------------------------------- */
  /* v.1 – Bloqueja quantitats i amaga + / - a la pàgina del carretó */
  /* --------------------------------------------------------------- */

  const LOG = (...a) => console.log("[cart-lock]", ...a);

  function lockCartQuantities() {
    const cart = document.querySelector("#shop_cart, #cart_products");
    if (!cart) return false;

    LOG("Aplicant bloqueig de quantitats…");

    // 🔹 Desactivar tots els inputs de quantitat
    cart
      .querySelectorAll("input.js_quantity, input.quantity")
      .forEach((input) => {
        input.setAttribute("readonly", "true");
        input.style.pointerEvents = "none";
        input.style.opacity = "0.5";
      });

    // 🔹 Amagar tots els botons + i -
    cart
      .querySelectorAll(".css_quantity a, .css_quantity button")
      .forEach((btn) => {
        btn.style.setProperty("display", "none", "important");
        btn.style.setProperty("visibility", "hidden", "important");
      });

    // 🔹 Evitar clics al contenidor complet
    cart.querySelectorAll(".css_quantity").forEach((wrap) => {
      wrap.style.setProperty("pointer-events", "none", "important");
    });

    return true;
  }

  // 🔹 Reinjectar el bloqueig si Odoo re-renderitza la pàgina
  function startObserver() {
    const target = document.body || document.documentElement;
    if (!target) return;

    const observer = new MutationObserver(() => {
      lockCartQuantities();
    });

    observer.observe(target, { childList: true, subtree: true });

    // Primera passada immediata
    lockCartQuantities();

    LOG("Observer iniciat ✅");
  }

  // 🔹 Boot segur
  (function boot() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", startObserver);
    } else {
      startObserver();
    }
    window.addEventListener("load", startObserver);
  })();

  // --- T&C checkbox → habilitar/deshabilitar botón de pago ---
  // Usa event delegation: no importa si Odoo re-renderiza el botón
  (function initTCCheckbox() {
    document.addEventListener("change", function (e) {
      if (e.target && e.target.id === "website_sale_tc_checkbox") {
        var button = document.querySelector(
          "button[type='submit'][name='o_payment_submit_button']",
        );

        LOG("TC checkbox cambiado:", e.target.checked, "Botón:", button);

        if (!button) {
          LOG("⚠️ Botón de pago no encontrado. Selectores disponibles:");
          LOG(
            "  [name]:",
            document.querySelectorAll("[name*='payment']").length,
          );
          LOG(
            "  .o_payment:",
            document.querySelectorAll("[class*='o_payment']").length,
          );
          return;
        }

        odoo.require("@web/core/dialog/dialog", function (DialogModule) {
          const Dialog = DialogModule.Dialog;

          const env = owl.Component.env;

          env.services.dialog.add(Dialog, {
            title: "Título",
            body: "Contenido del diálogo",
          });
        });

        if (e.target.checked) {
          button.removeAttribute("disabled");
        } else {
          button.setAttribute("disabled", "true");
        }
      }
    });
    LOG("TC checkbox listener (delegado) registrado ✅");
  })();

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
      const path = window.location.pathname;
      if (
        path.match(
          /^\/([a-z]{2}\/)?shop(\/category\/tatuatges-temporals-personalitzats-7)?\/?$/,
        )
      ) {
        function hideAddToCart() {
          document
            .querySelectorAll(".o_wsale_product_btn")
            .forEach((btn) => (btn.style.display = "none"));
        }
        // Amaga al carregar
        hideAddToCart();
        // Observa canvis al DOM (AJAX) i amaga de nou si apareixen botons
        const observer = new MutationObserver(hideAddToCart);
        observer.observe(document.body, { childList: true, subtree: true });
      }
    }, 500);
  });
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
      document
        .querySelectorAll("#portal_connect_software_modal_btn")
        .forEach((btn) => (btn.style.display = "none"));
    }, 500);
  });
})();
