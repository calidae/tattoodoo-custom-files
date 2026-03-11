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

    // --- T&C checkbox → habilitar/deshabilitar botón de pago ---
    function bindCheckbox() {
      var checkbox = document.getElementById("website_sale_tc_checkbox");
      var button =
        document.getElementsByName("o_payment_submit_button")[0] ||
        document.getElementById("o_payment_submit_button");

      if (!checkbox || !button) return false;
      if (checkbox.dataset.bound) return true; // ya vinculado

      checkbox.dataset.bound = "1";
      checkbox.addEventListener("change", function () {
        LOG("Checkbox cambiado:", checkbox.checked);
        if (checkbox.checked) {
          button.removeAttribute("disabled");
        } else {
          button.setAttribute("disabled", "true");
        }
      });
      return true;
    }

    // Intentar vincular ahora y también cuando Odoo re-renderice
    if (!bindCheckbox()) {
      var tcObserver = new MutationObserver(function () {
        if (bindCheckbox()) tcObserver.disconnect();
      });
      tcObserver.observe(document.body, { childList: true, subtree: true });
    }

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
