import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {DataHandlerService} from '../../service/data-handler.service';
import {Category} from '../../model/Category';
import {MatDialog} from '@angular/material/dialog';
import { EditCategoryDialogComponent } from 'src/app/dialog/edit-category-dialog/edit-category-dialog.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  @Input() categories: Category[];
  @Output() selectCategory = new EventEmitter<Category>();
  @Input() selectedCategory: Category;
  @Output() deleteCategory = new EventEmitter<Category>();
  @Output() updateCategory = new EventEmitter<Category>();

  // для отображения иконки редактирования при наведении на категорию
  indexMouseMove: number;

  constructor(
    private dataHandler: DataHandlerService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {

  }

  showTasksByCategory(category: Category) {
    if (this.selectedCategory === category) {
      return;
    }
    this.selectedCategory = category;

    // вызываем внешний обработчик и передаем туда выбранную категорию
    this.selectCategory.emit(this.selectedCategory);
  }

  // сохраняет индекс записи категории, над который в данный момент проходит мышка (и там отображается иконка редактирования)
  showEditIcon(index: number) {
    this.indexMouseMove = index;
  }

  // диалоговое окно для редактирования категории
  openEditCategoryDialog(category: Category) {
    // открытие диалогового окна
    const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
      data: [category.title, 'Редактирование категории'],
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteCategory.emit(category);
        return;
      }

      if (typeof (result) === 'string') { // если нажали ОК и есть результат
        category.title = result as string;
        this.updateCategory.emit(category);
        return;
      }
    });
  }
}
