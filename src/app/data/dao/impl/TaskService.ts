import {Injectable, Inject, InjectionToken} from '@angular/core';
import {TaskDAO} from '../interface/TaskDAO';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TaskTo} from '../to/ObjectsTo';
import {Task} from 'src/app/model/Task';
import {CommonService} from './CommonService';

// глобальная переменная для хранения URL
export const TASK_URL_TOKEN = new InjectionToken<string>('url');

@Injectable({
  providedIn: 'root'
})
export class TaskService extends CommonService<Task> implements TaskDAO {

  constructor(@Inject(TASK_URL_TOKEN) private baseUrl,
              httpClient: HttpClient) {
    super(baseUrl, httpClient);
  }

  findTasks(taskTo: TaskTo): Observable<any> {
    return this.httpClient.post(this.baseUrl + '/search', taskTo);
  }
}
