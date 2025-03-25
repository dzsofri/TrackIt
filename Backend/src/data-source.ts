import { DataSource } from "typeorm";
import { Users } from "./entities/User";
import { Feedbacks } from "./entities/Feedback";
import { Follows } from "./entities/Follow";
import { FriendRequests } from "./entities/FriendRequest";
import { Habits } from "./entities/Habit";
import { HabitTrackings } from "./entities/HabitTracking";
import { Posts } from "./entities/Post";
import { Tasks } from "./entities/Task";
import { Pictures } from "./entities/Picture";
import { UserChallenges } from "./entities/UserChallenge";
import { UserStatistics } from "./entities/UserStatistic";
import { FeedbackQuestions } from "./entities/FeedbackQuestion";


export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306, 
  username: "root", 
  password: "", 
  database: "trackit", 
  synchronize: true, 
  logging: false, 
  entities: [Feedbacks, Follows, FriendRequests, Habits, HabitTrackings, Pictures, Posts, Tasks, Users, UserChallenges, UserStatistics, FeedbackQuestions], 
  migrations: [],
  subscribers: [],
});
