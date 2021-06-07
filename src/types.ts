type TaskStatus = 'pending' | 'inprogress' | 'done';

export interface TaskProps {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  created_at: Date;
}
