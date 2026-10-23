// Holofoil/tilt concept inspired by https://github.com/simeydotme/pokemon-cards-css.
// The effect is applied to the preview host, independently of the exported card.
export function initProfileEffects(preview) {
  const surface = preview.parentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const properties = ['--tilt-x', '--tilt-y', '--shine-x', '--shine-y', '--foil-x', '--foil-y'];
  const reset = () => {
    preview.classList.remove('is-interacting');
    for (const property of properties) preview.style.removeProperty(property);
  };

  surface.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    const bounds = surface.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    preview.style.setProperty('--tilt-x', `${(0.5 - y) * 12}deg`);
    preview.style.setProperty('--tilt-y', `${(x - 0.5) * 16}deg`);
    preview.style.setProperty('--shine-x', `${x * 100}%`);
    preview.style.setProperty('--shine-y', `${y * 100}%`);
    preview.style.setProperty('--foil-x', `${20 + x * 60}%`);
    preview.style.setProperty('--foil-y', `${20 + y * 60}%`);
    preview.classList.add('is-interacting');
  });
  surface.addEventListener('pointerleave', reset);
  surface.addEventListener('pointercancel', reset);
  window.addEventListener('blur', reset);
  reducedMotion.addEventListener('change', reset);
}
