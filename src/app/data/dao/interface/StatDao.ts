import {Observable} from 'rxjs';
import {Stat} from '../../../model/Stat';

export interface StatDAO {

  getOverallStat(): Observable<Stat>;

}
