import { Option } from "./Option";
import { Result } from "./Result";

describe("Option", () => {
  describe(".unwrap", () => {
    it("throws error when None", () => {
      const option = new Option(null);
      expect(() => option.unwrap()).toThrow();
    });

    it("returns value when Some", () => {
      const option = new Option("value");
      expect(option.unwrap()).toBe("value");
    });
  });

  describe("unwrapOr", () => {
    it("returns default value when None", () => {
      const option = new Option(null);
      expect(option.unwrapOr("default")).toBe("default");
    });

    it("returns value when Some", () => {
      const option = new Option("value");
      expect(option.unwrapOr("default")).toBe("value");
    });
  });

  describe("map", () => {
    it("returns None when None", () => {
      const option = new Option(null);
      expect(option.map(() => "value")).toEqual(new Option(null));
    });

    it("returns Some when Some", () => {
      const option = new Option("value");
      expect(option.map(() => "value2")).toEqual(new Option("value2"));
    });
  });

  describe("mapOr", () => {
    it("returns default value when None", () => {
      const option = new Option(null);
      expect(option.mapOr("default", () => "value")).toBe("default");
    });

    it("returns value when Some", () => {
      const option = new Option("value");
      expect(option.mapOr("default", () => "value2")).toBe("value2");
    });
  });

  describe("okOr", () => {
    it("returns error when None", () => {
      const option = new Option(null);
      expect(option.okOr("error").isErr()).toBeTruthy();
    });

    it("returns value when Some", () => {
      const option = new Option("value");
      expect(option.okOr("error").isOk()).toBeTruthy();
    });
  });

  describe("and", () => {
    it("returns None when this is None", () => {
      const option = new Option(null);
      expect(option.and(new Option("value"))).toEqual(new Option(null));
    });

    it("returns the second option when this is Some", () => {
      const option = new Option("value");
      expect(option.and(new Option("value")).unwrap()).toBe("value");
      expect(option.and(new Option(null)).isSome()).toBeFalsy();
    });
  });
});
