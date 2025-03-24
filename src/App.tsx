import React, { useState, useEffect } from 'react';
import { TableList } from './components/TableList';
import { SQLEditor } from './components/SQLEditor';
import { DataTable } from './components/DataTable';
import { Upload, Download, Database as DatabaseIcon } from 'lucide-react';
import type { DatabaseState, Table } from './types';
import initSqlJs, { Database } from 'sql.js';

function App() {
  const [database, setDatabase] = useState<DatabaseState>({
    tables: [],
    currentTable: null,
  });
  const [sqlQuery, setSqlQuery] = useState('');
  const [db, setDb] = useState<Database | null>(null);
  const [SQL, setSQL] = useState<typeof import('sql.js')>(null);

  useEffect(() => {
    // Inicializar SQL.js
    initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    }).then(sql => {
      setSQL(sql);
    }).catch(err => {
      console.error('Error al cargar SQL.js:', err);
      alert('Error al cargar SQL.js');
    });
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!SQL) return;
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Crear una nueva base de datos
      const newDb = new SQL.Database(uint8Array);
      
      // Obtener todas las tablas
      const tables = newDb.exec(
        "SELECT name FROM sqlite_master WHERE type='table'"
      )[0]?.values as string[][] || [];

      // Obtener la estructura y datos de cada tabla
      const tableData = tables.map(([tableName]) => {
        const columns = newDb.exec(`PRAGMA table_info(${tableName})`)[0]?.values.map(
          (col: any[]) => ({
            name: col[1],
            type: col[2],
          })
        ) || [];

        const result = newDb.exec(`SELECT * FROM ${tableName}`)[0];
        const rows = result ? result.values.map(row => 
          Object.fromEntries(row.map((value, index) => [result.columns[index], value]))
        ) : [];

        return {
          name: tableName,
          columns,
          rows,
        };
      });

      setDb(newDb);
      setDatabase({
        tables: tableData,
        currentTable: null,
      });
    } catch (error) {
      console.error('Error al cargar la base de datos:', error);
      alert('Error al cargar la base de datos');
    }
  };

  const handleExportDatabase = () => {
    if (!db) return;

    try {
      const data = db.export();
      const blob = new Blob([data], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'database.sqlite';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar la base de datos:', error);
      alert('Error al exportar la base de datos');
    }
  };

  const handleExecuteQuery = () => {
    if (!db || !sqlQuery.trim()) return;

    try {
      const results = db.exec(sqlQuery);
      
      if (results.length > 0 && results[0].values.length > 0) {
        const result = results[0];
        const columns = result.columns.map(name => ({
          name,
          type: 'unknown',
        }));

        const rows = result.values.map(row => 
          Object.fromEntries(row.map((value, index) => [result.columns[index], value]))
        );

        const newTable: Table = {
          name: 'Query Result',
          columns,
          rows,
        };

        setDatabase(prev => ({
          ...prev,
          tables: [...prev.tables.filter(t => t.name !== 'Query Result'), newTable],
          currentTable: 'Query Result',
        }));
      } else {
        // Si la consulta no devuelve resultados, actualizar las tablas
        const tables = db.exec(
          "SELECT name FROM sqlite_master WHERE type='table'"
        )[0]?.values as string[][] || [];

        const tableData = tables.map(([tableName]) => {
          const columns = db.exec(`PRAGMA table_info(${tableName})`)[0]?.values.map(
            (col: any[]) => ({
              name: col[1],
              type: col[2],
            })
          ) || [];

          const result = db.exec(`SELECT * FROM ${tableName}`)[0];
          const rows = result ? result.values.map(row => 
            Object.fromEntries(row.map((value, index) => [result.columns[index], value]))
          ) : [];

          return {
            name: tableName,
            columns,
            rows,
          };
        });

        setDatabase({
          tables: tableData,
          currentTable: null,
        });
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      alert('Error al ejecutar la consulta SQL');
    }
  };

  const currentTableData = database.tables.find(
    (table) => table.name === database.currentTable
  );

  return (
    <div className="flex h-screen bg-white">
      <TableList
        tables={database.tables}
        currentTable={database.currentTable}
        onSelectTable={(tableName) =>
          setDatabase((prev) => ({ ...prev, currentTable: tableName }))
        }
      />
      
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DatabaseIcon size={24} />
            SQLite Manager
          </h1>
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer transition-colors">
              <Upload size={16} />
              Import Database
              <input
                type="file"
                accept=".sqlite,.db"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleExportDatabase}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={!db}
            >
              <Download size={16} />
              Export Database
            </button>
          </div>
        </div>

        <SQLEditor
          value={sqlQuery}
          onChange={setSqlQuery}
          onExecute={handleExecuteQuery}
        />

        <div className="mt-6 flex-1 overflow-auto">
          {currentTableData ? (
            <DataTable table={currentTableData} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a table or execute a query to view data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;