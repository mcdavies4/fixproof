export type Profile = {
  id: string;
  full_name: string | null;
  property_address: string | null;
  landlord_name: string | null;
  landlord_email: string | null;
  landlord_address: string | null;
  tenancy_start: string | null;
};

export type Issue = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  severity: string;
  location_in_home: string | null;
  first_noticed: string | null;
  tenant_notes: string | null;
  ai_observations: string | null;
  ai_likely_cause: string | null;
  ai_hazards: string[];
  ai_safety_tips: string[];
  legal_refs: string[];
  photo_paths: string[];
  status: "draft" | "reported" | "in_progress" | "resolved" | "escalated";
  response_days: number;
  landlord_notified_at: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type IssueEvent = {
  id: string;
  issue_id: string;
  kind:
    | "created"
    | "photo_added"
    | "letter_sent"
    | "chase_sent"
    | "landlord_response"
    | "note"
    | "escalated"
    | "resolved";
  note: string | null;
  photo_paths: string[];
  created_at: string;
};

export type Diagnosis = {
  is_repair_issue: boolean;
  title: string;
  category: string;
  severity: string;
  location_in_home: string;
  observations: string;
  likely_cause: string;
  hazards: string[];
  safety_tips: string[];
};
