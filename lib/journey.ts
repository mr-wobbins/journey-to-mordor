export type Milestone = {
  id: string;
  name: string;
  cumulativeMiles: number;
  description: string;
};

/** Hobbiton → Mount Doom, ~1,779 miles (Nerd Fitness / LOTR Project style). */
export const MILESTONES: Milestone[] = [
  {
    id: "hobbiton",
    name: "Hobbiton",
    cumulativeMiles: 0,
    description: "The journey begins at Bag End.",
  },
  {
    id: "bree",
    name: "Bree",
    cumulativeMiles: 120,
    description: "Meet Strider at the Prancing Pony.",
  },
  {
    id: "weathertop",
    name: "Weathertop",
    cumulativeMiles: 210,
    description: "A lonely hill and a close call with the Black Riders.",
  },
  {
    id: "rivendell",
    name: "Rivendell",
    cumulativeMiles: 458,
    description: "The Last Homely House; the Fellowship is formed.",
  },
  {
    id: "hollin",
    name: "Hollin",
    cumulativeMiles: 580,
    description: "Redhorn Gate and the snows of Caradhras.",
  },
  {
    id: "moria",
    name: "Moria",
    cumulativeMiles: 720,
    description: "Through the dark of Khazad-dûm.",
  },
  {
    id: "lothlorien",
    name: "Lothlórien",
    cumulativeMiles: 920,
    description: "Rest among the mallorn trees of the Golden Wood.",
  },
  {
    id: "rauros",
    name: "Falls of Rauros",
    cumulativeMiles: 1309,
    description: "The Fellowship breaks; Frodo and Sam press on alone.",
  },
  {
    id: "emyn-muil",
    name: "Emyn Muil",
    cumulativeMiles: 1400,
    description: "Labyrinthine hills and an unlikely guide.",
  },
  {
    id: "dead-marshes",
    name: "The Dead Marshes",
    cumulativeMiles: 1480,
    description: "Do not follow the lights.",
  },
  {
    id: "black-gate",
    name: "The Black Gate",
    cumulativeMiles: 1550,
    description: "No entrance here — a harder road awaits.",
  },
  {
    id: "ithilien",
    name: "Ithilien",
    cumulativeMiles: 1600,
    description: "Gardens of Gondor and a chance meeting with Faramir.",
  },
  {
    id: "cirith-ungol",
    name: "Cirith Ungol",
    cumulativeMiles: 1680,
    description: "The pass of the spider; into Mordor.",
  },
  {
    id: "mount-doom",
    name: "Mount Doom",
    cumulativeMiles: 1779,
    description: "The Crack of Doom. The Ring is destroyed.",
  },
];

export const TOTAL_JOURNEY_MILES = 1779;

export type JourneyProgress = {
  totalMiles: number;
  percentComplete: number;
  currentMilestone: Milestone;
  nextMilestone: Milestone | null;
  milesToNext: number;
  milesRemaining: number;
  arrivedMilestones: Milestone[];
  ringDestroyed: boolean;
};

export function getJourneyProgress(totalMiles: number): JourneyProgress {
  const miles = Math.max(0, totalMiles);
  const ringDestroyed = miles >= TOTAL_JOURNEY_MILES;
  const percentComplete = Math.min(100, (miles / TOTAL_JOURNEY_MILES) * 100);

  let currentMilestone = MILESTONES[0];
  for (const milestone of MILESTONES) {
    if (miles >= milestone.cumulativeMiles) {
      currentMilestone = milestone;
    }
  }

  const currentIndex = MILESTONES.findIndex((m) => m.id === currentMilestone.id);
  const nextMilestone =
    currentIndex < MILESTONES.length - 1 ? MILESTONES[currentIndex + 1] : null;

  const milesToNext = nextMilestone
    ? Math.max(0, nextMilestone.cumulativeMiles - miles)
    : 0;

  const arrivedMilestones = MILESTONES.filter(
    (m) => miles >= m.cumulativeMiles && m.cumulativeMiles > 0
  );

  return {
    totalMiles: miles,
    percentComplete,
    currentMilestone,
    nextMilestone,
    milesToNext,
    milesRemaining: Math.max(0, TOTAL_JOURNEY_MILES - miles),
    arrivedMilestones,
    ringDestroyed,
  };
}

export function formatMiles(miles: number, digits = 1): string {
  return miles.toFixed(digits);
}
