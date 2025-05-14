export interface Habit {
    id: string;
    userId: number;
    habitName: string;
    targetValue: number;
    currentValue: number;
    dailyTarget: number;
}