import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'taskDate'
})
export class TaskDatePipe implements PipeTransform {
	
    private static dateDenominator = 1000 * 60 * 60 * 24

    transform(date: Date | string, format: string = 'mediumDate'): string { // mediumDate - форматирование по-умолчанию

    if (date == null) {
      return 'Без срока';
    }

    date = new Date(date);

    const currentDate = new Date();

    if ((date.setHours(0, 0, 0, 0) - currentDate.setHours(0, 0, 0, 0)) / TaskDatePipe.dateDenominator === 0) {
      return 'Сегодня';
    }

    if ((date.setHours(0, 0, 0, 0) - currentDate.setHours(0, 0, 0, 0)) / TaskDatePipe.dateDenominator === -1) {
      return 'Вчера';
    }

    if ((date.setHours(0, 0, 0, 0) - currentDate.setHours(0, 0, 0, 0)) / TaskDatePipe.dateDenominator === 1) {
      return 'Завтра';
    }

    return new DatePipe('ru-RU').transform(date, format); // показывать дату в нужной локали
  }

}
