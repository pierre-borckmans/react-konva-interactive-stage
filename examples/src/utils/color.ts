export const color = (i: number, isDark: boolean) =>
  `hsl(${i * 36}, ${isDark ? "70%" : "80%"}, ${isDark ? "40%" : "50%"})`;
