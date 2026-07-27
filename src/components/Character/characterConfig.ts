export type CharacterSection =
  | "home"
  | "about"
  | "capabilities"
  | "career"
  | "work"
  | "toolkit"
  | "contact"
  | "footer";

export interface ClipAsset {
  path: string;
  loop?: boolean;
  playbackRate?: number;
  desiredDuration?: number;
  neutralizeHorizontalRootMotion?: boolean;
}

export const BASE_MODEL_PATH = "shared/polar-bear-base.fbx";

export const CHARACTER_CLIPS = {
  idleStanding: {
    path: "shared/polar-bear-idle-standing-loop.fbx",
    loop: true,
    playbackRate: 0.82,
  },
  runLoop: {
    path: "shared/polar-bear-run-loop.fbx",
    loop: true,
    playbackRate: 0.9,
    neutralizeHorizontalRootMotion: true,
  },
  aboutDetective: {
    path: "about/polar-bear-about-detective-loop.fbx",
    loop: true,
    playbackRate: 0.9,
  },
  capabilitiesPowerShowcase: {
    path: "capabilities/polar-bear-capabilities-power-showcase-loop.fbx",
    loop: true,
    playbackRate: 0.92,
  },
  careerVictory: {
    path: "career/polar-bear-career-victory-loop.fbx",
    loop: true,
    playbackRate: 0.9,
  },
  typeLoop: {
    path: "work/polar-bear-type-loop.fbx",
    loop: true,
    playbackRate: 0.82,
  },
  toolkitTechMagician: {
    path: "toolkit/polar-bear-toolkit-tech-magician-loop.fbx",
    loop: true,
    playbackRate: 0.85,
  },
  contactBigInvitation: {
    path: "contact/polar-bear-contact-big-invitation-loop.fbx",
    loop: true,
    playbackRate: 0.9,
  },
  thankYouWave: {
    path: "footer/polar-bear-thank-you-wave.fbx",
    loop: true,
    playbackRate: 0.85,
  },
} as const satisfies Record<string, ClipAsset>;

export type ClipKey = keyof typeof CHARACTER_CLIPS;

export interface SectionScene {
  clip: ClipKey;
  fallback: ClipKey;
}

export const SECTION_SCENES: Record<CharacterSection, SectionScene> = {
  home: { clip: "idleStanding", fallback: "idleStanding" },
  about: { clip: "aboutDetective", fallback: "idleStanding" },
  capabilities: { clip: "capabilitiesPowerShowcase", fallback: "idleStanding" },
  career: { clip: "careerVictory", fallback: "idleStanding" },
  work: { clip: "typeLoop", fallback: "idleStanding" },
  toolkit: { clip: "toolkitTechMagician", fallback: "idleStanding" },
  contact: { clip: "contactBigInvitation", fallback: "idleStanding" },
  footer: { clip: "thankYouWave", fallback: "thankYouWave" },
};

export const CORE_CLIPS: ClipKey[] = ["idleStanding", "runLoop"];

export const clipsForSection = (section: CharacterSection): ClipKey[] => {
  const scene = SECTION_SCENES[section];
  return [...new Set([scene.clip, scene.fallback])];
};

export const toCharacterSection = (section: string): CharacterSection =>
  section in SECTION_SCENES ? section as CharacterSection : "home";
