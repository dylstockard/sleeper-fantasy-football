"use client";

import React from "react";

export type MascotType =
  | "taco"
  | "sharky-dududu"
  | "trash"
  | "panpan"
  | "mr-hollywood"
  | "frog-fu"
  | "ref"
  | "fish"
  | "goldfish"
  | "titan-up"
  | "trex";

export type MascotEmotion =
  | "idle"
  | "idle_happy"
  | "victory"
  | "dancing"
  | "action_joy"
  | "action_joy02"
  | "taunting"
  | "sad"
  | "trailing";

interface MascotProps {
  type: string;
  emotion?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showBubble?: boolean;
  bubbleText?: string;
  flip?: boolean;
  className?: string;
}

const mascotQuotes: Record<string, Record<string, string>> = {
  taco: {
    victory: "Spicy W! 🌮🔥",
    dancing: "Taco fiesta! 💃",
    taunting: "Taco 'bout a mismatch!",
    sad: "Shell is cracking... 😢",
    idle: "Crunch time! 🌮",
  },
  "sharky-dududu": {
    victory: "CHOMP CHOMP! 🦈🏆",
    dancing: "Doo doo doo doo! 🎵",
    taunting: "Blood in the water!",
    sad: "Beached... 🌊",
    idle: "Circling the prey 🦈",
  },
  trash: {
    victory: "Trash into treasure! 🗑️👑",
    dancing: "Lid poppin'! 💥",
    taunting: "Time to take out the trash!",
    sad: "Down in the dumps... 🗑️",
    idle: "Oscar mode: ON",
  },
  panpan: {
    victory: "Bamboo power! 🐼🎋",
    dancing: "Panda party! 🥳",
    taunting: "Panda-monium incoming!",
    sad: "Need a nap... 💤",
    idle: "Chillin' & winnin'",
  },
  "mr-hollywood": {
    victory: "Oscar-worthy performance! 🎬🌟",
    dancing: "Red carpet ready! 🕺",
    taunting: "That's a wrap for you!",
    sad: "Direct to DVD... 📉",
    idle: "Ready for my closeup 🕶️",
  },
  "frog-fu": {
    victory: "HI-YAH! Victory kick! 🐸🥋",
    dancing: "Karate celebration! 🥋",
    taunting: "You can't dodge this leap!",
    sad: "Croaked... 🪦",
    idle: "Focus your chi 🧘",
  },
  ref: {
    victory: "Touchdown confirmed! 🏁🙌",
    dancing: "TOOT! Whistle blow! 🎵",
    taunting: "Unsportsmanlike blowout! 🟨",
    sad: "Flag on the play... 🏳️",
    idle: "Under review 🧐",
  },
  fish: {
    victory: "Making waves! 🐟🌊",
    dancing: "Just keep swimming! 🎵",
    taunting: "You're small fry! 🐡",
    sad: "Out of water... 🫧",
    idle: "Blub blub... 🐠",
  },
  goldfish: {
    victory: "Making waves! 🐟🌊",
    dancing: "Just keep swimming! 🎵",
    taunting: "You're small fry! 🐡",
    sad: "Out of water... 🫧",
    idle: "Blub blub... 🐠",
  },
  "titan-up": {
    victory: "TITAN UP! ⚔️⚡",
    dancing: "Victory march! 🎺",
    taunting: "Tremble before the Titans!",
    sad: "Fallen titan... 🛡️",
    idle: "Prepared for war ⚔️",
  },
  trex: {
    victory: "ROAAAAR! 🦖💥",
    dancing: "Dino dance! 🦕",
    taunting: "Extinction event incoming!",
    sad: "Arms too short to catch up... 🥺",
    idle: "Apex predator 🦖",
  },
};

export function Mascot({
  type,
  emotion = "idle",
  size = "md",
  showBubble = false,
  bubbleText,
  flip = false,
  className = "",
}: MascotProps) {
  // Normalize mascot type
  const checkType = type === "goldfish" ? "fish" : type;
  const normalizedType: MascotType = [
    "taco",
    "sharky-dududu",
    "trash",
    "panpan",
    "mr-hollywood",
    "frog-fu",
    "ref",
    "fish",
    "titan-up",
    "trex",
  ].includes(checkType)
    ? (checkType as MascotType)
    : "taco";

  // Normalize emotion
  const isVictory = ["victory", "dancing", "action_joy", "action_joy02"].includes(emotion);
  const isTaunting = emotion === "taunting";
  const isSad = ["sad", "trailing"].includes(emotion);

  const animationClass = isVictory
    ? "animate-mascot-dance"
    : isTaunting
    ? "animate-mascot-taunt"
    : isSad
    ? "animate-mascot-sad"
    : "animate-mascot-idle";

  const sizeDimensions = {
    sm: "w-8 h-8",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  }[size];

  // Resolve quote
  const quoteCategory = isVictory
    ? "victory"
    : isTaunting
    ? "taunting"
    : isSad
    ? "sad"
    : "idle";

  const resolvedBubble =
    bubbleText || mascotQuotes[normalizedType]?.[quoteCategory] || "Let's go!";

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
    >
      {/* Speech Bubble */}
      {showBubble && size !== "sm" && (
        <div
          className={`absolute -top-10 z-20 px-2.5 py-1 bg-slate-900/95 text-slate-100 border border-teal-500/40 rounded-xl text-[11px] font-bold shadow-lg whitespace-nowrap pointer-events-none transition-all ${
            isVictory
              ? "border-amber-400/60 text-amber-300 shadow-amber-500/10"
              : isSad
              ? "border-red-400/40 text-red-300"
              : isTaunting
              ? "border-purple-400/50 text-purple-300"
              : "text-teal-300"
          }`}
        >
          {resolvedBubble}
          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-teal-500/40 rotate-45" />
        </div>
      )}

      {/* Mascot Graphic */}
      <div
        className={`relative ${sizeDimensions} ${animationClass} ${
          flip ? "-scale-x-100" : ""
        } transition-transform duration-300`}
      >
        {/* Victory Floating Stars */}
        {isVictory && (
          <div className="absolute -top-2 -right-1 text-xs animate-bounce pointer-events-none">
            ⭐
          </div>
        )}

        {/* Sad Sweat Drop */}
        {isSad && (
          <div className="absolute -top-1 -right-1 w-2 h-3.5 bg-cyan-400 rounded-full animate-sweat pointer-events-none opacity-90 shadow-sm" />
        )}

        {/* SVG Mascot Renderers */}
        {normalizedType === "taco" && <TacoSvg emotion={emotion} />}
        {normalizedType === "sharky-dududu" && <SharkySvg emotion={emotion} />}
        {normalizedType === "trash" && <TrashSvg emotion={emotion} />}
        {normalizedType === "panpan" && <PanpanSvg emotion={emotion} />}
        {normalizedType === "mr-hollywood" && <MrHollywoodSvg emotion={emotion} />}
        {normalizedType === "frog-fu" && <FrogFuSvg emotion={emotion} />}
        {normalizedType === "ref" && <RefSpriteRenderer emotion={emotion} />}
        {normalizedType === "fish" && <FishSpriteRenderer emotion={emotion} />}
        {normalizedType === "titan-up" && <TitanUpSvg emotion={emotion} />}
        {normalizedType === "trex" && <TrexSvg emotion={emotion} />}
      </div>
    </div>
  );
}

/* =========================================================================
   INDIVIDUAL SVG MASCOT DESIGNS
   ========================================================================= */

function TacoSvg({ emotion }: { emotion: string }) {
  const isSad = ["sad", "trailing"].includes(emotion);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      {/* Tortilla Shell */}
      <path
        d="M 12 70 C 10 32, 90 32, 88 70 C 85 86, 15 86, 12 70 Z"
        fill="#f59e0b"
        stroke="#b45309"
        strokeWidth="3"
      />
      {/* Meat/Filling shadow */}
      <path d="M 22 62 C 35 48, 65 48, 78 62 Z" fill="#78350f" />
      {/* Lettuce frills */}
      <path
        d="M 18 58 Q 26 48 34 56 Q 42 46 50 56 Q 58 46 66 56 Q 74 48 82 58 Z"
        fill="#22c55e"
      />
      {/* Tomato cubes */}
      <rect x="28" y="46" width="9" height="7" rx="2" fill="#ef4444" />
      <rect x="47" y="44" width="8" height="7" rx="2" fill="#ef4444" />
      <rect x="65" y="47" width="8" height="7" rx="2" fill="#ef4444" />
      {/* Cheddar cheese shreds */}
      <path d="M 38 48 L 44 54" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
      <path d="M 57 47 L 62 53" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />

      {/* Sunglasses (Classic Sleeper Taco) */}
      <path
        d="M 26 62 Q 38 62 46 64 L 46 72 Q 38 75 26 72 Z"
        fill="#0f172a"
        stroke="#1e293b"
        strokeWidth="1.5"
      />
      <path
        d="M 54 64 Q 62 62 74 62 L 74 72 Q 62 75 54 72 Z"
        fill="#0f172a"
        stroke="#1e293b"
        strokeWidth="1.5"
      />
      <line x1="46" y1="64" x2="54" y2="64" stroke="#0f172a" strokeWidth="2.5" />
      {/* Sunglasses gloss reflection */}
      <line x1="28" y1="64" x2="36" y2="70" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="64" x2="64" y2="70" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Mouth */}
      {isSad ? (
        <path d="M 42 80 Q 50 75 58 80" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M 42 76 Q 50 84 58 76" stroke="#78350f" strokeWidth="2.5" fill="#ef4444" strokeLinecap="round" />
      )}
    </svg>
  );
}

function SharkySvg({ emotion }: { emotion: string }) {
  const isSad = ["sad", "trailing"].includes(emotion);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      {/* Shark Dorsal Fin */}
      <path d="M 42 22 Q 48 8 62 14 Q 56 26 48 30 Z" fill="#0284c7" />
      {/* Tail Fin */}
      <path d="M 12 36 C 8 26, 2 30, 6 48 C 2 64, 8 68, 14 58 Z" fill="#0284c7" />
      {/* Shark Main Body */}
      <ellipse cx="56" cy="52" rx="36" ry="26" fill="#0369a1" />
      {/* White Belly */}
      <path d="M 32 58 C 45 72, 70 72, 85 58 C 75 76, 40 76, 32 58 Z" fill="#f8fafc" />
      {/* Side Fin */}
      <path d="M 46 56 Q 36 72 48 74 Q 56 68 52 56 Z" fill="#0284c7" />
      {/* Eye */}
      <circle cx="76" cy="42" r="5" fill="#f8fafc" />
      <circle cx="78" cy="42" r="2.5" fill="#0f172a" />
      <path d="M 72 37 Q 78 35 84 38" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      {/* Gills */}
      <line x1="62" y1="46" x2="60" y2="54" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
      <line x1="57" y1="47" x2="55" y2="53" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
      {/* Sharp Teeth Grin */}
      {isSad ? (
        <path d="M 70 62 Q 78 56 86 62" stroke="#0f172a" strokeWidth="2" fill="none" />
      ) : (
        <g>
          <path d="M 68 56 Q 78 68 88 56 Z" fill="#0f172a" />
          <polygon points="70,56 73,61 76,56" fill="#ffffff" />
          <polygon points="76,56 79,61 82,56" fill="#ffffff" />
          <polygon points="82,56 85,61 88,56" fill="#ffffff" />
        </g>
      )}
    </svg>
  );
}

function TrashSvg({ emotion }: { emotion: string }) {
  const isSad = ["sad", "trailing"].includes(emotion);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      {/* Cute Green Monster inside */}
      <ellipse cx="50" cy="40" rx="22" ry="18" fill="#22c55e" />
      {/* Monster Eyes */}
      <circle cx="42" cy="36" r="6" fill="#f8fafc" />
      <circle cx="43" cy="36" r="3" fill="#0f172a" />
      <circle cx="58" cy="36" r="6" fill="#f8fafc" />
      <circle cx="57" cy="36" r="3" fill="#0f172a" />
      {/* Monster Mouth */}
      {isSad ? (
        <path d="M 45 46 Q 50 42 55 46" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M 44 43 Q 50 50 56 43" stroke="#0f172a" strokeWidth="2" fill="#ef4444" strokeLinecap="round" />
      )}

      {/* Floating Trash Lid */}
      <g transform="rotate(-15 50 25)">
        <ellipse cx="50" cy="22" rx="32" ry="7" fill="#64748b" stroke="#334155" strokeWidth="2" />
        <rect x="46" y="12" width="8" height="6" rx="2" fill="#475569" stroke="#334155" strokeWidth="1.5" />
      </g>

      {/* Trash Can Body */}
      <path
        d="M 22 46 L 28 88 Q 50 92 72 88 L 78 46 Q 50 42 22 46 Z"
        fill="#94a3b8"
        stroke="#475569"
        strokeWidth="2.5"
      />
      {/* Corrugated Vertical Ribs */}
      <line x1="36" y1="50" x2="38" y2="86" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="50" x2="50" y2="87" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="64" y1="50" x2="62" y2="86" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
      {/* Trash rim */}
      <ellipse cx="50" cy="46" rx="29" ry="5" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
    </svg>
  );
}

function PanpanSvg({ emotion }: { emotion: string }) {
  const isSad = ["sad", "trailing"].includes(emotion);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      {/* Ears */}
      <circle cx="28" cy="26" r="13" fill="#0f172a" />
      <circle cx="72" cy="26" r="13" fill="#0f172a" />
      <circle cx="28" cy="26" r="7" fill="#334155" />
      <circle cx="72" cy="26" r="7" fill="#334155" />
      {/* Head */}
      <ellipse cx="50" cy="54" rx="34" ry="30" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
      {/* Eye Patches */}
      <ellipse cx="36" cy="50" rx="10" ry="13" transform="rotate(-15 36 50)" fill="#0f172a" />
      <ellipse cx="64" cy="50" rx="10" ry="13" transform="rotate(15 64 50)" fill="#0f172a" />
      {/* Eyes */}
      <circle cx="37" cy="49" r="4" fill="#ffffff" />
      <circle cx="38" cy="49" r="2" fill="#0f172a" />
      <circle cx="63" cy="49" r="4" fill="#ffffff" />
      <circle cx="62" cy="49" r="2" fill="#0f172a" />
      {/* Blush */}
      <circle cx="26" cy="62" r="5" fill="#fca5a5" opacity="0.6" />
      <circle cx="74" cy="62" r="5" fill="#fca5a5" opacity="0.6" />
      {/* Nose */}
      <ellipse cx="50" cy="62" rx="4.5" ry="3" fill="#0f172a" />
      {/* Mouth */}
      {isSad ? (
        <path d="M 46 72 Q 50 67 54 72" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M 45 66 Q 50 74 55 66" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {/* Bamboo Stalk */}
      <path d="M 68 62 L 86 42" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="78" cy="48" rx="3" ry="6" transform="rotate(45 78 48)" fill="#22c55e" />
    </svg>
  );
}

function MrHollywoodSvg({ emotion }: { emotion: string }) {
  const isSad = ["sad", "trailing"].includes(emotion);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      {/* Slick Hair */}
      <path d="M 22 42 C 22 18, 78 18, 78 42 Z" fill="#1e1b4b" />
      {/* Face */}
      <ellipse cx="50" cy="52" rx="28" ry="26" fill="#fed7aa" />
      {/* Tuxedo Collar */}
      <path d="M 32 76 L 50 94 L 68 76 Z" fill="#ffffff" />
      <polygon points="50,82 42,78 50,74 58,78" fill="#ef4444" /> {/* Red Bowtie */}
      <path d="M 24 78 L 36 94 L 20 94 Z" fill="#090d16" />
      <path d="M 76 78 L 64 94 L 80 94 Z" fill="#090d16" />

      {/* Gold Star Glasses */}
      {/* Left Star */}
      <polygon
        points="36,36 39,43 46,44 41,49 42,56 36,52 30,56 31,49 26,44 33,43"
        fill="#f59e0b"
        stroke="#b45309"
        strokeWidth="1.5"
      />
      {/* Right Star */}
      <polygon
        points="64,36 67,43 74,44 69,49 70,56 64,52 58,56 59,49 54,44 61,43"
        fill="#f59e0b"
        stroke="#b45309"
        strokeWidth="1.5"
      />
      <line x1="44" y1="46" x2="56" y2="46" stroke="#f59e0b" strokeWidth="2.5" />

      {/* Smile with Gold Tooth */}
      {isSad ? (
        <path d="M 42 68 Q 50 63 58 68" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <g>
          <path d="M 40 65 Q 50 76 60 65 Z" fill="#ffffff" stroke="#78350f" strokeWidth="1.5" />
          <rect x="48" y="65" width="4" height="4" fill="#fbbf24" /> {/* Gold Tooth! */}
        </g>
      )}
    </svg>
  );
}

function FrogFuSvg({ emotion }: { emotion: string }) {
  const isSad = ["sad", "trailing"].includes(emotion);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      {/* Protruding Frog Eye Sockets */}
      <circle cx="32" cy="34" r="14" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
      <circle cx="68" cy="34" r="14" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
      {/* Eye Balls */}
      <circle cx="32" cy="34" r="9" fill="#fef08a" />
      <ellipse cx="32" cy="34" rx="3" ry="7" fill="#0f172a" />
      <circle cx="68" cy="34" r="9" fill="#fef08a" />
      <ellipse cx="68" cy="34" rx="3" ry="7" fill="#0f172a" />

      {/* Frog Head */}
      <ellipse cx="50" cy="56" rx="36" ry="26" fill="#4ade80" stroke="#15803d" strokeWidth="2.5" />

      {/* Red Karate Headband */}
      <rect x="18" y="44" width="64" height="8" rx="2" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
      {/* Headband Tails */}
      <path d="M 80 48 Q 94 44 96 56 Q 90 52 80 50 Z" fill="#ef4444" />
      <path d="M 80 50 Q 92 56 94 66 Q 88 58 80 52 Z" fill="#dc2626" />

      {/* Nostrils */}
      <circle cx="46" cy="58" r="1.5" fill="#15803d" />
      <circle cx="54" cy="58" r="1.5" fill="#15803d" />

      {/* Wide Mouth */}
      {isSad ? (
        <path d="M 34 72 Q 50 64 66 72" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M 32 68 Q 50 82 68 68" stroke="#15803d" strokeWidth="3" fill="#dc2626" strokeLinecap="round" />
      )}
    </svg>
  );
}

function RefSvg({ emotion }: { emotion: string }) {
  const isSad = ["sad", "trailing"].includes(emotion);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      {/* Referee Cap */}
      <path d="M 28 32 C 28 20, 72 20, 72 32 Z" fill="#0f172a" />
      <ellipse cx="50" cy="32" rx="26" ry="4" fill="#1e293b" />
      {/* Face */}
      <circle cx="50" cy="46" r="18" fill="#fde68a" />
      {/* Eyes */}
      <circle cx="44" cy="44" r="2.5" fill="#0f172a" />
      <circle cx="56" cy="44" r="2.5" fill="#0f172a" />
      {/* Mouth */}
      {isSad ? (
        <path d="M 45 56 Q 50 52 55 56" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <circle cx="50" cy="54" r="3" fill="#0f172a" />
      )}
      {/* Whistle */}
      <polygon points="50,54 58,56 50,58" fill="#94a3b8" />

      {/* Zebra Striped Jersey */}
      <path d="M 24 64 L 76 64 L 80 94 L 20 94 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
      {/* Black Stripes */}
      <rect x="30" y="64" width="7" height="30" fill="#0f172a" />
      <rect x="46" y="64" width="8" height="30" fill="#0f172a" />
      <rect x="63" y="64" width="7" height="30" fill="#0f172a" />

      {/* Yellow Penalty Flag in Hand */}
      <polygon points="76,68 90,62 88,76 76,74" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
    </svg>
  );
}

function TitanUpSvg({ emotion }: { emotion: string }) {
  const isSad = ["sad", "trailing"].includes(emotion);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      {/* Helmet Plume Crest */}
      <path d="M 46 8 C 46 2, 54 2, 54 8 L 52 24 L 48 24 Z" fill="#ef4444" />
      <path d="M 42 12 Q 50 4 58 12 Q 52 24 48 24 Z" fill="#dc2626" />
      {/* Helmet Body */}
      <circle cx="50" cy="50" r="32" fill="#1e3a8a" stroke="#0284c7" strokeWidth="2.5" />
      {/* Face Opening */}
      <path d="M 32 44 L 68 44 L 62 74 L 50 82 L 38 74 Z" fill="#0f172a" />
      {/* Gold Visor / T-Opening */}
      <polygon points="36,46 64,46 56,56 44,56" fill="#fbbf24" />
      <rect x="47" y="56" width="6" height="18" fill="#fbbf24" />
      {/* Eyes */}
      {isSad ? (
        <line x1="42" y1="51" x2="47" y2="51" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <g>
          <ellipse cx="43" cy="51" rx="3" ry="2" fill="#38bdf8" />
          <ellipse cx="57" cy="51" rx="3" ry="2" fill="#38bdf8" />
        </g>
      )}
      {/* Helmet Wing Accent */}
      <path d="M 22 42 Q 12 36 14 26 Q 24 30 28 38 Z" fill="#38bdf8" />
      <path d="M 78 42 Q 88 36 86 26 Q 76 30 72 38 Z" fill="#38bdf8" />
    </svg>
  );
}

function TrexSvg({ emotion }: { emotion: string }) {
  const isSad = ["sad", "trailing"].includes(emotion);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      {/* Back Spikes */}
      <polygon points="34,26 28,20 32,32" fill="#15803d" />
      <polygon points="26,38 20,34 24,46" fill="#15803d" />
      <polygon points="20,54 12,52 18,62" fill="#15803d" />

      {/* Dino Head & Body */}
      <path
        d="M 30 28 C 36 14, 76 16, 82 32 C 86 42, 78 50, 68 52 L 68 62 C 68 76, 36 78, 30 64 Z"
        fill="#22c55e"
        stroke="#15803d"
        strokeWidth="2.5"
      />
      {/* Snout Jaw Line */}
      <path d="M 52 46 L 82 46 L 76 54 L 56 54 Z" fill="#14532d" />
      {/* Sharp Teeth */}
      <polygon points="56,46 59,50 62,46" fill="#ffffff" />
      <polygon points="64,46 67,50 70,46" fill="#ffffff" />
      <polygon points="72,46 75,50 78,46" fill="#ffffff" />

      {/* Eye */}
      <circle cx="56" cy="30" r="6" fill="#fef08a" />
      <circle cx="57" cy="30" r="3" fill="#0f172a" />
      <path d="M 50 24 Q 58 24 62 27" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />

      {/* Tiny T-Rex Arm */}
      <path d="M 48 64 Q 58 66 54 72 Q 46 72 46 66 Z" fill="#16a34a" />

      {/* Eye Brow / Expression */}
      {isSad && (
        <path d="M 52 27 L 60 23" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

function RefSpriteRenderer({ emotion }: { emotion: string }) {
  const isVictory = ["victory", "dancing", "action_joy", "action_joy02"].includes(emotion);
  const isTaunting = emotion === "taunting";
  const isSad = ["sad", "trailing"].includes(emotion);

  // Official Sleeper Ref with high-expression animated states
  let spriteSrc = "/mascots/ref/ref_idle.gif";
  if (isVictory) spriteSrc = "/mascots/ref/ref_victory.gif";
  else if (isTaunting) spriteSrc = "/mascots/ref/ref_review.gif";
  else if (isSad) spriteSrc = "/mascots/ref/ref_flag.gif";

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <img
        src={spriteSrc}
        alt="The Ref"
        className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-all duration-200"
      />
    </div>
  );
}

function FishSpriteRenderer({ emotion }: { emotion: string }) {
  const isVictory = ["victory", "dancing", "action_joy", "action_joy02"].includes(emotion);
  const isTaunting = emotion === "taunting";
  const isSad = ["sad", "trailing"].includes(emotion);

  // Authentic Sleeper Goldfish with multi-frame animations
  let spriteSrc = "/mascots/fish/fish_idle.gif";
  if (isVictory) spriteSrc = "/mascots/fish/fish_action.gif";
  else if (isTaunting) spriteSrc = "/mascots/fish/fish_2.png";
  else if (isSad) spriteSrc = "/mascots/fish/fish_0.png";

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <img
        src={spriteSrc}
        alt="Sleeper Goldfish"
        className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-all duration-200"
      />
    </div>
  );
}
