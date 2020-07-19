import {CommonDAO} from './CommonDAO';
import {Task} from 'src/app/model/Task';
import {Category} from 'src/app/model/Category';
import {Observable} from 'rxjs';

export interface TaskDAO extends CommonDAO<Task> {
  search(category: Category): Observable<Task[]>;

  getCompletedCountInCategory(category: Category): Observable<number>;

  getUnCompletedCountInCategory(category: Category): Observable<number>;

  getTotalCountInCategory(category: Category): Observable<number>;

  getTotalCount(): Observable<number>;
}