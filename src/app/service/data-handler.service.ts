import {Injectable} from '@angular/core';
import {Task} from '../model/Task';
import {Observable} from 'rxjs';
import {TaskDAOArray} from '../data/dao/impl/TaskDAOArray';
import {Category} from '../model/Category';
import {CategoryDAOArray} from '../data/dao/impl/CategoryDAOArray';
import {Priority} from '../model/Priority';
import {PriorityDAOArray} from '../data/dao/impl/PriorityDAOArray';

@Injectable({
  providedIn: 'root'
})
export class DataHandlerService {
  private taskDaoArray = new TaskDAOArray();
  private categoryDaoArray = new CategoryDAOArray();
  private priorityDaoArray = new PriorityDAOArray();

  constructor() {
  }

  getAllTasks(): Observable<Task[]> {
    return this.taskDaoArray.getAll();
  }

  getAllCategories(): Observable<Category[]> {
    return this.categoryDaoArray.getAll();
  }

  getAllPriorities(): Observable<Priority[]> {
    return this.priorityDaoArray.getAll();
  }

  updateTask(task: Task): Observable<Task> {
    return this.taskDaoArray.update(task);
  }

  updateCategory(category: Category): Observable<Category> {
    return this.categoryDaoArray.update(category);
  }

  searchTasks(category: Category, searchText: string, status: boolean, priority: Priority): Observable<Task[]> {
    return this.taskDaoArray.search(category, searchText, status, priority);
  }

  deleteTask(id: number): Observable<Task> {
    return this.taskDaoArray.delete(id);
  }

  deleteCategory(id: number): Observable<Category> {
    return this.categoryDaoArray.delete(id);
  }
}
