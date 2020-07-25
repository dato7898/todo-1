import {CommonDAO} from './CommonDAO';
import {Task} from 'src/app/model/Task';
import {Observable} from 'rxjs';
import {TaskTo} from '../to/ObjectsTo';

export interface TaskDAO extends CommonDAO<Task> {

  findTasks(taskTo: TaskTo): Observable<any>;

}
