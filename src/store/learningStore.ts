import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearningContext, Milestone } from '../types/learning';

const DEFAULT_CONTEXT: LearningContext = {
  learnerId: 'local-user',
  learnerName: 'Harper',
  enrolledSchools: [],
  activeMilestoneId: 'milestone-2',
  roadmap: {
    subject: 'Physics',
    module: 'Mechanics & Computational Modeling',
    milestones: [
      {
        id: 'milestone-1',
        title: 'Kinematics and Vectors',
        description: 'Understand displacement, velocity, acceleration, and vector components.',
        status: 'completed',
        linkedApp: 'hkai',
        completionCondition: 'Complete the kinematics module in HK AI',
        completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'milestone-2',
        title: 'Projectile Motion Lab',
        description: 'Run projectile simulations and analyse how angle, velocity, and gravity affect trajectory.',
        status: 'active',
        linkedApp: 'simulation',
        completionCondition: 'Run at least 3 simulations with different gravity settings',
      },
      {
        id: 'milestone-3',
        title: 'Python Trajectory Solver',
        description: 'Write and run a Python script that calculates trajectory metrics from given parameters.',
        status: 'pending',
        linkedApp: 'codelab',
        completionCondition: 'Successfully run the trajectory solver code',
      },
      {
        id: 'milestone-4',
        title: 'Module Assessment',
        description: 'Demonstrate mastery of projectile motion through a timed assessment.',
        status: 'pending',
        linkedApp: 'hkai',
        completionCondition: 'Submit and pass the module assessment',
      },
    ],
  },
};

interface LearningState {
  context: LearningContext;
  setActiveMilestone: (id: string) => void;
  completeMilestone: (id: string) => void;
  enrollSchool: (schoolId: string) => void;
  unenrollSchool: (schoolId: string) => void;
  updateLearnerName: (name: string) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      context: DEFAULT_CONTEXT,
      setActiveMilestone: (id) => set((state) => ({ context: { ...state.context, activeMilestoneId: id } })),
      completeMilestone: (id) => set((state) => ({
        context: {
          ...state.context,
          roadmap: {
            ...state.context.roadmap,
            milestones: state.context.roadmap.milestones.map((m): Milestone =>
              m.id === id ? { ...m, status: 'completed', completedAt: new Date().toISOString() } : m
            ),
          },
        },
      })),
      enrollSchool: (schoolId) => set((state) => ({
        context: {
          ...state.context,
          enrolledSchools: state.context.enrolledSchools.includes(schoolId)
            ? state.context.enrolledSchools
            : [...state.context.enrolledSchools, schoolId],
        },
      })),
      unenrollSchool: (schoolId) => set((state) => ({
        context: { ...state.context, enrolledSchools: state.context.enrolledSchools.filter(s => s !== schoolId) },
      })),
      updateLearnerName: (name) => set((state) => ({ context: { ...state.context, learnerName: name } })),
    }),
    { name: 'hkos-learning' }
  )
);
