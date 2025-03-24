export interface DatabaseState {
  tables: Table[];
  currentTable: string | null;
}

export interface Table {
  name: string;
  columns: Column[];
  rows: any[];
}

export interface Column {
  name: string;
  type: string;
}