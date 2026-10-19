// Vetted legal references for private renters in ENGLAND.
// The AI never writes law. It only picks a category; the references below are attached
// deterministically from that category. Review this file with a housing solicitor before launch.

export type LegalRef = {
  key: string;
  name: string;
  letterText: string; // sentence used inside the repair letter
  plain: string; // plain-English explanation shown in the app
};

export const LEGAL_REFS: Record<string, LegalRef> = {
  s11: {
    key: "s11",
    name: "Landlord and Tenant Act 1985, section 11",
    letterText:
      "Under section 11 of the Landlord and Tenant Act 1985 you are responsible for keeping in repair the structure and exterior of the property, and for keeping in repair and proper working order the installations for the supply of water, gas, electricity, sanitation, space heating and heating water.",
    plain:
      "Your landlord must fix the structure, exterior, plumbing, heating, hot water, gas and electrics once you've told them about a problem, within a reasonable time.",
  },
  fitness: {
    key: "fitness",
    name: "Homes (Fitness for Human Habitation) Act 2018",
    letterText:
      "Under section 9A of the Landlord and Tenant Act 1985, as inserted by the Homes (Fitness for Human Habitation) Act 2018, the property must be fit for human habitation at the start of the tenancy and throughout it.",
    plain:
      "Your home must be fit to live in for the whole tenancy. Serious damp, mould, cold or other hazards can make it unfit, and you can take your landlord to court over it.",
  },
  hhsrs: {
    key: "hhsrs",
    name: "Housing Act 2004 (Housing Health and Safety Rating System)",
    letterText:
      "This issue may also amount to a hazard under the Housing Health and Safety Rating System (Housing Act 2004), which the local authority has powers to inspect and enforce.",
    plain:
      "Your council's environmental health team can inspect your home for hazards like damp, cold, fire and electrical risks, and can order your landlord to fix them.",
  },
  gas: {
    key: "gas",
    name: "Gas Safety (Installation and Use) Regulations 1998",
    letterText:
      "Under the Gas Safety (Installation and Use) Regulations 1998 you must ensure gas appliances and fittings are maintained in a safe condition and checked annually by a Gas Safe registered engineer, with a copy of the record given to me.",
    plain:
      "Gas appliances must be kept safe and checked every year by a Gas Safe engineer. You're entitled to a copy of the safety record.",
  },
  electrical: {
    key: "electrical",
    name: "Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020",
    letterText:
      "Under the Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020 the electrical installation must meet national safety standards, be inspected and tested at least every five years, and any remedial work identified must be carried out.",
    plain:
      "The electrics must be inspected at least every five years and kept to safety standards. You're entitled to a copy of the report (EICR).",
  },
  alarms: {
    key: "alarms",
    name: "Smoke and Carbon Monoxide Alarm (Amendment) Regulations 2022",
    letterText:
      "Under the Smoke and Carbon Monoxide Alarm (England) Regulations 2015, as amended in 2022, there must be a working smoke alarm on each storey used as living accommodation and a carbon monoxide alarm in any room with a fixed combustion appliance (other than a gas cooker), and faulty alarms must be repaired or replaced once you are informed.",
    plain:
      "You must have a working smoke alarm on every floor, and a CO alarm in any room with a boiler, fire or similar. Your landlord must fix faulty alarms once told.",
  },
  rra: {
    key: "rra",
    name: "Renters' Rights Act 2025",
    letterText: "",
    plain:
      "Since 1 May 2026, section 21 'no-fault' evictions are abolished in England. A landlord now needs a legal ground to evict, so reporting a repair can't simply be met with a no-fault notice.",
  },
};

export const CATEGORIES = {
  damp_mould: { label: "Damp & mould", refs: ["fitness", "s11", "hhsrs"] },
  heating_hot_water: { label: "Heating & hot water", refs: ["s11", "fitness", "hhsrs"] },
  water_leak: { label: "Leak or water damage", refs: ["s11", "fitness"] },
  electrical: { label: "Electrics", refs: ["electrical", "s11", "hhsrs"] },
  gas: { label: "Gas", refs: ["gas", "s11", "hhsrs"] },
  fire_safety: { label: "Fire safety & alarms", refs: ["alarms", "fitness", "hhsrs"] },
  structural: { label: "Structure, roof & walls", refs: ["s11", "fitness"] },
  pests: { label: "Pests", refs: ["fitness", "hhsrs"] },
  windows_doors: { label: "Windows, doors & security", refs: ["s11", "fitness"] },
  sanitation: { label: "Toilet, sink & drains", refs: ["s11", "fitness"] },
  other: { label: "Other", refs: ["fitness"] },
} as const;

export type Category = keyof typeof CATEGORIES;
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

export const SEVERITY = {
  emergency: { label: "Emergency", days: 1, tone: "bg-red-600 text-white" },
  urgent: { label: "Urgent", days: 7, tone: "bg-orange-500 text-white" },
  routine: { label: "Routine", days: 14, tone: "bg-amber-200 text-amber-950" },
  cosmetic: { label: "Cosmetic", days: 28, tone: "bg-stone-200 text-stone-800" },
} as const;

export type Severity = keyof typeof SEVERITY;
export const SEVERITY_KEYS = Object.keys(SEVERITY) as Severity[];

export function refsFor(category: string): LegalRef[] {
  const cat = CATEGORIES[category as Category] ?? CATEGORIES.other;
  return cat.refs.map((k) => LEGAL_REFS[k]);
}

export const EMERGENCY_NUMBERS = [
  { when: "You smell gas", who: "National Gas emergency line", number: "0800 111 999" },
  { when: "Fire, or someone is in danger", who: "Emergency services", number: "999" },
  { when: "Power cut or exposed live wiring outside", who: "Power cut line", number: "105" },
];
