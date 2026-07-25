export type SolutionPillar = {
  title: string;
  summary: string;
  capabilities: readonly string[];
};

export type SolutionCapability = {
  id: string;
  title: string;
  outcome: string;
  description: string;
  customerValue: string;
  deliverables: readonly string[];
  interest: InterestedSolutionInterest;
};

export type SolutionLifecycleStep = {
  title: string;
  description: string;
};

export type SolutionSector = {
  title: string;
  description: string;
};

export type InterestedSolutionInterest =
  | "site_assessment"
  | "installation"
  | "monitoring_maintenance"
  | "cabling_mounting"
  | "ev_charging";

export const SOLUTION_PILLARS = [
  {
    title: "Solar Energy Systems",
    summary:
      "Quality-led solar, inverter and battery configurations designed around actual operating requirements.",
    capabilities: [
      "Solar generation",
      "Inverters and battery storage",
      "Cabling and protection",
      "Commercial and residential configurations",
    ],
  },
  {
    title: "Project Delivery",
    summary:
      "Assessment, specification, supply, installation and commissioning managed through one clear process.",
    capabilities: [
      "Site assessment",
      "System planning",
      "Mounting structures",
      "Installation and handover",
    ],
  },
  {
    title: "Monitoring & System Care",
    summary:
      "System visibility, diagnosis and ongoing technical support intended to support long-term performance.",
    capabilities: [
      "Monitoring",
      "Diagnostic review",
      "Maintenance",
      "Warranty coordination where applicable",
    ],
  },
  {
    title: "EV Charging & Solar Carports",
    summary:
      "Solar-integrated charging infrastructure for commercial properties, estates, fleets and modern homes.",
    capabilities: ["EV charging", "Load management", "Solar carports", "Future expansion planning"],
  },
] as const satisfies readonly SolutionPillar[];

export const SOLUTION_CAPABILITIES = [
  {
    id: "site-assessment",
    title: "Professional Site Assessment",
    outcome: "A clearer basis for system planning.",
    description:
      "We review energy use, available installation space, shading, roof or ground-mount conditions, cable routes, equipment locations and future requirements. Where specialist structural verification is required, this is identified during assessment.",
    customerValue:
      "The assessment turns site conditions and operating needs into practical inputs for specification and quotation.",
    deliverables: [
      "Energy-use and load review",
      "Installation-space and shading observations",
      "Cable-route and equipment-location review",
      "Future-requirement considerations",
    ],
    interest: "site_assessment",
  },
  {
    id: "turnkey-installation",
    title: "Sales & Turnkey Installation",
    outcome: "One coordinated route from selected equipment to handover.",
    description:
      "GreenNet can coordinate equipment supply, installation, connection checks and commissioning around an agreed system specification.",
    customerValue:
      "A single delivery sequence makes responsibilities, dependencies and the route to handover easier to understand.",
    deliverables: [
      "Equipment selection against the specification",
      "Supply and installation coordination",
      "Connection and commissioning checks",
      "System handover",
    ],
    interest: "installation",
  },
  {
    id: "monitoring-diagnosis",
    title: "Monitoring: Diagnosis & Reporting",
    outcome: "Useful system information when performance needs attention.",
    description:
      "Available monitoring information can be reviewed to identify patterns, investigate reported issues and support technical decisions.",
    customerValue:
      "Diagnosis is grounded in the information available from the installed system rather than assumption alone.",
    deliverables: [
      "Available monitoring-data review",
      "Issue and operating-pattern investigation",
      "Diagnostic observations",
      "Recommended next actions where appropriate",
    ],
    interest: "monitoring_maintenance",
  },
  {
    id: "cabling",
    title: "High-Grade Cabling Solutions",
    outcome: "A considered electrical path between system components.",
    description:
      "Cable routes, conductor requirements, protection and connection points are considered as part of the wider system configuration.",
    customerValue:
      "Cabling and protection are treated as core system elements, not finishing details.",
    deliverables: [
      "Cable-route planning",
      "Cable and connection requirements",
      "Protection-device considerations",
      "Installation coordination",
    ],
    interest: "cabling_mounting",
  },
  {
    id: "mounting",
    title: "Solar Mount & Structural Support",
    outcome: "A mounting approach aligned with the available installation area.",
    description:
      "GreenNet reviews the proposed panel location and mounting conditions to plan an appropriate support approach. Where specialist structural verification is required, it is identified for separate review.",
    customerValue:
      "Mounting decisions are connected to site conditions, access, panel layout and future serviceability.",
    deliverables: [
      "Mounting-condition review",
      "Panel-layout considerations",
      "Support and access planning",
      "Specialist-verification needs identified where applicable",
    ],
    interest: "cabling_mounting",
  },
  {
    id: "ev-integration",
    title: "Car Charging Stations / EV Integration",
    outcome: "Charging infrastructure planned as part of the property energy system.",
    description:
      "Charging requirements, available electrical capacity, load management and potential solar integration are considered together.",
    customerValue:
      "The charging plan can account for present use while leaving room for considered future expansion.",
    deliverables: [
      "Charging-requirement review",
      "Connection and load considerations",
      "Solar-integration options",
      "Expansion-path planning",
    ],
    interest: "ev_charging",
  },
  {
    id: "maintenance",
    title: "Maintenance & Technical Support",
    outcome: "A practical route for inspection, diagnosis and system care.",
    description:
      "Support can include inspection, diagnostic review, maintenance work and coordination around applicable manufacturer or supplier processes.",
    customerValue:
      "System-care decisions are based on the equipment, issue and available documentation for the installation.",
    deliverables: [
      "System inspection",
      "Fault and performance diagnosis",
      "Maintenance recommendations",
      "Warranty coordination where applicable",
    ],
    interest: "monitoring_maintenance",
  },
] as const satisfies readonly SolutionCapability[];

export const SOLUTION_LIFECYCLE = [
  {
    title: "Discover",
    description: "Define the property, operating need and reason for the project.",
  },
  {
    title: "Assess",
    description:
      "Review energy use, space, routes, equipment locations and relevant site conditions.",
  },
  {
    title: "Specify",
    description: "Translate the assessment into a suitable system and delivery scope.",
  },
  {
    title: "Quote",
    description: "Present the proposed equipment, work and commercial basis for review.",
  },
  {
    title: "Install",
    description: "Coordinate supply, installation, checks, commissioning and handover.",
  },
  {
    title: "Support",
    description: "Provide a route for system care, diagnosis and applicable follow-up.",
  },
] as const satisfies readonly SolutionLifecycleStep[];

export const SOLUTION_SECTORS = [
  {
    title: "Industrial and production sites",
    description:
      "For operating environments where energy use, continuity needs and expansion plans matter.",
  },
  {
    title: "Hotels and hospitality",
    description:
      "For guest-facing properties balancing daily operations with varied electrical loads.",
  },
  {
    title: "Offices and commercial property",
    description: "For workplaces, managed buildings and commercial energy infrastructure.",
  },
  {
    title: "Developers and estates",
    description: "For shared infrastructure, phased properties and coordinated energy planning.",
  },
  {
    title: "Premium homes",
    description: "For selected homes requiring a considered system around household priorities.",
  },
] as const satisfies readonly SolutionSector[];
