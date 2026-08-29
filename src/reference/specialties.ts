export type Specialty = {
  id: string;
  name: string;
};

/** Common CaRMS R-1 research interests — not a complete 2027 program catalog. */
export const SPECIALTIES: Specialty[] = [
  { id: "family-medicine", name: "Family Medicine" },
  { id: "internal-medicine", name: "Internal Medicine" },
  { id: "pediatrics", name: "Paediatrics" },
  { id: "psychiatry", name: "Psychiatry" },
  { id: "general-surgery", name: "General Surgery" },
  { id: "obstetrics-gynecology", name: "Obstetrics and Gynaecology" },
  { id: "anesthesiology", name: "Anesthesiology" },
  { id: "emergency-medicine", name: "Emergency Medicine" },
  { id: "neurology", name: "Neurology" },
  { id: "diagnostic-radiology", name: "Diagnostic Radiology" },
  { id: "anatomic-pathology", name: "Anatomic Pathology" },
  { id: "public-health", name: "Public Health and Preventive Medicine" },
];

export function specialtyById(id: string): Specialty | undefined {
  return SPECIALTIES.find((s) => s.id === id);
}
