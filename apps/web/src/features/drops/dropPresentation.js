export const money = (value) => `$${Number(value).toFixed(2)}`;
export const words = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
