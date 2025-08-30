// CodePlayground.jsx
import { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

export default function CodePlayground() {
  const [code, setCode] = useState("// Ask AI for some code 👇");
  const [prompt, setPrompt] = useState("");

  const askAI = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/generate", {
        prompt,
      });
      setCode(res.data.result); // drop directly into editor
    } catch (err) {
      console.error("❌ Error asking AI:", err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI (e.g. make hello world in Python)"
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={askAI}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Ask AI
        </button>
      </div>

      <Editor
        height="80vh"
        defaultLanguage="javascript"
        value={code}
        onChange={(val) => setCode(val)}
        theme="vs-dark"
      />
    </div>
  );
}
