document.querySelectorAll(".s_cta_badge").forEach(function (badge) {
  badge.style.cursor = "pointer";
  badge.addEventListener("click", function (e) {
    if (document.body.classList.contains("o_builder_open")) return;
    if (e.target.tagName === "A") return;
    var link = badge.querySelector("a");
    if (link) link.click();
  });
});

document
  .querySelectorAll('.o_colored_level[data-name="Team Member"]')
  .forEach(function (el) {
    var link = el.querySelector("a");
    if (!link) return;
    el.style.cursor = "pointer";
    el.addEventListener("click", function (e) {
      if (document.body.classList.contains("o_builder_open")) return;
      if (e.target.closest("a")) return;
      window.location.href = link.href;
    });
  });
