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
  listenIdle: {
    path: "about/polar-bear-listen-idle-loop.fbx",
    loop: true,
    playbackRate: 0.78,
  },
  presentRight: {
    path: "capabilities/polar-bear-present-right.fbx",
    desiredDuration: 1.8,
  },
  proudIdle: {
    path: "career/polar-bear-proud-idle-loop.fbx",
    loop: true,
    playbackRate: 0.8,
  },
  typeLoop: {
    path: "work/polar-bear-type-loop.fbx",
    loop: true,
    playbackRate: 0.82,
  },
  useToolLoop: {
    path: "toolkit/polar-bear-use-tool-loop.fbx",
    loop: true,
    playbackRate: 0.84,
  },
  contactIdle: {
    path: "contact/polar-bear-contact-idle-loop.fbx",
    loop: true,
    playbackRate: 0.82,
  },
  thankYouWave: {
    path: "footer/polar-bear-thank-you-wave.fbx",
    desiredDuration: 1.8,
  },
} as const satisfies Record<string, ClipAsset>;

export type ClipKey = keyof typeof CHARACTER_CLIPS;

export interface SectionScene {
  clip: ClipKey;
  fallback: ClipKey;
}

export const SECTION_SCENES: Record<CharacterSection, SectionScene> = {
  home: { clip: "idleStanding", fallback: "idleStanding" },
  about: { clip: "listenIdle", fallback: "idleStanding" },
  capabilities: { clip: "presentRight", fallback: "idleStanding" },
  career: { clip: "proudIdle", fallback: "idleStanding" },
  work: { clip: "typeLoop", fallback: "idleStanding" },
  toolkit: { clip: "useToolLoop", fallback: "idleStanding" },
  contact: { clip: "contactIdle", fallback: "idleStanding" },
  footer: { clip: "thankYouWave", fallback: "idleStanding" },
};

export const CORE_CLIPS: ClipKey[] = ["idleStanding", "runLoop"];

export const clipsForSection = (section: CharacterSection): ClipKey[] => {
  const scene = SECTION_SCENES[section];
  return [...new Set([scene.clip, scene.fallback])];
};

export const toCharacterSection = (section: string): CharacterSection =>
  section in SECTION_SCENES ? section as CharacterSection : "home";
