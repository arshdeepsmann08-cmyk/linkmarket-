import { describe, expect, it } from "vitest";
import { parseAmazonProductUrl } from "../lib/amazon";

describe("Amazon URL parsing", () => {
  it("extracts an ASIN without fetching the product page", () => {
    expect(parseAmazonProductUrl("https://www.amazon.in/dp/B0ABCDE123?tag=example-21")).toEqual({ asin: "B0ABCDE123", url: "https://www.amazon.in/dp/B0ABCDE123?tag=example-21" });
  });
  it("rejects non-Amazon and malformed URLs", () => {
    expect(parseAmazonProductUrl("https://example.com/dp/B0ABCDE123")).toBeNull();
    expect(parseAmazonProductUrl("https://www.amazon.in/dp/not-an-asin")).toBeNull();
  });
});
