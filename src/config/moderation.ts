/**
 * Report reasons shared by the report UI and the server-side validator, so the
 * two never drift. `value` must match the check constraint in migration 0010.
 */
export type ReportReason =
  | "spam"
  | "harassment"
  | "hate"
  | "violence"
  | "sexual"
  | "self_harm"
  | "misinformation"
  | "impersonation"
  | "misattribution"
  | "off_topic"
  | "other";

export type ReportTargetType = "post" | "comment" | "profile" | "clip";

export interface ReportReasonOption {
  value: ReportReason;
  label: string;
  hint: string;
}

export const REPORT_REASONS: ReportReasonOption[] = [
  { value: "spam", label: "Spam or scam", hint: "Repetitive, misleading, or commercial spam." },
  { value: "harassment", label: "Harassment or bullying", hint: "Targeted abuse or threats toward a person." },
  { value: "hate", label: "Hate speech", hint: "Attacks based on identity or protected traits." },
  { value: "violence", label: "Violence or dangerous acts", hint: "Threats or glorification of violence." },
  { value: "sexual", label: "Sexual or adult content", hint: "Nudity or sexual content." },
  { value: "self_harm", label: "Self-harm", hint: "Content about self-harm or suicide." },
  { value: "misinformation", label: "Misinformation", hint: "False or misleading claims presented as fact." },
  {
    value: "impersonation",
    label: "Impersonation",
    hint: "Pretending to be another player, team, or person.",
  },
  {
    value: "misattribution",
    label: "Misattributed clip",
    hint: "A clip credited to the wrong creator or account.",
  },
  { value: "off_topic", label: "Not about Strikers Club", hint: "Unrelated to the game or community." },
  { value: "other", label: "Something else", hint: "Tell us what's wrong below." },
];

export const REPORT_REASON_VALUES = REPORT_REASONS.map((r) => r.value);
export const MAX_REPORT_DETAILS = 1000;
