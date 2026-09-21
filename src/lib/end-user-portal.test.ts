import { describe, expect, it } from "vitest";

import {
  END_USER_ROLE_PROFILES,
  getEndUserRoleProfile,
  getTicketProgressIndex,
} from "./end-user-portal";

describe("end-user portal profiles", () => {
  it("covers every end-user role", () => {
    expect(END_USER_ROLE_PROFILES.map((item) => item.role)).toEqual([
      "Faculty",
      "Teaching Staff",
      "Non-Teaching Staff",
      "Student",
      "Department",
    ]);
  });

  it("returns the correct dashboard data for a student", () => {
    const profile = getEndUserRoleProfile("Student");

    expect(profile.title).toBe("Student portal");
    expect(profile.subtitle).toBe("");
  });

  it("keeps assigned requests out of the outdated review state", () => {
    expect(getTicketProgressIndex({ technician: "Tech Assistant 1", statusIndex: 1 })).toBe(1);
    expect(getTicketProgressIndex({ technician: "Tech Assistant 2", statusIndex: 2 })).toBe(2);
    expect(getTicketProgressIndex({ technician: "", statusIndex: 0 })).toBe(0);
  });
});
