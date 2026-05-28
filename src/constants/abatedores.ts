export const ABATEDORES_REGIONAL = "ABATEDORES";
export const ABATEDORES_FILIAIS = [165, 193, 358, 359, 382, 386] as const;

export const normalizeFilialCode = (filial: number | string | null | undefined) => {
  if (filial === null || filial === undefined) return null;

  const digits = String(filial).replace(/\D/g, "");
  if (!digits) return null;

  const normalized = Number(digits.slice(-3));
  return Number.isFinite(normalized) ? normalized : null;
};

export const isAbatedoresFilial = (filial: number | string | null | undefined) => {
  const normalized = normalizeFilialCode(filial);
  return normalized !== null && ABATEDORES_FILIAIS.includes(normalized as typeof ABATEDORES_FILIAIS[number]);
};
