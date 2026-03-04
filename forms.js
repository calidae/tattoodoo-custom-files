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
  });
  document.querySelectorAll(".s_cta_badge").forEach(function (badge) {
    badge.style.cursor = "pointer";
    badge.addEventListener("click", function (e) {
      if (e.target.tagName === "A") return;
      var link = badge.querySelector("a");
      if (link) link.click();
    });
  });
})();
