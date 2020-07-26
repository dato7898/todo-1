export class CategoryTo {
  text: string = null;
}

export class TaskTo {
  text = '';
  completed: number = null;
  priorityId: number = null;
  categoryId: number = null;

  pageNumber = 0;
  pageSize = 10;

  sortColumn = 'title';
  sortDirection = 'asc';
}

export class PriorityTo {
  text: string = null;
}
