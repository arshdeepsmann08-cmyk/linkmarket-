export const currency = (
  value: number | string | { toString(): string } | null | undefined,
  currencyCode = "INR"
) => {
  if (value === null || value === undefined) return "?0";
  let num = 0;
  try {
    num = Number(value.toString());
  } catch {
    num = 0;
  }
  if (Number.isNaN(num)) return "?0";

  const rawCode = (currencyCode || "INR").toString().trim().toUpperCase();
  const code = rawCode.replace(/[^A-Z]/g, "") || "INR";
  const isInteger = Number.isInteger(num);

  try {
    if (code === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: isInteger ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(num);
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code.length === 3 ? code : "USD",
      minimumFractionDigits: isInteger ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch (err) {
    return `?${num.toLocaleString("en-IN")}`;
  }
};

export const slugify = (value: string) =>
  (value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

