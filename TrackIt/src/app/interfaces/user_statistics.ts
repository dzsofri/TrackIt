export interface User_statistics {
    id: string;
    userId: number;
    completedTasks: number;
    missedTasks: number;
    completionRate: number;
    activeChallengeId: string;
    activeTaskId: string;
}