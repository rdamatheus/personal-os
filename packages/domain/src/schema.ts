export type ID = string;
export type ISODateTime = string;

export interface BaseEntity {
  id: ID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  archivedAt?: ISODateTime | null;
}

export interface WorkspaceScopedEntity extends BaseEntity {
  workspaceId: ID;
}

export interface Profile {
  id: ID;
  displayName?: string;
  avatarUrl?: string;
  timezone: string;
  locale: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Workspace extends BaseEntity {
  ownerUserId: ID;
  name: string;
  kind: 'personal' | 'shared';
}

export interface WorkspaceMember {
  workspaceId: ID;
  userId: ID;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'invited' | 'suspended';
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Area extends WorkspaceScopedEntity {
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'archived';
}

export interface Goal extends WorkspaceScopedEntity {
  areaId?: ID;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'achieved' | 'paused' | 'archived';
  priority?: number;
  targetDate?: string;
  successCriteria?: string;
}

export interface Route extends WorkspaceScopedEntity {
  goalId?: ID;
  title: string;
  description?: string;
  status: 'draft' | 'proposed' | 'active' | 'paused' | 'completed' | 'archived';
  source: 'manual' | 'ai' | 'template';
  progress: number;
  createdBy: ID;
}

export interface RouteStep extends WorkspaceScopedEntity {
  routeId: ID;
  title: string;
  description?: string;
  position: number;
  status: 'pending' | 'ready' | 'doing' | 'blocked' | 'done' | 'skipped';
  estimatedMinutes?: number;
  estimatedCost?: number;
  currency: string;
  dueDate?: string;
  reason?: string;
  source: 'manual' | 'ai' | 'template';
  confidence?: number;
  dependsOnStepIds: ID[];
  createdBy: ID;
}

export interface Project extends WorkspaceScopedEntity {
  areaId?: ID;
  goalId?: ID;
  title: string;
  description?: string;
  status: 'idea' | 'planned' | 'active' | 'blocked' | 'paused' | 'done' | 'archived';
  priority?: number;
  progress?: number;
}

export interface Task extends WorkspaceScopedEntity {
  areaId?: ID;
  projectId?: ID;
  routeStepId?: ID;
  title: string;
  description?: string;
  status: 'inbox' | 'next' | 'doing' | 'blocked' | 'done' | 'cancelled';
  priority?: number;
  dueAt?: ISODateTime;
  estimatedMinutes?: number;
  energyRequired?: 'low' | 'medium' | 'high';
}

export interface Idea extends WorkspaceScopedEntity {
  areaId?: ID;
  projectId?: ID;
  title: string;
  description?: string;
  status: 'captured' | 'incubating' | 'promoted' | 'archived';
  potentialImpact?: number;
  reviewAt?: ISODateTime;
  promotedProjectId?: ID;
}

export interface Decision extends WorkspaceScopedEntity {
  areaId?: ID;
  projectId?: ID;
  title: string;
  outcome: string;
  rationale?: string;
  assumptions?: string[];
  alternatives?: string[];
  reviewAt?: ISODateTime;
  relatedEntityType?: string;
  relatedEntityId?: ID;
  status: 'active' | 'superseded' | 'archived';
}

export interface ActivityLog {
  id: ID;
  workspaceId: ID;
  actorUserId?: ID;
  action: string;
  entityType: string;
  entityId?: ID;
  metadata: Record<string, unknown>;
  createdAt: ISODateTime;
}

export interface Category extends BaseEntity {
  parentId?: ID;
  namespace: string;
  name: string;
  description?: string;
  sensitive?: boolean;
}

export interface Item extends BaseEntity {
  categoryId?: ID;
  name: string;
  defaultUnit?: string;
  metadata?: Record<string, unknown>;
}

export interface Context extends BaseEntity {
  name?: string;
  attributes: Record<string, string | number | boolean | null>;
}

export interface Event extends WorkspaceScopedEntity {
  type: string;
  occurredAt: ISODateTime;
  endedAt?: ISODateTime;
  quantity?: number;
  unit?: string;
  notes?: string;
  itemIds?: ID[];
  contextIds?: ID[];
}

export interface MetricDefinition extends BaseEntity {
  namespace: string;
  name: string;
  unit?: string;
  min?: number;
  max?: number;
  higherIs?: 'better' | 'worse' | 'neutral' | 'contextual';
}

export interface Observation extends BaseEntity {
  metricId: ID;
  observedAt: ISODateTime;
  value: number | string | boolean;
  source: 'subjective' | 'measured' | 'imported' | 'inferred';
  eventId?: ID;
  contextIds?: ID[];
  notes?: string;
}

export interface CheckIn extends WorkspaceScopedEntity {
  occurredAt: ISODateTime;
  observationIds: ID[];
  note?: string;
}

export interface Routine extends WorkspaceScopedEntity {
  areaId?: ID;
  title: string;
  purpose?: string;
  trigger?: string;
  recurrence?: string;
  preferredWindow?: string;
  estimatedMinutes?: number;
  minimumVersion?: string;
  active: boolean;
}

export interface RoutineStep extends BaseEntity {
  routineId: ID;
  order: number;
  actionType: string;
  targetRef?: string;
  optional?: boolean;
}
