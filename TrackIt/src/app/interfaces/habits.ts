export interface Habit {
    id: string;
    userId: number;
    habitName: string;
    targetValue: number;
    currentValue: number;
    dailyTarget: number;
    status: string; 
    completed: boolean;
    createdAt: Date;
    unit: string; // Mértékegység
}