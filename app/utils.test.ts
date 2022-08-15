import { shorten, validateEmail } from "./utils";

test("validateEmail returns false for non-emails", () => {
  expect(validateEmail(undefined)).toBe(false);
  expect(validateEmail(null)).toBe(false);
  expect(validateEmail("")).toBe(false);
  expect(validateEmail("not-an-email")).toBe(false);
  expect(validateEmail("n@")).toBe(false);
});

test("validateEmail returns true for emails", () => {
  expect(validateEmail("kody@example.com")).toBe(true);
});

test("shorten returns shortened string", () => {
  expect(shorten("a string longer than 18 chars")).toBe(
    "a string longer th..."
  );
  expect(shorten("a string longer than 18 chars", { ellipsis: false })).toBe(
    "a string longer th"
  );
  expect(shorten("a string longer than 2 chars", { length: 2 })).toBe("a...");
  expect(
    shorten("a string longer than 2 chars", { length: 2, ellipsis: false })
  ).toBe("a");
});
