export const currency = (
  value: number | string | { toString(): string } | null | undefined,
  currencyCode = "INR"
) => {
  if (value === null || value === undefined) return "₹0";
  const num = Number(value.toString());
  if (Number.isNaN(num)) return "₹0";

  const code = (currencyCode || "INR").toUpperCase();
  const isInteger = Number.isInteger(num);

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
    currency: code,
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
