/** JS mirror of the CSS design tokens in index.css, for charts and inline SVG. */
export const colors = {
  mist: '#FFF1F6',
  petal: '#FFD6E7',
  blush: '#F8BBD0',
  glow: '#F672A7',
  rose: '#E0487E',
  deep: '#C2185B',
  white: '#FFFFFF',
};

/** Guidance level → visual treatment (colours from the pink palette only). */
export const levelStyles = {
  urgent: { container: 'bg-deep text-white border-deep', badge: 'bg-white text-deep' },
  see_doctor: { container: 'bg-petal text-deep border-rose', badge: 'bg-rose text-white' },
  self_care: { container: 'bg-white text-deep border-blush', badge: 'bg-petal text-deep' },
};
