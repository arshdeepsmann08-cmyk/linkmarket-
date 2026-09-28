import { describe, expect, it } from "vitest";
import { parseFlipkartProductUrl } from "../lib/flipkart";

describe("Flipkart URL parsing", () => {
  it("extracts a product ID from query parameter pid", () => {
    expect(parseFlipkartProductUrl("https://www.flipkart.com/boat-airdopes-131/p/itm123456?pid=ACCG123456")).toEqual({
      productId: "ACCG123456",
      url: "https://www.flipkart.com/boat-airdopes-131/p/itm123456?pid=ACCG123456",
    });
  });

  it("extracts an item ID from path", () => {
    expect(parseFlipkartProductUrl("https://www.flipkart.com/boat-airdopes-131/p/itm1234567890abc")).toEqual({
      productId: "ITM1234567890ABC",
      url: "https://www.flipkart.com/boat-airdopes-131/p/itm1234567890abc",
    });
  });

  it("rejects non-Flipkart and malformed URLs", () => {
    expect(parseFlipkartProductUrl("https://example.com/item/123")).toBeNull();
    expect(parseFlipkartProductUrl("https://www.flipkart.com/search?q=shoes")).toBeNull();
  });
});
