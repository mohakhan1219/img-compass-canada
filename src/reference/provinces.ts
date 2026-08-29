/** Geographic jurisdictions vs CaRMS R-1 participating structure. */

export type JurisdictionKind = "province" | "territory";

export type Jurisdiction = {
  code: string;
  name: string;
  kind: JurisdictionKind;
  /** True when at least one CaRMS R-1 participating institution is seeded. */
  hasR1Institutions: boolean;
};

export const JURISDICTIONS: Jurisdiction[] = [
  { code: "AB", name: "Alberta", kind: "province", hasR1Institutions: true },
  { code: "BC", name: "British Columbia", kind: "province", hasR1Institutions: true },
  { code: "MB", name: "Manitoba", kind: "province", hasR1Institutions: true },
  { code: "NB", name: "New Brunswick", kind: "province", hasR1Institutions: true },
  { code: "NL", name: "Newfoundland and Labrador", kind: "province", hasR1Institutions: true },
  { code: "NS", name: "Nova Scotia", kind: "province", hasR1Institutions: true },
  { code: "NT", name: "Northwest Territories", kind: "territory", hasR1Institutions: false },
  { code: "NU", name: "Nunavut", kind: "territory", hasR1Institutions: false },
  { code: "ON", name: "Ontario", kind: "province", hasR1Institutions: true },
  { code: "PE", name: "Prince Edward Island", kind: "province", hasR1Institutions: true },
  { code: "QC", name: "Quebec", kind: "province", hasR1Institutions: true },
  { code: "SK", name: "Saskatchewan", kind: "province", hasR1Institutions: true },
  { code: "YT", name: "Yukon", kind: "territory", hasR1Institutions: false },
];

export const R1_JURISDICTIONS = JURISDICTIONS.filter((j) => j.hasR1Institutions);

export function jurisdictionByCode(code: string): Jurisdiction | undefined {
  return JURISDICTIONS.find((j) => j.code === code);
}
