/**
 * Invisible Ink Storytelling Principles
 * Based on Brian McDonald's "Invisible Ink: A Practical Guide to Building Stories That Resonate"
 * 
 * This module provides structured storytelling frameworks to enhance AI-generated stories
 * by incorporating fundamental narrative principles.
 */

export interface StoryTheme {
  core: string;
  moral?: string;
  emotionalJourney: string;
  universalTruth?: string;
}

export interface CharacterArc {
  startingState: string;
  conflict: string;
  transformation: string;
  resolution: string;
}

export interface StoryStructure {
  setup: {
    worldBuilding: string;
    characterIntroduction: string;
    incitingIncident: string;
  };
  confrontation: {
    risingAction: string[];
    obstacles: string[];
    stakes: string;
    midpointTurn?: string;
  };
  resolution: {
    climax: string;
    fallingAction: string;
    denouement: string;
  };
}

export interface SubtextLayer {
  surfaceStory: string;
  hiddenMeaning: string;
  emotionalUndercurrent: string;
}

export interface InvisibleInkPrinciples {
  theme: StoryTheme;
  protagonist: CharacterArc;
  structure: StoryStructure;
  subtext?: SubtextLayer;
  motifs?: string[];
  symbolism?: Record<string, string>;
}

/**
 * Generate theme-based storytelling principles
 */
export function generateThemePrinciples(theme: string, ageGroup: number): StoryTheme {
  const themes: Record<string, StoryTheme> = {
    adventure: {
      core: "Courage comes from facing our fears",
      moral: "The greatest adventures lead to self-discovery",
      emotionalJourney: "From comfort to challenge to growth",
      universalTruth: "We are capable of more than we imagine"
    },
    friendship: {
      core: "True friendship requires understanding and acceptance",
      moral: "Friends help us become our best selves",
      emotionalJourney: "From loneliness to connection to belonging",
      universalTruth: "We need each other to thrive"
    },
    magic: {
      core: "Wonder exists in the world for those who believe",
      moral: "Magic is found in kindness and imagination",
      emotionalJourney: "From ordinary to extraordinary to appreciating both",
      universalTruth: "Belief creates possibility"
    },
    mystery: {
      core: "Curiosity and observation reveal hidden truths",
      moral: "Looking closer helps us understand better",
      emotionalJourney: "From confusion to discovery to understanding",
      universalTruth: "There's always more than meets the eye"
    },
    fantasy: {
      core: "Imagination transforms reality",
      moral: "Dreams can guide us to new possibilities",
      emotionalJourney: "From limitation to liberation through creativity",
      universalTruth: "Our inner world shapes our outer experience"
    },
    "science-fiction": {
      core: "Innovation requires both caution and courage",
      moral: "Technology serves humanity best when guided by wisdom",
      emotionalJourney: "From familiar to unknown to adaptation",
      universalTruth: "Progress requires responsibility"
    },
    educational: {
      core: "Learning opens doors to new worlds",
      moral: "Knowledge empowers us to help others",
      emotionalJourney: "From ignorance to curiosity to mastery",
      universalTruth: "Every question leads to new discoveries"
    },
    bedtime: {
      core: "Rest and dreams restore our spirit",
      moral: "Peace comes from letting go of the day",
      emotionalJourney: "From activity to calm to peaceful rest",
      universalTruth: "Sleep brings renewal and new beginnings"
    }
  };

  // Adjust complexity based on age
  const baseTheme = themes[theme] || themes.adventure;
  
  if (ageGroup < 6) {
    // Simplify for younger children
    return {
      ...baseTheme,
      moral: baseTheme.moral?.split('.')[0], // Shorter moral
      emotionalJourney: baseTheme.emotionalJourney.split('to')[0] + " to happiness"
    };
  }
  
  return baseTheme;
}

/**
 * Create a character arc based on theme and story parameters
 */
export function createCharacterArc(
  characterName: string,
  theme: string,
  challenge?: string
): CharacterArc {
  const arcs: Record<string, CharacterArc> = {
    adventure: {
      startingState: `${characterName} lives a comfortable but routine life`,
      conflict: "An unexpected event calls them to action",
      transformation: "Through courage, they discover inner strength",
      resolution: "They return home changed, with new confidence"
    },
    friendship: {
      startingState: `${characterName} feels alone or misunderstood`,
      conflict: "A situation requires cooperation with others",
      transformation: "They learn to trust and be trusted",
      resolution: "They find belonging and true connection"
    },
    mystery: {
      startingState: `${characterName} notices something unusual`,
      conflict: "Clues lead to more questions than answers",
      transformation: "Persistence and observation reveal the truth",
      resolution: "The mystery solved brings new understanding"
    },
    growth: {
      startingState: `${characterName} faces a personal limitation`,
      conflict: "A challenge highlights what they cannot yet do",
      transformation: "Practice and determination lead to improvement",
      resolution: "They achieve what once seemed impossible"
    }
  };

  return arcs[theme] || {
    startingState: `${characterName} begins in their ordinary world`,
    conflict: challenge || "A challenge disrupts their normal life",
    transformation: "They grow through facing the challenge",
    resolution: "They emerge stronger and wiser"
  };
}

/**
 * Build three-act structure with McDonald's principles
 */
export function buildThreeActStructure(
  theme: StoryTheme,
  characterArc: CharacterArc,
  wordCount: number
): StoryStructure {
  // Calculate act proportions based on word count
  const setupWords = Math.floor(wordCount * 0.25);
  const confrontationWords = Math.floor(wordCount * 0.50);
  const resolutionWords = Math.floor(wordCount * 0.25);

  return {
    setup: {
      worldBuilding: `Establish the setting that reflects ${theme.core}`,
      characterIntroduction: characterArc.startingState,
      incitingIncident: `The moment that begins the journey toward ${theme.emotionalJourney}`
    },
    confrontation: {
      risingAction: [
        "First attempt to solve the problem",
        "Complications arise from the initial solution",
        "Deeper understanding of the real challenge"
      ],
      obstacles: [
        "External challenge testing courage",
        "Internal doubt or fear to overcome",
        "Final barrier before transformation"
      ],
      stakes: `What will be lost if the character fails: ${theme.moral}`,
      midpointTurn: "The moment of realization that changes everything"
    },
    resolution: {
      climax: `The decisive moment where ${characterArc.transformation} is tested`,
      fallingAction: "The immediate aftermath of the climactic choice",
      denouement: `${characterArc.resolution} - embodying ${theme.universalTruth}`
    }
  };
}

/**
 * Add subtext layers for deeper meaning
 */
export function createSubtextLayer(
  theme: string,
  ageAppropriate: boolean = true
): SubtextLayer | undefined {
  if (!ageAppropriate) {
    return undefined; // Skip subtext for very young children
  }

  const subtextMap: Record<string, SubtextLayer> = {
    adventure: {
      surfaceStory: "A journey to a new place",
      hiddenMeaning: "The journey of growing up",
      emotionalUndercurrent: "The excitement and fear of change"
    },
    friendship: {
      surfaceStory: "Making a new friend",
      hiddenMeaning: "Learning to see beyond ourselves",
      emotionalUndercurrent: "The vulnerability of opening our hearts"
    },
    mystery: {
      surfaceStory: "Solving a puzzle",
      hiddenMeaning: "Understanding the world around us",
      emotionalUndercurrent: "The satisfaction of discovery"
    }
  };

  return subtextMap[theme];
}

/**
 * Generate recurring motifs based on theme
 */
export function generateMotifs(theme: string): string[] {
  const motifMap: Record<string, string[]> = {
    adventure: ["maps", "paths", "doorways", "horizons", "footsteps"],
    friendship: ["shared meals", "helping hands", "laughter", "circles", "bridges"],
    magic: ["sparkles", "transformations", "wishes", "stars", "mirrors"],
    mystery: ["shadows", "keys", "whispers", "footprints", "hidden doors"],
    fantasy: ["portals", "ancient books", "crystals", "forests", "dreams"],
    bedtime: ["stars", "moon", "soft blankets", "gentle breezes", "lullabies"]
  };

  return motifMap[theme] || ["light and shadow", "growth", "discovery"];
}

/**
 * Create symbolic elements that reinforce theme
 */
export function createSymbolism(theme: string): Record<string, string> {
  const symbolMap: Record<string, Record<string, string>> = {
    adventure: {
      "compass": "guidance and direction in life",
      "mountain": "challenges to overcome",
      "sunrise": "new beginnings"
    },
    friendship: {
      "bracelet": "connection and bond",
      "tree": "growth through relationships",
      "bridge": "overcoming differences"
    },
    magic: {
      "wand": "power of intention",
      "book": "knowledge and wisdom",
      "crystal": "clarity and transformation"
    }
  };

  return symbolMap[theme] || {
    "light": "hope and understanding",
    "path": "life's journey",
    "seed": "potential for growth"
  };
}

/**
 * Compile all Invisible Ink principles for a story
 */
export function compileStoryPrinciples(
  characterName: string,
  theme: string,
  ageGroup: number,
  wordCount: number,
  includeSubtext: boolean = true
): InvisibleInkPrinciples {
  const storyTheme = generateThemePrinciples(theme, ageGroup);
  const characterArc = createCharacterArc(characterName, theme);
  const structure = buildThreeActStructure(storyTheme, characterArc, wordCount);
  
  return {
    theme: storyTheme,
    protagonist: characterArc,
    structure,
    subtext: includeSubtext && ageGroup >= 6 ? createSubtextLayer(theme, true) : undefined,
    motifs: generateMotifs(theme),
    symbolism: createSymbolism(theme)
  };
}

/**
 * Format principles into prompt instructions for LLM
 */
export function formatPrinciplesForPrompt(principles: InvisibleInkPrinciples): string {
  const instructions: string[] = [];

  // Theme instructions
  instructions.push(`THEMATIC CORE: ${principles.theme.core}`);
  if (principles.theme.moral) {
    instructions.push(`MORAL LESSON: ${principles.theme.moral}`);
  }
  instructions.push(`EMOTIONAL JOURNEY: ${principles.theme.emotionalJourney}`);

  // Character arc
  instructions.push(`
CHARACTER ARC:
- Beginning: ${principles.protagonist.startingState}
- Conflict: ${principles.protagonist.conflict}
- Transformation: ${principles.protagonist.transformation}
- Resolution: ${principles.protagonist.resolution}`);

  // Three-act structure
  instructions.push(`
STORY STRUCTURE:
Act 1 - Setup (25% of story):
- ${principles.structure.setup.worldBuilding}
- ${principles.structure.setup.characterIntroduction}
- Inciting incident: ${principles.structure.setup.incitingIncident}

Act 2 - Confrontation (50% of story):
- Rising action with escalating challenges
- Stakes: ${principles.structure.confrontation.stakes}
- Midpoint turn that shifts perspective

Act 3 - Resolution (25% of story):
- Climax: ${principles.structure.resolution.climax}
- ${principles.structure.resolution.denouement}`);

  // Subtext if applicable
  if (principles.subtext) {
    instructions.push(`
SUBTEXT LAYER:
- Surface: ${principles.subtext.surfaceStory}
- Deeper meaning: ${principles.subtext.hiddenMeaning}
- Emotional undercurrent: ${principles.subtext.emotionalUndercurrent}`);
  }

  // Motifs and symbols
  if (principles.motifs && principles.motifs.length > 0) {
    instructions.push(`RECURRING MOTIFS: Include subtle references to ${principles.motifs.slice(0, 3).join(', ')}`);
  }

  if (principles.symbolism) {
    const symbols = Object.entries(principles.symbolism).slice(0, 2);
    if (symbols.length > 0) {
      instructions.push(`SYMBOLISM: Use ${symbols.map(([sym, meaning]) => `${sym} to represent ${meaning}`).join(', ')}`);
    }
  }

  instructions.push(`
IMPORTANT: Every element should serve the central theme. Ensure thematic consistency throughout.
Create a story where all elements work together to support "${principles.theme.core}"`);

  return instructions.join('\n');
}

/**
 * Validate if generated story follows Invisible Ink principles
 */
export function validateStoryStructure(
  storyContent: string,
  principles: InvisibleInkPrinciples
): {
  valid: boolean;
  feedback: string[];
} {
  const feedback: string[] = [];
  const wordCount = storyContent.split(/\s+/).length;
  
  // Check for three-act structure markers
  const hasBeginning = storyContent.toLowerCase().includes(principles.protagonist.startingState.toLowerCase().substring(0, 20));
  const hasConflict = storyContent.length > wordCount * 0.25;
  // const hasResolution = storyContent.length > wordCount * 0.75; // Not used currently

  if (!hasBeginning) {
    feedback.push("Story should establish character's starting state more clearly");
  }

  // Check for thematic consistency
  const themeWords = principles.theme.core.toLowerCase().split(' ');
  const themePresent = themeWords.some(word => 
    storyContent.toLowerCase().includes(word)
  );

  if (!themePresent) {
    feedback.push("Theme could be more prominent throughout the story");
  }

  // Check for motifs
  if (principles.motifs) {
    const motifPresent = principles.motifs.some(motif => 
      storyContent.toLowerCase().includes(motif)
    );
    if (!motifPresent) {
      feedback.push("Consider incorporating recurring motifs for depth");
    }
  }

  return {
    valid: feedback.length === 0,
    feedback
  };
}