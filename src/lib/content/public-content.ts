export type EditorialItem = {
  title: string;
  description: string;
  details: readonly string[];
};

export const ABOUT_PRINCIPLES = [
  {
    title: "Quality",
    description:
      "Quality-led systems selected for compatibility, suitability, and the support available for the approved equipment.",
  },
  {
    title: "Performance",
    description:
      "System planning begins with operating requirements, site conditions, and the role each component needs to perform.",
  },
  {
    title: "Visibility",
    description:
      "Available monitoring and diagnostic information can support clearer operating and maintenance decisions.",
  },
  {
    title: "Support",
    description:
      "System-care options are defined around the installed equipment, the reported issue, and applicable supplier terms.",
  },
  {
    title: "Progress",
    description:
      "Assessment can account for future requirements so present decisions leave room for considered expansion.",
  },
] as const;

export const PRODUCT_CATEGORIES = [
  {
    title: "Solar generation",
    description:
      "Solar modules and related equipment considered against the available installation area and intended energy requirement.",
    details: ["Module selection", "Array configuration", "Site and mounting considerations"],
  },
  {
    title: "Inverters and energy control",
    description:
      "Conversion and control equipment selected as part of a compatible system, not as an isolated component.",
    details: ["System conversion", "Load considerations", "Monitoring compatibility"],
  },
  {
    title: "Battery storage",
    description:
      "Storage options assessed around required reserve, operating priorities, and compatibility with the wider system.",
    details: ["Reserve requirements", "Battery and inverter compatibility", "Expansion planning"],
  },
  {
    title: "Cabling, protection, and mounting",
    description:
      "The electrical and structural balance of the system considered alongside the principal equipment.",
    details: ["Cable routes", "Protection requirements", "Mounting and service access"],
  },
  {
    title: "EV charging and solar carports",
    description:
      "Charging and carport equipment planned around connection capacity, load management, and possible solar integration.",
    details: ["Charging requirements", "Load management", "Solar and future integration"],
  },
] as const satisfies readonly EditorialItem[];
