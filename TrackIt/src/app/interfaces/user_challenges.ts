export interface User_Challenge {
    id: string;
    secondaryId: string;
    userId: number;
    progressPercentage: number;
    createdAt: string;
    completedAt: string;
    status: number;
    durationDays: number;
    rewardPoints: number;
    finalDate: string;
    challengeName: string;
    challengeDescription: string;
    badgeId: string;
    imagePreviewUrl?: string;
    imageUrl?: string;
    userImage?: string;
    selectedSecondaryId?: string;
}