export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export const cardHover = {
  whileHover: { y: -3, transition: { duration: 0.2 } },
};
