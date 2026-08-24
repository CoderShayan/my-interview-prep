import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Loader2, Terminal, Eraser } from "lucide-react";

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;

declare global {
  interface Window {
    loadPyodide?: (opts?: { indexURL?: string }) => Promise<any>;
    __pyodidePromise?: Promise<any>;
  }
}

function loadPyodideOnce(onLog: (s: string) => void) {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.__pyodidePromise) return window.__pyodidePromise;

  window.__pyodidePromise = new Promise<any>((resolve, reject) => {
    const start = () => {
      window
        .loadPyodide!({ indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/` })
        .then(resolve)
        .catch(reject);
    };
    if (window.loadPyodide) return start();
    const s = document.createElement("script");
    s.src = PYODIDE_URL;
    s.onload = start;
    s.onerror = () => reject(new Error("Pyodide load failed"));
    document.head.appendChild(s);
  }).then((py) => {
    py.setStdout({ batched: (t: string) => onLog(t) });
    py.setStderr({ batched: (t: string) => onLog(t) });
    return py;
  });

  return window.__pyodidePromise;
}

export function PythonRunner({ initialCode, compact }: { initialCode: string; compact?: boolean }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "running">("idle");
  const pyRef = useRef<any>(null);
  const outRef = useRef<HTMLPreElement>(null);
  const logRef = useRef<(s: string) => void>(() => {});

  logRef.current = (s: string) => setOutput((o) => [...o, s]);

  useEffect(() => {
    setCode(initialCode);
    setOutput([]);
  }, [initialCode]);

  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight });
  }, [output]);

  async function ensurePy() {
    if (pyRef.current) return pyRef.current;
    setStatus("loading");
    const py = await loadPyodideOnce((s) => logRef.current(s));
    pyRef.current = py;
    setStatus("ready");
    return py;
  }

  async function run() {
    setOutput([]);
    try {
      const py = await ensurePy();
      setStatus("running");
      const result = await py.runPythonAsync(code);
      if (result !== undefined && result !== null) logRef.current(String(result));
    } catch (e: any) {
      logRef.current(String(e?.message ?? e));
    } finally {
      setStatus("ready");
    }
  }

  const busy = status === "loading" || status === "running";

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-border bg-muted/50">
        <div className="mono-label flex items-center gap-1.5 min-w-0">
          <Terminal className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Python playground</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setCode(initialCode); setOutput([]); }} aria-label="Reset code">
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOutput([])} aria-label="Clear output">
            <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
          <Button size="sm" onClick={run} disabled={busy} aria-label="Run Python code">
            {busy ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" aria-hidden="true" /> : <Play className="w-3.5 h-3.5 mr-1" aria-hidden="true" />}
            {status === "loading" ? "Loading…" : status === "running" ? "Running…" : "Run"}
          </Button>
        </div>
      </div>

      <label htmlFor="py-code" className="sr-only">Python code</label>
      <textarea
        id="py-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        className={`w-full font-mono text-[12.5px] sm:text-sm leading-relaxed bg-card p-3 sm:p-4 outline-none resize-y ${compact ? "min-h-[150px]" : "min-h-[220px]"}`}
      />

      <div className="border-t border-border bg-foreground text-background">
        <div className="px-3 sm:px-4 pt-2 mono-label !text-background/60">Output</div>
        <pre
          ref={outRef}
          role="log"
          aria-live="polite"
          aria-label="Python output"
          className="px-3 sm:px-4 pb-3 pt-1 font-mono text-[12px] sm:text-[13px] whitespace-pre-wrap max-h-56 overflow-y-auto"
        >
{output.length ? output.join("") : status === "loading" ? "Python interpreter load ho raha hai (pehli baar ~5-10s)…" : "Run dabao — output yahan aayega."}
        </pre>
      </div>
    </div>
  );
}
