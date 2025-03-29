import React, { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Table as TableType } from "../types";
import {
  FileSpreadsheet,
  Download,
  Upload,
  Code,
  Database,
} from "lucide-react";
import * as XLSX from "xlsx";

interface DataTableProps {
  table: TableType;
  onUpdateColumns?: (columns: typeof table.columns) => void;
  allTables?: TableType[];
}

export function DataTable({
  table,
  onUpdateColumns,
  allTables,
}: DataTableProps) {
  const [selectedColumns, setSelectedColumns] = useState(
    table.columns.map((col) => ({ ...col, selected: true }))
  );

  const columnHelper = createColumnHelper<any>();

  const columns = table.columns.map((col) =>
    columnHelper.accessor(col.name, {
      header: () => (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={
              selectedColumns.find((c) => c.name === col.name)?.selected ?? true
            }
            onChange={(e) => {
              const newColumns = selectedColumns.map((c) =>
                c.name === col.name ? { ...c, selected: e.target.checked } : c
              );
              setSelectedColumns(newColumns);
              onUpdateColumns?.(newColumns);
            }}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span>{col.name}</span>
        </div>
      ),
      cell: (info) => info.getValue(),
    })
  );

  const tableInstance = useReactTable({
    data: table.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const getSelectedData = (data: any[], onlySelected = true) => {
    return data.map((row) => {
      const filteredRow = {};
      selectedColumns.forEach((col) => {
        if (!onlySelected || col.selected) {
          filteredRow[col.name] = row[col.name];
        }
      });
      return filteredRow;
    });
  };

  const handleExportExcel = () => {
    const filteredData = getSelectedData(table.rows, true);
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, table.name);
    XLSX.writeFile(wb, `${table.name}.xlsx`);
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      console.log("Imported data:", jsonData);
      // TODO: Implement data insertion into SQLite database
    };
    reader.readAsArrayBuffer(file);
  };

  const generatePrismaSeed = () => {
    const tableName = table.name.toLowerCase();
    const filteredData = getSelectedData(table.rows, true);
    const seedContent = `await prisma.${tableName}.createMany({\n  data: ${JSON.stringify(
      filteredData,
      null,
      2
    )},\n});`;

    const blob = new Blob([seedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tableName}-seed.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateFullDatabaseSeed = () => {
    if (!allTables) return;

    const seedContent = allTables
      .map((currentTable) => {
        const tableName = currentTable.name.toLowerCase();
        const data = currentTable.rows.map((row) => {
          const fullRow = {};
          currentTable.columns.forEach((col) => {
            fullRow[col.name] = row[col.name];
          });
          return fullRow;
        });
        return `await prisma.${tableName}.createMany({\n  data: ${JSON.stringify(
          data,
          null,
          2
        )},\n});`;
      })
      .join("\n\n");

    const blob = new Blob([seedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "full-database-seed.ts";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const styleButton = "flex items-center gap-2 px-4 py-2 bg-blue-950 text-white hover:text-blue-950 rounded-md border-blue-300 hover:bg-blue-100 cursor-pointer transition-colors";

  return (
    <div className="flex flex-col">
      <div className="flex justify-end gap-4 mb-4">
        <button
          onClick={handleExportExcel}
          className={styleButton}
        >
          <FileSpreadsheet size={16} />
          Export to Excel
        </button>

        <label className={styleButton}>
          <Upload size={16} />
          Import from Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="hidden"
          />
        </label>

        <button
          onClick={generatePrismaSeed}
          className={styleButton}
        >
          <Code size={16} />
          Generate Table Seed
        </button>

        <button
          onClick={generateFullDatabaseSeed}
          className={styleButton}
        >
          <Database size={16} />
          Generate Full Database Seed
        </button>
      </div>

      <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            {tableInstance.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableInstance.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-sm text-gray-500">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
