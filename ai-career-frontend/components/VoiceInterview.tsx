"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  RotateCcw,
} from "lucide-react";

interface VoiceInterviewProps {
  question: string;
  onAnswer: (answer: string, duration: number) => void;
  disabled?: boolean;
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: SpeechRecognitionResult;
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;

  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;

  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function VoiceInterview({
  question,
  onAnswer,
  disabled = false,
}: VoiceInterviewProps) {
  const recognitionRef =
    useRef<SpeechRecognitionLike | null>(null);

  const startTimeRef = useRef<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isListening, setIsListening] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [transcript, setTranscript] = useState("");

  const [duration, setDuration] = useState(0);

  const [supported, setSupported] = useState(true);

  const [error, setError] = useState("");

  /*
   * Check browser support
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-US";

    /*
     * Recording started
     */
    recognition.onstart = () => {
      setIsListening(true);

      setError("");

      startTimeRef.current = Date.now();

      setDuration(0);

      /*
       * Start timer
       */
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const seconds = Math.round(
            (Date.now() - startTimeRef.current) / 1000
          );

          setDuration(seconds);
        }
      }, 1000);
    };

    /*
     * Recording stopped
     */
    recognition.onend = () => {
      setIsListening(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);

        timerRef.current = null;
      }

      /*
       * Save final duration
       */
      if (startTimeRef.current) {
        const finalDuration = Math.round(
          (Date.now() - startTimeRef.current) / 1000
        );

        setDuration(finalDuration);
      }
    };

    /*
     * Speech recognition error
     */
    recognition.onerror = (event) => {
      setIsListening(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);

        timerRef.current = null;
      }

      switch (event.error) {
        case "not-allowed":
          setError(
            "Microphone permission was denied. Please allow microphone access."
          );
          break;

        case "no-speech":
          setError(
            "No speech detected. Please speak clearly and try again."
          );
          break;

        case "audio-capture":
          setError(
            "No microphone was detected. Please check your microphone."
          );
          break;

        case "network":
          setError(
            "Speech recognition needs a network connection."
          );
          break;

        default:
          setError(
            "Speech recognition failed. Please try again."
          );
      }
    };

    /*
     * Speech result
     */
    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (
        let i = 0;
        i < event.results.length;
        i++
      ) {
        const result = event.results[i];

        if (result && result[0]) {
          finalTranscript +=
            result[0].transcript + " ";
        }
      }

      setTranscript(finalTranscript.trim());
    };

    recognitionRef.current = recognition;

    /*
     * Cleanup
     */
    return () => {
      recognition.abort();

      if (timerRef.current) {
        clearInterval(timerRef.current);

        timerRef.current = null;
      }

      recognitionRef.current = null;
    };
  }, []);

  /*
   * Start voice recording
   */
  const startListening = () => {
    if (!recognitionRef.current) {
      setError(
        "Speech recognition is not available."
      );

      return;
    }

    if (disabled) {
      return;
    }

    setError("");

    setTranscript("");

    setDuration(0);

    startTimeRef.current = Date.now();

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.warn(
        "Speech recognition could not start:",
        error
      );
    }
  };

  /*
   * Stop voice recording
   */
  const stopListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.warn(
        "Speech recognition could not stop:",
        error
      );
    }
  };

  /*
   * Read question aloud
   */
  const speakQuestion = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("speechSynthesis" in window)) {
      setError(
        "Text-to-speech is not supported in this browser."
      );

      return;
    }

    window.speechSynthesis.cancel();

    setError("");

    const utterance =
      new SpeechSynthesisUtterance(question);

    utterance.lang = "en-US";

    utterance.rate = 0.95;

    utterance.pitch = 1;

    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);

      setError(
        "Unable to play the question."
      );
    };

    window.speechSynthesis.speak(
      utterance
    );
  };

  /*
   * Stop AI voice
   */
  const stopSpeaking = () => {
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();

      setIsSpeaking(false);
    }
  };

  /*
   * Clear answer
   */
  const clearAnswer = () => {
    setTranscript("");

    setDuration(0);

    setError("");

    startTimeRef.current = null;
  };

  /*
   * Submit voice answer
   */
  const submitVoiceAnswer = () => {
    const cleanAnswer = transcript.trim();

    if (!cleanAnswer) {
      setError(
        "Please record or enter an answer first."
      );

      return;
    }

    const finalDuration =
      duration > 0
        ? duration
        : startTimeRef.current
          ? Math.round(
              (Date.now() -
                startTimeRef.current) /
                1000
            )
          : 0;

    onAnswer(
      cleanAnswer,
      finalDuration
    );
  };

  /*
   * Format seconds
   */
  const formatDuration = (
    seconds: number
  ) => {
    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /*
   * Unsupported browser
   */
  if (!supported) {
    return (
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="font-bold text-amber-900">
          Voice Interview Not Supported
        </h3>

        <p className="mt-2 text-sm text-amber-800">
          Your browser does not support
          Speech Recognition.
        </p>

        <p className="mt-1 text-sm text-amber-700">
          Please use Google Chrome or
          Microsoft Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-100 p-2">
              <Mic
                size={20}
                className="text-blue-600"
              />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              AI Voice Interview
            </h3>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Speak your answer and CareerAI
            will convert your speech into
            text.
          </p>
        </div>

        {/* Hear question */}
        {!isSpeaking ? (
          <button
            type="button"
            onClick={speakQuestion}
            disabled={
              disabled || isListening
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Volume2 size={18} />

            Hear Question
          </button>
        ) : (
          <button
            type="button"
            onClick={stopSpeaking}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Square size={16} />

            Stop Voice
          </button>
        )}
      </div>

      {/* Question */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Interview Question
        </p>

        <p className="mt-2 text-base font-medium leading-7 text-slate-900">
          {question}
        </p>
      </div>

      {/* Recording controls */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!isListening ? ( <button
        type="button"
        onClick={startListening}
        disabled={disabled}
        className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
        <MicOff size={20} />

        Start Recording
    </button>
        ) : (
          <button
            type="button"
            onClick={stopListening}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            <Square size={18} />

            Stop Recording
          </button>
        )}

        {/* Timer */}
        <div className="rounded-xl bg-slate-100 px-4 py-3 font-mono text-sm font-semibold text-slate-700">
          ⏱ {formatDuration(duration)}
        </div>

        {/* Clear */}
        {transcript && !isListening && (
          <button
            type="button"
            onClick={clearAnswer}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw size={18} />

            Clear
          </button>
        )}
      </div>

      {/* Listening status */}
      {isListening && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-red-50 p-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />

            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
          </span>

          <span className="text-sm font-semibold text-red-700">
            Listening... Speak your answer.
          </span>
        </div>
      )}

      {/* Transcript */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">
            Your Answer
          </label>

          {transcript && (
            <span className="text-xs text-slate-500">
              {transcript.trim().split(/\s+/)
                .length}{" "}
              words
            </span>
          )}
        </div>

        <textarea
          value={transcript}
          onChange={(event) =>
            setTranscript(
              event.target.value
            )
          }
          rows={7}
          placeholder="Your spoken answer will appear here. You can also edit the transcript before submitting."
          disabled={disabled}
          className="mt-2 w-full resize-y rounded-xl border border-slate-300 p-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <strong>Error:</strong>{" "}
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={submitVoiceAnswer}
        disabled={
          !transcript.trim() ||
          disabled ||
          isListening
        }
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Mic size={19} />

        Submit Voice Answer
      </button>

      {/* Info */}
      <p className="mt-3 text-center text-xs text-slate-400">
        Your voice is converted to text in
        the browser before submission.
      </p>
    </div>
  );
}