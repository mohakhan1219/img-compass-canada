import type { ImgProfile } from "./types";

export type ProfileSectionId =
  | "personal"
  | "education"
  | "training"
  | "canada"
  | "career"
  | "preferences"
  | "credentials"
  | "exams"
  | "language";

export type SectionCompleteness = {
  id: ProfileSectionId;
  label: string;
  filled: number;
  total: number;
  complete: boolean;
  href: string;
};

function filled(v: string | undefined | null): boolean {
  return Boolean(v && String(v).trim());
}

export function profileSections(profile: ImgProfile): SectionCompleteness[] {
  const personal = [profile.displayName, profile.countryOfResidence, profile.timezone, profile.preferredLanguage];
  const education = [
    profile.medicalSchoolCountry,
    profile.medicalSchoolId || profile.medicalSchoolOther,
    profile.graduationYear,
    profile.medicalDegree,
    profile.internshipStatus,
    profile.graduationStatus,
  ];
  const training = [profile.postgraduateTraining, profile.independentPractice];
  const canada = [profile.canadaStatus];
  const career = [profile.careerGoal];
  const preferences = [
    profile.targetMatchCycleId,
    profile.relocateAnywhere,
    (profile.specialtyInterestIds?.length ?? 0) > 0 ? "yes" : "",
  ];
  const credentials = [profile.physiciansapplyStatus, profile.credentialVerificationStatus];
  const exams = [profile.mccqeStatus, profile.nacExamStatus];
  const language = [profile.languageEvidenceStatus];

  const pack = (
    id: ProfileSectionId,
    label: string,
    values: (string | undefined)[],
    href: string,
  ): SectionCompleteness => {
    const total = values.length;
    const n = values.filter((v) => filled(v)).length;
    return { id, label, filled: n, total, complete: n === total && total > 0, href };
  };

  return [
    pack("personal", "Personal", personal, "/profile#personal"),
    pack("education", "Medical education", education, "/profile#education"),
    pack("training", "Training / experience", training, "/profile#training"),
    pack("canada", "Canada status", canada, "/profile#canada"),
    pack("career", "Career goal", career, "/profile#career"),
    pack("preferences", "Provinces / specialties", preferences, "/profile#preferences"),
    pack("credentials", "Credentials", credentials, "/credentials"),
    pack("exams", "Exams", exams, "/profile#exams"),
    pack("language", "Language", language, "/language"),
  ];
}

export function overallCompleteness(profile: ImgProfile): { filled: number; total: number; label: string } {
  const sections = profileSections(profile);
  const filledN = sections.filter((s) => s.complete).length;
  const total = sections.length;
  return {
    filled: filledN,
    total,
    label: `${filledN} of ${total} sections complete`,
  };
}
