import express, { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

import { TaskProps } from './types';

const app = express();

app.use(express.json());
app.use(cors());

interface CustomRequest extends Request {
  task?: TaskProps;
}

const verifyIfTaskExists = (request: CustomRequest, response: Response, next: NextFunction) => {
  const { id } = request.headers;

  const task = tasks.find(task => task.id === id);

  if (!task) {
    return response.status(400).json({
      error: "Task does not exists."
    });
  }

  request.task = task;

  return next();
};

let tasks: TaskProps[] = [];

app.get('/tasks', (request: CustomRequest, response: Response) => {
  const { id } = request.headers;

  if (!id) {
    return response.status(200).json(tasks);
  }

  const task = tasks.find(task => task.id === id);

  return response.status(200).json(task);
});

app.get('/tasks/status', (request: CustomRequest, response: Response) => {
  const { status } = request.query;

  if (status !== 'pending' && status !== 'inprogress' && status !== 'done') {
    return response.status(400).json({
      error: "Verify if you passed a valid status."
    });
  }

  const tasksByStatus = tasks.filter(task => task.status === status);

  return response.status(200).json(tasksByStatus);
});

app.post('/tasks/create', (request: CustomRequest, response: Response) => {
  const { title, description } = request.body;

  const taskAlreadyExists = tasks.some(task => task.title === title);

  if (taskAlreadyExists) {
    return response.status(400).json({
      error: "Title already exists, try again."
    });
  }

  const createTask: TaskProps = {
    id: uuidv4(),
    title,
    description,
    status: 'pending',
    created_at: new Date(),
  };

  tasks.push(createTask);

  return response.status(201).json({
    createTask,
    success: "Task successfully created."
  });
});

app.put('/tasks/edit', verifyIfTaskExists, (request: CustomRequest, response: Response) => {
  const { title, description } = request.body;
  const { task } = request;
  const { id } = task;

  if (task.status === 'inprogress' || task.status === 'done') {
    return response.status(400).json({
      error: "Task cannot be updated if it's finished or in progress."
    });
  }

  const taskEdited: TaskProps = {
    ...task,
    title,
    description
  };

  tasks = tasks.filter(task => task.id !== id);
  tasks.push(taskEdited);

  return response.status(200).json({
    taskEdited,
    success: "Task successfully edited."
  });
});

app.patch('/tasks/edit/status', verifyIfTaskExists, (request: CustomRequest, response: Response) => {
  const { status } = request.body;
  const { task } = request;
  const { id } = task;

  const verifyIfSomeTaskIsInProgress = tasks.some(task => task.status === status);

  if (verifyIfSomeTaskIsInProgress) {
    return response.status(400).json({
      error: "You already have a task in progress, finish it to start another one."
    });
  }

  const taskEdited: TaskProps = {
    ...task,
    status
  };

  tasks = tasks.filter(task => task.id !== id);
  tasks.push(taskEdited);

  return response.status(200).json({
    success: "Task's status successfully edited."
  });
});

app.delete('/tasks/remove', verifyIfTaskExists, (request: CustomRequest, response: Response) => {
  const { id } = request.task;

  tasks = tasks.filter(task => task.id !== id);

  return response.status(200).json({
    success: "Task successfully deleted."
  });
});

app.delete('/tasks/remove/status', (request: CustomRequest, response: Response) => {
  const { status } = request.query;

  tasks = tasks.filter(task => task.status !== status);

  return response.status(200).json({
    success: "Tasks successfully deleted."
  });
});

app.listen(3030, () => console.log('Server is running on port 3030'))
