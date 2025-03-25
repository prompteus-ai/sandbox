"use client";

import { useEffect, useState, Suspense } from "react";
import { Prompteus } from "@prompteus-ai/neuron-runner";
import { useSearchParams, useRouter } from "next/navigation";

interface NeuronErrorResponse {
  error: string;
  statusCode: number;
}

function SandboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string | Record<string, unknown>>("");
  const [answerIsCached, setAnswerIsCached] = useState(false);
  const [neuronPath, setNeuronPath] = useState("");
  const [bypassCache, setBypassCache] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [isExecutionStopped, setIsExecutionStopped] = useState(false);

  useEffect(() => {
    const savedAuthToken = localStorage.getItem("authToken");
    if (savedAuthToken) {
      setAuthToken(savedAuthToken);
    }
  }, []);

  useEffect(() => {
    const neuronPathFromUrl = searchParams.get("neuron");
    if (neuronPathFromUrl) {
      setNeuronPath(decodeURIComponent(neuronPathFromUrl));
    } else {
      const savedNeuronPath = localStorage.getItem("neuronPath");
      if (savedNeuronPath) {
        setNeuronPath(savedNeuronPath);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (neuronPath) {
      localStorage.setItem("neuronPath", neuronPath);
      const params = new URLSearchParams(searchParams.toString());
      params.set("neuron", encodeURIComponent(neuronPath));
      router.push(`?${params.toString()}`);
    }
  }, [neuronPath, router, searchParams]);

  useEffect(() => {
    localStorage.setItem("authToken", authToken);
  }, [authToken]);

  const handleRun = async () => {
    try {
      setIsLoading(true);
      setOutput("");
      const input = document.querySelector("textarea")?.value || "";

      // Split the neuron path into org and neuron slugs
      const [orgSlug, neuronSlug] = neuronPath.split("/");
      if (!orgSlug || !neuronSlug) {
        throw new Error("Invalid neuron path. Use format: organization/neuron-slug");
      }

      const client = new Prompteus({
        jwtOrApiKey: authToken || undefined
      });

      const result = await client.callNeuron(orgSlug, neuronSlug, {
        input,
        bypassCache,
        rawOutput: false
      });

      setOutput(result.output || "");
      setAnswerIsCached(result.fromCache ?? false);
      setIsExecutionStopped(result.executionStopped ?? false);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'statusCode' in error && 'error' in error) {
        const neuronError = error as NeuronErrorResponse;
        const errorMessage = `API Error ${neuronError.statusCode}: ${neuronError.error}`;
        setOutput(`Error: ${errorMessage}`);
      } else {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        setOutput(`Error: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 h-screen w-screen gap-2 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="col-span-1 p-4 flex flex-col">
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex items-center flex-row h-8 w-full">
            <p className="font-mono text-gray-800 dark:text-gray-200">
              Neuron Path:
            </p>
            <input
              type="text"
              className="font-mono rounded flex-grow ml-2 p-1 focus:outline-none font-bold bg-transparent border border-gray-300 dark:border-gray-600 dark:text-white"
              placeholder="organization/neuron-slug"
              value={neuronPath}
              onChange={(e) => setNeuronPath(e.target.value)}
            />
          </div>
          <div className="flex items-center flex-row h-8 w-full">
            <input
              type="password"
              className="font-mono rounded w-full p-1 focus:outline-none border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
              placeholder="API Key or JWT (optional)"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 ml-2 leading-tight min-w-80">
              Note: Credentials are required for private neurons. <br/>The sandbox respects all neuron security settings.
            </p>
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
              disabled={isLoading}
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
              {typeof output === "string"
                ? output
                : JSON.stringify(output, null, 2)}
            </pre>
          ) : (
            <>
              {isLoading ? (
                <p className="font-mono animate-pulse text-gray-800 dark:text-gray-200">
                  Loading...
                </p>
              ) : isExecutionStopped ? (
                <p className="font-mono text-gray-800 dark:text-gray-200">
                  Execution stopped after running the prompt.
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-2 h-screen w-screen gap-2 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <div className="col-span-1 p-4 flex flex-col">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="col-span-1 p-4">
          <div className="animate-pulse">
            <div className="h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <SandboxContent />
    </Suspense>
  );
}
