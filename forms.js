(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const path = window.location.pathname
            .replace(/\//g, '-')
            .replace(/^-|-$/g, '');

        document.querySelectorAll('form[action^="/website/form"]').forEach((form, i) => {
            form.id = `lead-form-${path || 'home'}-${i}`;
        });
    });
})();