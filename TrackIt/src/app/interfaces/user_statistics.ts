export interface User_statistics {
    id: string;
    user_id: number;
    completed_tasks: number;
    missed_tasks: number;
    completion_rate: number;
    active_challenge_id: string;
    active_task_id: string;
}