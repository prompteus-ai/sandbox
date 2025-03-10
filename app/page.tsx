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
    <div className="grid grid-cols-2 h-screen w-screen gap-2 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="col-span-1 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center flex-row h-8 w-full">
            <p className="font-mono text-gray-800 dark:text-gray-200">
              https://run.prompteus.com/
            </p>
            <input
              type="text"
              className="font-mono rounded flex-grow focus:outline-none font-bold bg-transparent dark:text-white"
              placeholder="organization/neuron-slug"
              value={neuronPath}
              onChange={(e) => setNeuronPath(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-grow flex flex-col">
          <textarea
            className="resize-none rounded-lg w-full flex-grow p-2 border border-gray-300 dark:border-gray-600 font-mono bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            placeholder="Your input"
          ></textarea>
          <div className="w-full flex justify-end items-center space-x-4">
            <label className="flex items-center space-x-2 mt-3">
              <input
                type="checkbox"
                checked={bypassCache}
                onChange={() => setBypassCache(!bypassCache)}
                className="accent-gray-500 dark:accent-gray-400"
              />
              <span className="text-sm font-mono text-gray-800 dark:text-gray-200">
                Bypass Cache
              </span>
            </label>
            <button
              className="mt-4 bg-gray-500 dark:bg-gray-600 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-2 px-4 transition-colors"
              onClick={handleRun}
            >
              Run
            </button>
          </div>
        </div>
      </div>
      <div className="col-span-1 p-4 h-full w-full flex flex-col">
        <div className="border border-gray-300 dark:border-gray-600 flex-grow rounded-lg p-4 mt-10 bg-gray-200 dark:bg-gray-800">
          {output && answerIsCached && (
            <div className="text-xs text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/50 rounded-lg p-1 absolute z-10 top-11 right-6 border border-amber-300 dark:border-amber-700">
              CACHED
            </div>
          )}
          {output ? (
            <pre className="font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {output}
            </pre>
          ) : (
            <>
              {isLoading ? (
                <p className="font-mono animate-pulse text-gray-800 dark:text-gray-200">
                  Loading...
                </p>
              ) : (
                <p className="font-mono text-gray-800 dark:text-gray-200">
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
