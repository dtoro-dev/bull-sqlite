import { Database } from 'lucide-react';
import type { Table } from '../types';

interface TableListProps {
  tables: Table[];
  currentTable: string | null;
  onSelectTable: (tableName: string) => void;
}

export function TableList({ tables, currentTable, onSelectTable }: TableListProps) {
  return (
    <div className="w-64 text-white bg-blue-950 p-4 border-r border-gray-200 h-dvh overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Database size={20} />
        Tables
      </h2>
      <ul className="space-y-2">
        {tables.map((table) => (
          <li key={table.name}>
            <button
              onClick={() => onSelectTable(table.name)}
              className={`w-full text-left px-4 text-white py-2 rounded-md transition-colors ${
                currentTable === table.name
                  ? 'bg-blue-800'
                  : 'hover:bg-gray-100  hover:text-blue-950'
              }`}
            >
              {table.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}