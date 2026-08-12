export type ID = string;
export type ISODateTime = string;

export interface BaseEntity { id: ID; createdAt: ISODateTime; updatedAt: ISODateTime; archivedAt?: ISODateTime | null; }
export interface Area extends BaseEntity { name: string; description?: string; status: 'active' | 'paused' | 'archived'; }
export interface Goal extends BaseEntity { areaId?: ID; title: string; description?: string; status: 'draft' | 'active' | 'achieved' | 'paused' | 'archived'; targetDate?: string; successCriteria?: string; }
export interface Project extends BaseEntity { title: string; description?: string; status: 'idea' | 'planned' | 'active' | 'blocked' | 'paused' | 'done' | 'archived'; priority?: number; }
export interface Task extends BaseEntity { projectId?: ID; title: string; status: 'inbox' | 'next' | 'doing' | 'blocked' | 'done' | 'cancelled'; priority?: number; dueAt?: ISODateTime; estimatedMinutes?: number; energyRequired?: 'low' | 'medium' | 'high'; }
export interface Idea extends BaseEntity { areaId?: ID; title: string; description?: string; status: 'captured' | 'incubating' | 'promoted' | 'archived'; potentialImpact?: number; reviewAt?: ISODateTime; promotedProjectId?: ID; }
export interface Decision extends BaseEntity { title: string; outcome: string; rationale?: string; assumptions?: string[]; alternatives?: string[]; reviewAt?: ISODateTime; }
export interface Category extends BaseEntity { parentId?: ID; namespace: string; name: string; description?: string; sensitive?: boolean; }
export interface Item extends BaseEntity { categoryId?: ID; name: string; defaultUnit?: string; metadata?: Record<string, unknown>; }
export interface Context extends BaseEntity { name?: string; attributes: Record<string, string | number | boolean | null>; }
export interface Event extends BaseEntity { type: string; occurredAt: ISODateTime; endedAt?: ISODateTime; quantity?: number; unit?: string; notes?: string; itemIds?: ID[]; contextIds?: ID[]; }
export interface MetricDefinition extends BaseEntity { namespace: string; name: string; unit?: string; min?: number; max?: number; higherIs?: 'better' | 'worse' | 'neutral' | 'contextual'; }
export interface Observation extends BaseEntity { metricId: ID; observedAt: ISODateTime; value: number | string | boolean; source: 'subjective' | 'measured' | 'imported' | 'inferred'; eventId?: ID; contextIds?: ID[]; notes?: string; }
export interface CheckIn extends BaseEntity { occurredAt: ISODateTime; observationIds: ID[]; note?: string; }
export interface Routine extends BaseEntity { areaId?: ID; title: string; purpose?: string; trigger?: string; recurrence?: string; preferredWindow?: string; estimatedMinutes?: number; minimumVersion?: string; active: boolean; }
export interface RoutineStep extends BaseEntity { routineId: ID; order: number; actionType: string; targetRef?: string; optional?: boolean; }
