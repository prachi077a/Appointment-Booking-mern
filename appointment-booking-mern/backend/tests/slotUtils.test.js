const { generateAllSlots, isValidFutureDate, getWeekdayName } = require("../utils/slotUtils");

describe("getWeekdayName", () => {
  it("correctly identifies the weekday for a known date", () => {
    // 2026-07-06 is a Monday
    expect(getWeekdayName("2026-07-06")).toBe("Monday");
    // 2026-07-11 is a Saturday
    expect(getWeekdayName("2026-07-11")).toBe("Saturday");
  });
});

describe("generateAllSlots", () => {
  const baseDoctor = {
    workingDays: ["Monday", "Wednesday"],
    workingHours: { start: "09:00", end: "11:00" },
    slotDurationMinutes: 30,
  };

  it("returns an empty array on a day the doctor doesn't work", () => {
    // 2026-07-07 is a Tuesday, not in workingDays
    expect(generateAllSlots(baseDoctor, "2026-07-07")).toEqual([]);
  });

  it("generates evenly spaced slots across the working window", () => {
    // Monday 2026-07-06, 09:00-11:00, 30 min slots => 4 slots
    const slots = generateAllSlots(baseDoctor, "2026-07-06");
    expect(slots).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });

  it("does not create a trailing partial slot that runs past closing time", () => {
    const doctor = {
      ...baseDoctor,
      workingHours: { start: "09:00", end: "10:15" },
      slotDurationMinutes: 30,
    };
    // 09:00-10:15 with 30 min slots: 09:00, 09:30 fit; 10:00-10:30 would overrun 10:15, so excluded
    const slots = generateAllSlots(doctor, "2026-07-06");
    expect(slots).toEqual(["09:00", "09:30"]);
  });

  it("respects a different slot duration", () => {
    const doctor = { ...baseDoctor, slotDurationMinutes: 20 };
    const slots = generateAllSlots(doctor, "2026-07-06");
    expect(slots).toEqual(["09:00", "09:20", "09:40", "10:00", "10:20", "10:40"]);
  });
});

describe("isValidFutureDate", () => {
  it("rejects malformed date strings", () => {
    expect(isValidFutureDate("not-a-date")).toBe(false);
    expect(isValidFutureDate("2026/07/06")).toBe(false);
    expect(isValidFutureDate("")).toBe(false);
  });

  it("rejects dates in the past", () => {
    expect(isValidFutureDate("2000-01-01")).toBe(false);
  });

  it("accepts today and future dates", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(isValidFutureDate(today)).toBe(true);

    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(isValidFutureDate(future.toISOString().slice(0, 10))).toBe(true);
  });
});
