"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Search,
} from "lucide-react";

type Question = {
  id: number;
  question: string;
  category: string;
  level: string;
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      question: "What is React?",
      category: "Frontend",
      level: "Beginner",
    },
    {
      id: 2,
      question: "Explain Docker architecture.",
      category: "DevOps",
      level: "Intermediate",
    },
    {
      id: 3,
      question:
        "What is overfitting in Machine Learning?",
      category: "AI/ML",
      level: "Intermediate",
    },
  ]);

  const [newQuestion, setNewQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [search, setSearch] = useState("");

  const addQuestion = () => {
    if (
      newQuestion.trim() === "" ||
      category.trim() === ""
    ) {
      return;
    }

    const question: Question = {
      id: Date.now(),
      question: newQuestion,
      category,
      level,
    };

    setQuestions((currentQuestions) => [
      ...currentQuestions,
      question,
    ]);

    setNewQuestion("");
    setCategory("");
    setLevel("Beginner");
  };

  const deleteQuestion = (id: number) => {
    setQuestions((currentQuestions) =>
      currentQuestions.filter(
        (question) => question.id !== id
      )
    );
  };

  const filteredQuestions = questions.filter(
    (question) =>
      question.question
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      question.category
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">
        Interview Questions
      </h1>

      <p className="mt-2 text-slate-500">
        Manage the CareerAI question bank.
      </p>

      {/* Add Question */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Add New Question
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) =>
              setNewQuestion(e.target.value)
            }
            placeholder="Enter interview question"
            className="rounded-xl border border-slate-300 p-3 md:col-span-3"
          />

          <input
            type="text"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            placeholder="Category"
            className="rounded-xl border border-slate-300 p-3"
          />

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-xl border border-slate-300 p-3"
          >
            <option value="Beginner">
              Beginner
            </option>

            <option value="Intermediate">
              Intermediate
            </option>

            <option value="Expert">
              Expert
            </option>
          </select>

          <button
            onClick={addQuestion}
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 p-3 font-semibold text-white hover:bg-purple-700"
          >
            <Plus size={18} />
            Add Question
          </button>
        </div>
      </div>

      {/* Question List */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-3.5 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-xl border border-slate-300 p-3 pl-10"
          />
        </div>

        <div className="mt-6 space-y-4">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-5 md:flex-row md:items-center"
            >
              <div>
                <h3 className="font-semibold text-slate-900">
                  {question.question}
                </h3>

                <div className="mt-2 flex gap-2">
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700">
                    {question.category}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {question.level}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  deleteQuestion(question.id)
                }
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}