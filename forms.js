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
          langSelect.value = option.value;
        }
      }
    }
  });
})();
