import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CategoryTo} from '../to/ObjectsTo';
import {Category} from 'src/app/model/Category';
import {Observable} from 'rxjs';
import {CategoryDAO} from '../interface/CategoryDAO';
import {CommonService} from './CommonService';

// глобальная переменная для хранения URL
export const CATEGORY_URL_TOKEN = new InjectionToken<string>('url');

// класс реализовывает методы доступа к данным с помощью RESTful запросов в формате JSON.
// напоминает паттер Фасад (Facade) - выдает только то, что нужно для функционала UI

// JSON формируется автоматически для параметров и результатов
@Injectable({
  providedIn: 'root'
})
export class CategoryService extends CommonService<Category> implements CategoryDAO {

  constructor(@Inject(CATEGORY_URL_TOKEN) private baseUrl,
              httpClient: HttpClient // для выполнения HTTP запросов
  ) {
    super(baseUrl, httpClient);
  }

  findCategories(categoryTo: CategoryTo): Observable<any> {
    return this.httpClient.post<Category[]>(this.baseUrl + '/search', categoryTo);
  }
}
