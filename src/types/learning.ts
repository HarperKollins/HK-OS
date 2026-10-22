export type MilestoneStatus = 'completed' | 'active' | 'pending';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  linkedApp?: string;
  completionCondition: string;
  completedAt?: string;
}

export interface LearningRoadmap {
  subject: string;
  module: string;
  milestones: Milestone[];
}

export interface LearningContext {
  learnerId: string;
  learnerName: string;
  roadmap: LearningRoadmap;
  activeMilestoneId: string | null;
  enrolledSchools: string[];
}
