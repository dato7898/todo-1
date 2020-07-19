import {TaskDAO} from '../interface/TaskDAO';
import { Observable, of } from 'rxjs';
import { Task } from 'src/app/model/Task';
import { Category } from 'src/app/model/Category';
import {TestData} from '../../TestData';
import { Priority } from 'src/app/model/Priority';

export class TaskDAOArray implements TaskDAO {
  add(T): Observable<Task> {
    return undefined;
  }

  delete(id: number): Observable<Task> {
    return undefined;
  }

  get(id: number): Observable<Task> {
    return of(TestData.tasks.find(todo => todo.id === id));
  }

  getAll(): Observable<Task[]> {
    return of(TestData.tasks);
  }

  getCompletedCountInCategory(category: Category): Observable<number> {
    return undefined;
  }

  getTotalCount(): Observable<number> {
    return undefined;
  }

  getTotalCountInCategory(category: Category): Observable<number> {
    return undefined;
  }

  getUnCompletedCountInCategory(category: Category): Observable<number> {
    return undefined;
  }

  search(category: Category, searchText: string, status: boolean, priority: Priority): Observable<Task[]> {
    return of(this.searchTasks(category, searchText, status, priority));
  }

  private searchTasks(category: Category, searchText: string, status: boolean, priority: Priority): Task[] {
    let allTasks = TestData.tasks;
    if (category) {
      allTasks = allTasks.filter(todo => todo.category === category);
    }
    return allTasks;
  }

  update(T): Observable<Task> {
    return undefined;
  }

}
