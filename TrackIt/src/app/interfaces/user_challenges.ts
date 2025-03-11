export interface User_Challenge {
    id: string;
    userId: number;
    progressPercentage: number;
    createdAt: string;
    completedAt: string;
    status: boolean;
    durationDays: number;
    rewardPoints: number;
    finalDate: string;
    challengeName: string;
    challengeDescription: string;
}