import {CommonDAO} from './CommonDAO';
import {Category} from '../../../model/Category';
import {Observable} from 'rxjs';
import { CategoryTo } from '../to/ObjectsTo';

export interface CategoryDAO extends CommonDAO<Category> {

  findCategories(categoryTo: CategoryTo): Observable<any>;

}
