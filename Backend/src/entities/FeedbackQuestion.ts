import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('feedback_question')
export class FeedbackQuestions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  question: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
