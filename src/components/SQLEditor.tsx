import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-github";
import { Play } from "lucide-react";
import "ace-builds/src-noconflict/theme-monokai";

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
}

const styleButton = (disabled: boolean) =>
  `flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
    disabled
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-blue-950 text-white hover:text-blue-950 border-blue-300 hover:bg-blue-100"
  }`;

export function SQLEditor({ value, onChange, onExecute }: SQLEditorProps) {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-blue-950">SQL Query</h2>
        <button
          onClick={onExecute}
          className={styleButton(!value.trim())}
          disabled={!value.trim()}
        >
          <Play size={16} />
          Execute
        </button>
      </div>
      <AceEditor
        mode="sql"
        theme="monokai"
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
        style={{ width: "100%", height: "200px" }}
        className="border border-gray-300 rounded-md"
      />
    </div>
  );
}
