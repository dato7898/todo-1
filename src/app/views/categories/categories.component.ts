import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Category} from '../../model/Category';
import {MatDialog} from '@angular/material/dialog';
import {EditCategoryDialogComponent} from 'src/app/dialog/edit-category-dialog/edit-category-dialog.component';
import {DeviceDetectorService} from 'ngx-device-detector';
import {CategoryTo} from '../../data/dao/to/ObjectsTo';
import {DialogAction} from '../../object/DialogResult';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[];

  @Input('categories')
  set setCategories(categories: Category[]) {
    this.categories = categories;
  }

  @Input() categoryTo: CategoryTo;
  @Input() selectedCategory: Category;
  @Input() uncompletedCountForCategoryAll: number;

  @Output() selectCategory = new EventEmitter<Category>();
  @Output() deleteCategory = new EventEmitter<Category>();
  @Output() updateCategory = new EventEmitter<Category>();
  @Output() addCategory = new EventEmitter<Category>();
  @Output() searchCategory = new EventEmitter<CategoryTo>(); // передаем строку для поиска

  // для отображения иконки редактирования при наведении на категорию
  indexMouseMove: number;
  showEditIconCategory: boolean; // показывать ли иконку редактирования категории
  filterTitle: string; // текущее значение для поиска категорий
  filterChanged: boolean; // были ли изменения в параметре поиска
  isMobile: boolean;
  isTablet: boolean;

  constructor(
    private dialog: MatDialog,
    private deviceDetector: DeviceDetectorService
  ) {
    this.isMobile = deviceDetector.isMobile();
    this.isTablet = deviceDetector.isTablet();
  }

  ngOnInit(): void {

  }

  // диалоговое окно для добавления категории
  openAddDialog() {
    const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
      // передаем новый пустой объект для заполнения
      data: [new Category(null, ''), 'Добавление категории'],
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }

      if (result.action === DialogAction.SAVE) {
        this.addCategory.emit(result.obj as Category); // вызываем внешний обработчик
      }
    });
  }

  // диалоговое окно для редактирования категории
  openEditDialog(category: Category) {
    const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
      // передаем копию объекта, чтобы все изменения не касались оригинала (чтобы их можно было отменить)
      data: [new Category(category.id, category.title), 'Редактирование категории'], width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }

      if (result.action === DialogAction.DELETE) { // нажали удалить
        this.deleteCategory.emit(category); // вызываем внешний обработчик
        return;
      }

      if (result.action === DialogAction.SAVE) { // нажали сохранить (обрабатывает как добавление, так и удаление)
        this.updateCategory.emit(result.obj as Category); // вызываем внешний обработчик
        return;
      }
    });
  }

  // поиск категории
  search() {
    this.filterChanged = false; // сбросить

    if (!this.categoryTo) { // если объект с параметрами поиска непустой
      return;
    }

    this.categoryTo.text = this.filterTitle;
    this.searchCategory.emit(this.categoryTo);
  }

  showCategory(category: Category) {
    // если не изменилось значение, ничего не делать (чтобы лишний раз не делать запрос данных)
    if (this.selectedCategory === category) {
      return;
    }
    this.selectedCategory = category; // сохраняем выбранную категорию
    this.selectCategory.emit(this.selectedCategory); // вызываем внешний обработчик
  }

  // сохраняет индекс записи категории, над который в данный момент проходит мышка (и там отображается иконка редактирования)
  showEditIcon(show: boolean, index: number) {
    this.indexMouseMove = index;
    this.showEditIconCategory = show;
  }

  clearAndSearch() {
    this.filterTitle = null;
    this.search();
  }

  // проверяет, были ли изменены какие-либо параметры поиска (по сравнению со старым значением)
  checkFilterChanged() {
    this.filterChanged = this.filterTitle !== this.categoryTo.text;
    return this.filterChanged;
  }

}
