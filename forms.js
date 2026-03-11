(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname
      .replace(/\//g, "-")
      .replace(/^-|-$/g, "");

    document
      .querySelectorAll('form[action^="/website/form"]')
      .forEach((form, i) => {
        form.id = `lead-form-${path || "home"}-${i}`;
      });

    // Set select[name="lang"] to the document's HTML lang
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      const langSelect = document.querySelector('select[name="lang"]');
      if (langSelect) {
        // Normalize: "es" or "es-ES" → match option values like "es_ES", "ca_ES", etc.
        const normalized = htmlLang.replace("-", "_");
        const option =
          langSelect.querySelector(`option[value="${normalized}"]`) ||
          langSelect.querySelector(
            `option[value^="${normalized.split("_")[0]}_"]`,
          );
        if (option) {
          const targetValue = option.value;
          langSelect.value = targetValue;

          // Odoo JS loads after and resets the select value.
          // Poll to re-apply until stable or user interacts.
          const interval = setInterval(() => {
            if (langSelect.value !== targetValue) {
              langSelect.value = targetValue;
            }
          }, 200);

          // Stop polling once the user manually changes the select
          langSelect.addEventListener("change", () => clearInterval(interval), {
            once: true,
          });

          // Stop polling after 10s regardless
          setTimeout(() => clearInterval(interval), 10000);
        }
      }
    }

    var checkbox = document.getElementById("website_sale_tc_checkbox");
    var button = document.getElementById("o_payment_submit_button");

    if (!checkbox || !button) {
      console.warn("No se encontró el checkbox o el botón");
      return;
    }

    checkbox.onchange = function () {
      button.disabled = !this.checked;
    };
  });
})();
