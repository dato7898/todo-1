import {CommonDAO} from './CommonDAO';
import {Priority} from '../../../model/Priority';
import {Observable} from 'rxjs';
import {PriorityTo} from '../to/ObjectsTo';

export interface PriorityDAO extends CommonDAO<Priority> {

  findPriorities(priorityTo: PriorityTo): Observable<any>;

}
