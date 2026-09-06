export type GoalArchetype =
  | 'acquire'
  | 'learn'
  | 'build'
  | 'improve'
  | 'stabilize'
  | 'decide'
  | 'experience'
  | 'habit'
  | 'financial'
  | 'career_business'
  | 'custom';

export type JourneyRiskTier = 'low' | 'medium' | 'high';
export type EvidenceKind = 'user_report' | 'system_record' | 'external_source' | 'measured' | 'document';
export type MissionStatus = 'locked' | 'ready' | 'doing' | 'blocked' | 'done' | 'skipped';

/**
 * A Journey is the experience layer on top of Goal -> Route -> RouteStep.
 * It is not a second persistence model. The canonical entities remain Goal,
 * Route, RouteStep, Project and Task.
 */
export type JourneyIntent = {
  statement: string;
  archetype: GoalArchetype;
  desiredOutcome: string;
  currentState?: string;
  motivation?: string;
  targetDate?: string | null;
  budget?: { amount?: number | null; currency?: string | null };
  timeAvailable?: string | null;
  constraints?: string[];
  preferences?: string[];
  riskTier: JourneyRiskTier;
};

export type ProgressMetricProposal = {
  key: string;
  label: string;
  kind: 'binary' | 'number' | 'currency' | 'percent' | 'count' | 'duration';
  unit?: string;
  baseline?: number | boolean | null;
  target?: number | boolean | null;
  whyItMatters: string;
};

export type EvidenceProposal = {
  kind: EvidenceKind;
  description: string;
  required: boolean;
};

export type RouteMissionProposal = {
  title: string;
  description?: string;
  missionType:
    | 'discover'
    | 'prepare'
    | 'research'
    | 'learn'
    | 'practice'
    | 'earn'
    | 'save'
    | 'decide'
    | 'buy'
    | 'build'
    | 'execute'
    | 'validate'
    | 'maintain'
    | 'review';
  status: MissionStatus;
  successCriteria: string;
  estimatedMinutes?: number | null;
  estimatedCost?: number | null;
  currency?: string | null;
  dueDate?: string | null;
  dependencies?: number[];
  evidence?: EvidenceProposal[];
  reason: string;
};

export type RouteChapterProposal = {
  title: string;
  purpose: string;
  unlockCondition?: string;
  missions: RouteMissionProposal[];
};

export type SourceProposal = {
  title: string;
  url?: string;
  publisher?: string;
  publishedAt?: string | null;
  relevance: string;
};

export type JourneyProposal = {
  version: 1;
  intent: JourneyIntent;
  title: string;
  summary: string;
  successDefinition: string;
  assumptions: string[];
  missingInformation: string[];
  progressMetrics: ProgressMetricProposal[];
  chapters: RouteChapterProposal[];
  firstBestAction: {
    title: string;
    reason: string;
  };
  sources: SourceProposal[];
  confidence: number;
};

/**
 * A visual progression score may be calculated from canonical progress, but it
 * must never replace the real-world metrics. This keeps gamification useful
 * without rewarding meaningless clicks.
 */
export function journeyProgressFromMissions(chapters: RouteChapterProposal[]) {
  const missions = chapters.flatMap(chapter => chapter.missions).filter(mission => mission.status !== 'skipped');
  if (!missions.length) return 0;
  const done = missions.filter(mission => mission.status === 'done').length;
  return Math.round((done / missions.length) * 100);
}
