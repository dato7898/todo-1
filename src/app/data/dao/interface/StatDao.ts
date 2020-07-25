import {Observable} from 'rxjs';
import {Stat} from '../../../model/Stat';

export interface StatDao {

  getOverallStat(): Observable<Stat>;

}
