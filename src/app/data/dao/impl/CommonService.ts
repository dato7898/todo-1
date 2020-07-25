import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class CommonService<T> {
  private readonly url: string;

  constructor(url: string,  // базовый URL для доступа к данным
              protected httpClient: HttpClient // для выполнения HTTP запросов
  ) {
    this.url = url;
  }

  add(t: T): Observable<T> {
    return this.httpClient.post<T>(this.url + '/add', t);
  }

  delete(id: number): Observable<T> {
    return this.httpClient.delete<T>(this.url + '/delete/' + id);
  }

  findById(id: number): Observable<T> {
    return this.httpClient.get<T>(this.url + '/id/' + id);
  }

  findAll(): Observable<T[]> {
    return this.httpClient.get<T[]>(this.url + '/all');
  }

  update(t: T): Observable<T> {
    return this.httpClient.put<T>(this.url + '/update', t);
  }
}
