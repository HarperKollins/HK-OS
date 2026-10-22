export type ActivityEventType =
  | 'SIMULATION_RUN'
  | 'CODE_EXECUTED'
  | 'NOTE_SAVED'
  | 'MILESTONE_OPENED'
  | 'MILESTONE_COMPLETED'
  | 'MODULE_INSTALLED'
  | 'SCHOOL_ENROLLED'
  | 'FOCUS_MODE_STARTED'
  | 'EXAM_SUBMITTED';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: string;
  data: Record<string, unknown>;
  appId: string;
}

export interface SimulationRunData {
  angle: number;
  velocity: number;
  gravity: number;
  gravityLabel: string;
  range: number;
  maxHeight: number;
  flightTime: number;
}

export interface CodeExecutionData {
  language: string;
  linesOfCode: number;
  outputLines: number;
  success: boolean;
  simulatedDurationMs: number;
}
