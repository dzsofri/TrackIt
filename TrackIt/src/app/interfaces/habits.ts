export interface Habit {
    id: string;
    userId: number;
    habitName: string;
    targetValue: string;
    currentValue: string;
    frequency: string;
}