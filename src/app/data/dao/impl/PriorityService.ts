import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PriorityTo} from '../to/ObjectsTo';
import {Priority} from '../../../model/Priority';
import {PriorityDAO} from '../interface/PriorityDAO';
import {CommonService} from './CommonService';

// глобальная переменная для хранения URL
export const PRIORITY_URL_TOKEN = new InjectionToken<string>('url');

@Injectable({
  providedIn: 'root'
})
export class PriorityService extends CommonService<Priority> implements PriorityDAO {

  constructor(@Inject(PRIORITY_URL_TOKEN) private baseUrl,
              httpClient: HttpClient // для выполнения HTTP запросов
  ) {
    super(baseUrl, httpClient);
  }

  findPriorities(priorityTo: PriorityTo) {
    return this.httpClient.post<Priority[]>(this.baseUrl + '/search', priorityTo);
  }
}
