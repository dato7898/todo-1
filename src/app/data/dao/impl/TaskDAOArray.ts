import {TaskDAO} from '../interface/TaskDAO';
import {Observable, of} from 'rxjs';
import {Task} from 'src/app/model/Task';
import {Category} from 'src/app/model/Category';
import {TestData} from '../../TestData';
import {Priority} from 'src/app/model/Priority';

export class TaskDAOArray implements TaskDAO {
  add(T): Observable<Task> {
    return undefined;
  }

  delete(id: number): Observable<Task> {
    const taskTmp = TestData.tasks.find(t => t.id === id); // обновляем по id
    TestData.tasks.splice(TestData.tasks.indexOf(taskTmp), 1);
    return of(taskTmp);
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

    // поочереди применяем все условия (какие не пустые)
    if (status != null) {
      allTasks = allTasks.filter(task => task.completed === status);
    }

    if (category != null) {
      allTasks = allTasks.filter(task => task.category === category);
    }

    if (priority != null) {
      allTasks = allTasks.filter(task => task.priority === priority);
    }

    if (searchText != null) {
      allTasks = allTasks.filter(
        task =>
          task.title.toUpperCase().includes(searchText.toUpperCase()) // учитываем текст поиска (если '' - возвращаются все значения)
      );
    }

    return allTasks;
  }

  update(task: Task): Observable<Task> {
    const taskTmp = TestData.tasks.find(t => t.id === task.id); // обновляем по id
    TestData.tasks.splice(TestData.tasks.indexOf(taskTmp), 1, task);
    return of(task);
  }

}
