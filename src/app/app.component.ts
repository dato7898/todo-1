import {Component, OnInit} from '@angular/core';
import {Task} from './model/Task';
import {Category} from './model/Category';
import {Priority} from './model/Priority';
import {zip} from 'rxjs';
import {concatMap, map} from 'rxjs/operators';
import {IntroService} from './service/intro.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import { CategoryService } from './data/dao/impl/CategoryService';
import { CategoryTo } from './data/dao/to/ObjectsTo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Todo';
  categories: Category[];
  selectedCategory: Category = null;

  // статистика
  uncompletedCountForCategoryAll: number;

  // параметры поисков
  categoryTo = new CategoryTo(); // экземпляр можно создать тут же, т.к. не загружаем из cookies

  // показать/скрыть статистику
  showStat = true;

  // параметры бокового меню с категориями
  menuOpened: boolean; // открыть-закрыть
  menuMode: string; // тип выдвижения (поверх, с толканием и пр.)
  menuPosition: string; // сторона
  showBackdrop: boolean; // показывать фоновое затемнение или нет

  // тип устройства
  isMobile: boolean;
  isTablet: boolean;

  constructor(
      private categoryService: CategoryService,
      private introService: IntroService,
      private deviceService: DeviceDetectorService // для определения типа устройства (моб., десктоп, планшет)
  ) {
    // определяем тип запроса
    this.isMobile = deviceService.isMobile();
    this.isTablet = deviceService.isTablet();

    this.showStat = !this.isMobile; // если моб. устройство, то по-умолчанию не показывать статистику

    this.setMenuValues(); // установить настройки меню
  }

  ngOnInit(): void {
    // this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
    // this.dataHandler.getAllPriorities().subscribe(priorities => this.priorities = priorities);

    // заполнить меню с категориями
    this.fillAllCategories();
    this.selectCategory(null);

    // для мобильных и планшетов - не показывать интро
    if (!this.isMobile && !this.isTablet) {
      // пробуем показать приветственные справочные материалы
      this.introService.startIntroJS(true);
    }
  }

  addCategory(category: Category) {
    this.categoryService.add(category).subscribe(result => {

      }
    );
  }

  deleteCategory(category: Category) {
    this.categoryService.delete(category.id).subscribe(cat => {

    });
  }

  updateCategory(category: Category) {
    this.categoryService.update(category).subscribe(() => {

    });
  }

  // заполняет категории и кол-во невыполненных задач по каждой из них (нужно для отображения категорий)
  fillAllCategories() {
    this.categoryService.findAll().subscribe(result => {
      this.categories = result;
    });
  }

  // поиск категории
  searchCategory(categoryTo: CategoryTo) {
    this.categoryService.findCategories(categoryTo).subscribe(result => {
      this.categories = result;
    });
  }

  selectCategory(category: Category) {

  }

  // если закрыли меню любым способом - ставим значение false
  onClosedMenu() {
    this.menuOpened = false;
  }

  // параметры меню
  setMenuValues() {
    this.menuPosition = 'left'; // меню слева

    // настройки бокового меню для моб. и десктоп вариантов
    if (this.isMobile) {
      this.menuOpened = false; // на моб. версии по-умолчанию меню будет закрыто
      this.menuMode = 'over'; // поверх всего контента
      this.showBackdrop = true; // показывать темный фон или нет (нужно для мобильной версии)
    } else {
      this.menuOpened = true; // НЕ в моб. версии  по-умолчанию меню будет открыто (т.к. хватает места)
      this.menuMode = 'push'; // будет "толкать" основной контент, а не закрывать его
      this.showBackdrop = false; // показывать темный фон или нет
    }

  }

  // показать-скрыть меню
  toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }
}
