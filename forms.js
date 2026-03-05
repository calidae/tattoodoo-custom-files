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

          function setLang() {
            if (langSelect.value !== targetValue) {
              langSelect.value = targetValue;
            }
          }

          // Set immediately
          setLang();

          // Watch for Odoo scripts that may reset the select after load
          const observer = new MutationObserver(setLang);
          observer.observe(langSelect, {
            attributes: true,
            childList: true,
            subtree: true,
          });

          // Stop observing once the user interacts with the select
          langSelect.addEventListener("change", () => observer.disconnect(), {
            once: true,
          });

          // Also stop observing after 10s to avoid interference long-term
          setTimeout(() => observer.disconnect(), 10000);
        }
      }
    }
  });
})();
