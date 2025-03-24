import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-github";
import { Play } from 'lucide-react';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
}

export function SQLEditor({ value, onChange, onExecute }: SQLEditorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">SQL Query</h2>
        <button
          onClick={onExecute}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Play size={16} />
          Execute
        </button>
      </div>
      <AceEditor
        mode="sql"
        theme="github"
        value={value}
        onChange={onChange}
        name="sql-editor"
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
        }}
        style={{ width: '100%', height: '200px' }}
        className="border border-gray-300 rounded-md"
      />
    </div>
  );
}