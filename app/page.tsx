"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [output, setOutput] = useState("");
  const [answerIsCached, setAnswerIsCached] = useState(false);
  const [neuronPath, setNeuronPath] = useState("");
  const [bypassCache, setBypassCache] = useState(false);

  useEffect(() => {
    const savedNeuronPath = localStorage.getItem("neuronPath");
    if (savedNeuronPath) {
      setNeuronPath(savedNeuronPath);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("neuronPath", neuronPath);
  }, [neuronPath]);

  const handleRun = async () => {
    try {
      setIsLoading(true);
      setOutput("");
      const input = document.querySelector("textarea")?.value || "";
      const url = `https://run.prompteus.com/${neuronPath}${
        bypassCache ? "?bypassCache=true" : ""
      }`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();
      setOutput(data.output);
      setAnswerIsCached(data.fromCache ?? false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 bg-gray-100 h-screen w-screen gap-2">
      <div className="col-span-1 p-4 flex flex-col">
        <div className="flex items-center flex-row mb-2 h-8">
          <p className="font-mono">https://run.prompteus.com/</p>
          <input
            type="text"
            className="font-mono rounded flex-grow focus:outline-none font-bold"
            placeholder="organization/neuron-slug"
            value={neuronPath}
            onChange={(e) => setNeuronPath(e.target.value)}
          />
        </div>
        <div className="flex-grow flex flex-col">
          <textarea
            className="resize-none rounded-lg bg-white w-full flex-grow p-2 border border-gray-300 font-mono"
            placeholder="Your input"
          ></textarea>
          <div className="w-full flex justify-end items-center space-x-4">
            <label className="flex items-center space-x-2 mt-3">
              <input
                type="checkbox"
                checked={bypassCache}
                onChange={() => setBypassCache(!bypassCache)}
              />
              <span className="text-sm font-mono">Bypass Cache</span>
            </label>
            <button
              className="mt-4 bg-gray-500 rounded-lg hover:bg-blue-700 text-white font-bold py-2 px-4"
              onClick={handleRun}
            >
              Run
            </button>
          </div>
        </div>
      </div>
      <div className="col-span-1 p-4 h-full w-full flex flex-col">
        <div className=" border border-gray-300 flex-grow rounded-lg p-4 mt-10 bg-gray-200">
          {output && answerIsCached && (
            <div className="text-xs text-amber-800 bg-amber-100 rounded-lg p-1 absolute z-10 top-11 right-6 border border-amber-300">
              CACHED
            </div>
          )}
          {output ? (
            <pre className="font-mono whitespace-pre-wrap">{output}</pre>
          ) : (
            <>
              {" "}
              {isLoading ? (
                <p className="font-mono animate-pulse">Loading...</p>
              ) : (
                <p className="font-mono">
                  Output will appear here after running the prompt.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
