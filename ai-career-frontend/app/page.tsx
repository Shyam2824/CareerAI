import Navbar from "@/components/Navbar";
import ResumeUpload from "@/components/ResumeUpload";
import {
  Brain,
  FileSearch,
  Mic,
  Users,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <FileSearch size={26} />,
      title: "ATS Resume Analysis",
      description:
        "Find out how well your resume performs against ATS systems.",
    },
    {
      icon: <Brain size={26} />,
      title: "AI Career Intelligence",
      description:
        "Discover skill gaps and get personalized career recommendations.",
    },
    {
      icon: <Mic size={26} />,
      title: "AI Voice Interview",
      description:
        "Practice realistic interviews and improve your confidence.",
    },
    {
      icon: <Users size={26} />,
      title: "Human Mentors",
      description:
        "Connect with experienced mentors for personalized guidance.",
    },
  ];

  return (
    <main className="min-h-screen">

      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-20">

        <div className="mx-auto max-w-5xl text-center">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Brain size={16} />
            AI Powered Career Intelligence
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Know Your Resume ATS Score
            <span className="block text-blue-600">
              ATS Score Before Applying
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Upload your resume for free and discover how recruiters
            and Applicant Tracking Systems evaluate your profile.
          </p>

          <div className="mt-10">
          <ResumeUpload />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm text-slate-500">

            <span className="flex items-center gap-2">
              <CheckCircle2
                size={17}
                className="text-green-600"
              />
              PDF & DOCX
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2
                size={17}
                className="text-green-600"
              />
              Free ATS Score
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2
                size={17}
                className="text-green-600"
              />
              AI Powered Analysis
            </span>

          </div>
        </div>

      </section>

      {/* FEATURES */}
      <section className="bg-white px-6 py-20">

        <div className="mx-auto max-w-6xl">

          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">
              More Than Just an ATS Checker
            </h2>

            <p className="mt-3 text-slate-600">
              Your complete AI-powered career preparation platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 w-fit rounded-xl bg-blue-50 p-3 text-blue-600">
                  {feature.icon}
                </div>

                <h3 className="font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

    </main>
  );
}