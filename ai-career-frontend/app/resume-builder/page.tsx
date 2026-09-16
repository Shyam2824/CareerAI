"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import api from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  start_year: string;
  end_year: string;
  grade: string;
}

interface Project {
  name: string;
  technologies: string;
  description: string;
  link: string;
}

interface ResumeBuilder {
  id?: number;
  title: string;
  personal_info: PersonalInfo;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: string[];
  achievements: string[];
}

const emptyResume: ResumeBuilder = {
  title: "My Resume",

  personal_info: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },

  summary: "",

  skills: [],

  experience: [],

  education: [],

  projects: [],

  certifications: [],

  achievements: [],
};

function ResumeBuilderContent() {
  const router = useRouter();

  const [resume, setResume] =
    useState<ResumeBuilder>(emptyResume);

  const [resumes, setResumes] =
    useState<ResumeBuilder[]>([]);

  const [selectedResumeId, setSelectedResumeId] =
    useState<number | null>(null);

  const [skillInput, setSkillInput] =
    useState("");

  const [certificationInput, setCertificationInput] =
    useState("");

  const [achievementInput, setAchievementInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // =====================================================
  // LOAD EXISTING RESUMES
  // =====================================================

  const loadResumes = async () => {
    try {
      const response =
        await api.get<ResumeBuilder[]>(
          "/resume-builder"
        );

      setResumes(response.data);

    } catch (error: unknown) {

      console.error(
        "Failed to load resumes:",
        error
      );
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadResumes();
  }, []);

  // =====================================================
  // UPDATE PERSONAL INFO
  // =====================================================

  const updatePersonalInfo = (
    field: keyof PersonalInfo,
    value: string
  ) => {

    setResume((previous) => ({
      ...previous,

      personal_info: {
        ...previous.personal_info,
        [field]: value,
      },
    }));
  };

  // =====================================================
  // ADD SKILL
  // =====================================================

  const addSkill = () => {

    const skill = skillInput.trim();

    if (!skill) return;

    if (
      resume.skills.some(
        (item) =>
          item.toLowerCase() === skill.toLowerCase()
      )
    ) {
      return;
    }

    setResume((previous) => ({
      ...previous,
      skills: [
        ...previous.skills,
        skill,
      ],
    }));

    setSkillInput("");
  };

  const removeSkill = (index: number) => {

    setResume((previous) => ({
      ...previous,

      skills: previous.skills.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // =====================================================
  // EXPERIENCE
  // =====================================================

  const addExperience = () => {

    setResume((previous) => ({
      ...previous,

      experience: [
        ...previous.experience,

        {
          company: "",
          position: "",
          start_date: "",
          end_date: "",
          description: "",
        },
      ],
    }));
  };

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: string
  ) => {

    setResume((previous) => {

      const updated = [
        ...previous.experience,
      ];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...previous,
        experience: updated,
      };
    });
  };

  const removeExperience = (index: number) => {

    setResume((previous) => ({
      ...previous,

      experience:
        previous.experience.filter(
          (_, i) => i !== index
        ),
    }));
  };

  // =====================================================
  // EDUCATION
  // =====================================================

  const addEducation = () => {

    setResume((previous) => ({
      ...previous,

      education: [
        ...previous.education,

        {
          institution: "",
          degree: "",
          field: "",
          start_year: "",
          end_year: "",
          grade: "",
        },
      ],
    }));
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: string
  ) => {

    setResume((previous) => {

      const updated = [
        ...previous.education,
      ];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...previous,
        education: updated,
      };
    });
  };

  const removeEducation = (index: number) => {

    setResume((previous) => ({
      ...previous,

      education:
        previous.education.filter(
          (_, i) => i !== index
        ),
    }));
  };

  // =====================================================
  // PROJECTS
  // =====================================================

  const addProject = () => {

    setResume((previous) => ({
      ...previous,

      projects: [
        ...previous.projects,

        {
          name: "",
          technologies: "",
          description: "",
          link: "",
        },
      ],
    }));
  };

  const updateProject = (
    index: number,
    field: keyof Project,
    value: string
  ) => {

    setResume((previous) => {

      const updated = [
        ...previous.projects,
      ];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...previous,
        projects: updated,
      };
    });
  };

  const removeProject = (index: number) => {

    setResume((previous) => ({
      ...previous,

      projects:
        previous.projects.filter(
          (_, i) => i !== index
        ),
    }));
  };

  // =====================================================
  // CERTIFICATIONS
  // =====================================================

  const addCertification = () => {

    const value =
      certificationInput.trim();

    if (!value) return;

    setResume((previous) => ({
      ...previous,

      certifications: [
        ...previous.certifications,
        value,
      ],
    }));

    setCertificationInput("");
  };

  const removeCertification = (
    index: number
  ) => {

    setResume((previous) => ({
      ...previous,

      certifications:
        previous.certifications.filter(
          (_, i) => i !== index
        ),
    }));
  };

  // =====================================================
  // ACHIEVEMENTS
  // =====================================================

  const addAchievement = () => {

    const value =
      achievementInput.trim();

    if (!value) return;

    setResume((previous) => ({
      ...previous,

      achievements: [
        ...previous.achievements,
        value,
      ],
    }));

    setAchievementInput("");
  };

  const removeAchievement = (
    index: number
  ) => {

    setResume((previous) => ({
      ...previous,

      achievements:
        previous.achievements.filter(
          (_, i) => i !== index
        ),
    }));
  };

  // =====================================================
  // SAVE
  // =====================================================

  const saveResume = async () => {

    try {

      setLoading(true);
      setMessage("");

      let response;

      if (selectedResumeId) {

        response =
          await api.put<ResumeBuilder>(
            `/resume-builder/${selectedResumeId}`,
            resume
          );

      } else {

        response =
          await api.post<ResumeBuilder>(
            "/resume-builder",
            resume
          );
      }

      setResume(response.data);

      if (response.data.id) {
        setSelectedResumeId(
          response.data.id
        );
      }

      await loadResumes();

      setMessage(
        "Resume saved successfully."
      );

    } catch (error: unknown) {

      console.error(
        "Save resume error:",
        error
      );

      if (axios.isAxiosError(error)) {

        setMessage(
          error.response?.data?.detail ||
          "Failed to save resume."
        );

      } else {

        setMessage(
          "Something went wrong."
        );
      }

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // LOAD RESUME
  // =====================================================

  const loadResume = async (
    id: number
  ) => {

    try {

      setLoading(true);

      const response =
        await api.get<ResumeBuilder>(
          `/resume-builder/${id}`
        );

      setResume(response.data);

      setSelectedResumeId(id);

      setMessage(
        "Resume loaded successfully."
      );

    } catch (error: unknown) {

      console.error(
        "Load resume error:",
        error
      );

      setMessage(
        "Failed to load resume."
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const deleteResume = async (
    id: number
  ) => {

    if (
      !window.confirm(
        "Delete this resume?"
      )
    ) {
      return;
    }

    try {

      setLoading(true);

      await api.delete(
        `/resume-builder/${id}`
      );

      if (selectedResumeId === id) {

        setResume(emptyResume);

        setSelectedResumeId(null);
      }

      await loadResumes();

      setMessage(
        "Resume deleted successfully."
      );

    } catch (error: unknown) {

      console.error(
        "Delete error:",
        error
      );

      setMessage(
        "Failed to delete resume."
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // NEW RESUME
  // =====================================================

  const createNewResume = () => {

    setResume({
      ...emptyResume,

      personal_info: {
        ...emptyResume.personal_info,
      },

      skills: [],

      experience: [],

      education: [],

      projects: [],

      certifications: [],

      achievements: [],
    });

    setSelectedResumeId(null);

    setMessage("");
  };

  // =====================================================
  // INPUT STYLE
  // =====================================================

  const inputClass =
    "w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500";

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="border-b border-slate-800 bg-slate-950">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="text-xl font-bold"
          >
            Career
            <span className="text-blue-400">
              AI
            </span>
          </button>

          <div className="flex gap-3">

            <button
              onClick={createNewResume}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              + New Resume
            </button>

            <button
              onClick={saveResume}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : "Save Resume"}
            </button>

          </div>

        </div>

      </nav>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Resume Builder
          </h1>

          <p className="text-slate-400 mt-2">
            Create a professional ATS-friendly resume.
          </p>

        </div>

        {/* MESSAGE */}

        {message && (

          <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
            {message}
          </div>

        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="lg:col-span-1">

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-6">

              <h2 className="font-semibold text-lg mb-4">
                My Resumes
              </h2>

              {resumes.length === 0 ? (

                <p className="text-sm text-slate-500">
                  No saved resumes yet.
                </p>

              ) : (

                <div className="space-y-3">

                  {resumes.map((item) => (

                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border ${
                        selectedResumeId === item.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 bg-slate-950"
                      }`}
                    >

                      <button
                        onClick={() =>
                          item.id &&
                          loadResume(item.id)
                        }
                        className="text-left w-full"
                      >

                        <p className="font-medium truncate">
                          {item.title}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {item.personal_info?.name ||
                            "Untitled resume"}
                        </p>

                      </button>

                      <button
                        onClick={() =>
                          item.id &&
                          deleteResume(item.id)
                        }
                        className="text-xs text-red-400 mt-2 hover:text-red-300"
                      >
                        Delete
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </aside>

          {/* =================================================
              EDITOR
          ================================================= */}

          <section className="lg:col-span-3 space-y-8">

            {/* =================================================
                BASIC
            ================================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

              <h2 className="text-xl font-bold mb-5">
                Resume Details
              </h2>

              <input
                className={inputClass}
                placeholder="Resume title"
                value={resume.title}
                onChange={(event) =>
                  setResume({
                    ...resume,
                    title:
                      event.target.value,
                  })
                }
              />

            </div>

            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

              <h2 className="text-xl font-bold mb-5">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  className={inputClass}
                  placeholder="Full Name"
                  value={
                    resume.personal_info.name
                  }
                  onChange={(e) =>
                    updatePersonalInfo(
                      "name",
                      e.target.value
                    )
                  }
                />

                <input
                  className={inputClass}
                  placeholder="Email"
                  type="email"
                  value={
                    resume.personal_info.email
                  }
                  onChange={(e) =>
                    updatePersonalInfo(
                      "email",
                      e.target.value
                    )
                  }
                />

                <input
                  className={inputClass}
                  placeholder="Phone"
                  value={
                    resume.personal_info.phone
                  }
                  onChange={(e) =>
                    updatePersonalInfo(
                      "phone",
                      e.target.value
                    )
                  }
                />

                <input
                  className={inputClass}
                  placeholder="Location"
                  value={
                    resume.personal_info.location
                  }
                  onChange={(e) =>
                    updatePersonalInfo(
                      "location",
                      e.target.value
                    )
                  }
                />

                <input
                  className={inputClass}
                  placeholder="LinkedIn URL"
                  value={
                    resume.personal_info.linkedin
                  }
                  onChange={(e) =>
                    updatePersonalInfo(
                      "linkedin",
                      e.target.value
                    )
                  }
                />

                <input
                  className={inputClass}
                  placeholder="GitHub URL"
                  value={
                    resume.personal_info.github
                  }
                  onChange={(e) =>
                    updatePersonalInfo(
                      "github",
                      e.target.value
                    )
                  }
                />

                <input
                  className={`${inputClass} md:col-span-2`}
                  placeholder="Portfolio URL"
                  value={
                    resume.personal_info.portfolio
                  }
                  onChange={(e) =>
                    updatePersonalInfo(
                      "portfolio",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

              <h2 className="text-xl font-bold mb-2">
                Professional Summary
              </h2>

              <p className="text-sm text-slate-500 mb-4">
                Write a concise 2–4 sentence professional summary.
              </p>

              <textarea
                className={`${inputClass} min-h-36 resize-y`}
                placeholder="Example: Software Engineer with experience in..."
                value={resume.summary}
                onChange={(e) =>
                  setResume({
                    ...resume,
                    summary:
                      e.target.value,
                  })
                }
              />

            </div>

            {/* =================================================
                SKILLS
            ================================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

              <h2 className="text-xl font-bold mb-5">
                Skills
              </h2>

              <div className="flex gap-3">

                <input
                  className={inputClass}
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) =>
                    setSkillInput(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {

                    if (
                      e.key === "Enter"
                    ) {
                      e.preventDefault();
                      addSkill();
                    }

                  }}
                />

                <button
                  onClick={addSkill}
                  className="px-5 bg-blue-600 rounded-lg"
                >
                  Add
                </button>

              </div>

              <div className="flex flex-wrap gap-2 mt-5">

                {resume.skills.map(
                  (skill, index) => (

                    <div
                      key={`${skill}-${index}`}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300"
                    >

                      <span>
                        {skill}
                      </span>

                      <button
                        onClick={() =>
                          removeSkill(index)
                        }
                        className="text-red-400"
                      >
                        ×
                      </button>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* =================================================
                EXPERIENCE
            ================================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-xl font-bold">
                  Experience
                </h2>

                <button
                  onClick={addExperience}
                  className="px-4 py-2 bg-blue-600 rounded-lg"
                >
                  + Add Experience
                </button>

              </div>

              <div className="space-y-6">

                {resume.experience.map(
                  (experience, index) => (

                    <div
                      key={index}
                      className="p-5 border border-slate-700 rounded-xl"
                    >

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <input
                          className={inputClass}
                          placeholder="Job Title"
                          value={
                            experience.position
                          }
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "position",
                              e.target.value
                            )
                          }
                        />

                        <input
                          className={inputClass}
                          placeholder="Company"
                          value={
                            experience.company
                          }
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "company",
                              e.target.value
                            )
                          }
                        />

                        <input
                          className={inputClass}
                          placeholder="Start Date"
                          value={
                            experience.start_date
                          }
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "start_date",
                              e.target.value
                            )
                          }
                        />

                        <input
                          className={inputClass}
                          placeholder="End Date"
                          value={
                            experience.end_date
                          }
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "end_date",
                              e.target.value
                            )
                          }
                        />

                        <textarea
                          className={`${inputClass} md:col-span-2 min-h-32`}
                          placeholder="Describe your responsibilities and achievements..."
                          value={
                            experience.description
                          }
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <button
                        onClick={() =>
                          removeExperience(index)
                        }
                        className="mt-4 text-red-400 text-sm"
                      >
                        Remove Experience
                      </button>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* =================================================
                EDUCATION
            ================================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-xl font-bold">
                  Education
                </h2>

                <button
                  onClick={addEducation}
                  className="px-4 py-2 bg-blue-600 rounded-lg"
                >
                  + Add Education
                </button>

              </div>

              <div className="space-y-6">

                {resume.education.map(
                  (education, index) => (

                    <div
                      key={index}
                      className="p-5 border border-slate-700 rounded-xl"
                    >

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <input
                          className={inputClass}
                          placeholder="Degree"
                          value={
                            education.degree
                          }
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "degree",
                              e.target.value
                            )
                          }
                        />

                        <input
                          className={inputClass}
                          placeholder="Field of Study"
                          value={
                            education.field
                          }
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "field",
                              e.target.value
                            )
                          }
                        />

                        <input
                          className={inputClass}
                          placeholder="Institution"
                          value={
                            education.institution
                          }
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "institution",
                              e.target.value
                            )
                          }
                        />

                        <input
                          className={inputClass}
                          placeholder="Grade / CGPA"
                          value={
                            education.grade
                          }
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "grade",
                              e.target.value
                            )
                          }
                        />

                        <input
                          className={inputClass}
                          placeholder="Start Year"
                          value={
                            education.start_year
                          }
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "start_year",
                              e.target.value
                            )
                          }
                        />

                        <input
                          className={inputClass}
                          placeholder="End Year"
                          value={
                            education.end_year
                          }
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "end_year",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <button
                        onClick={() =>
                          removeEducation(index)
                        }
                        className="mt-4 text-red-400 text-sm"
                      >
                        Remove Education
                      </button>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* =================================================
                PROJECTS
            ================================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-xl font-bold">
                  Projects
                </h2>

                <button
                  onClick={addProject}
                  className="px-4 py-2 bg-blue-600 rounded-lg"
                >
                  + Add Project
                </button>

              </div>

              <div className="space-y-6">

                {resume.projects.map(
                  (project, index) => (

                    <div
                      key={index}
                      className="p-5 border border-slate-700 rounded-xl"
                    >

                      <div className="space-y-4">

                        <input
                          className={inputClass}
                          placeholder="Project Name"
                          value={
                            project.name
                          }
                          onChange={(e) =>
                            updateProject(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                        />

                        <input
                          className={inputClass}
                          placeholder="Technologies"
                          value={
                            project.technologies
                          }
                          onChange={(e) =>
                            updateProject(
                              index,
                              "technologies",
                              e.target.value
                            )
                          }
                        />

                        <textarea
                          className={`${inputClass} min-h-32`}
                          placeholder="Project description..."
                          value={
                            project.description
                          }
                          onChange={(e) =>
                            updateProject(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        />

                        <input
                          className={inputClass}
                          placeholder="Project URL"
                          value={
                            project.link
                          }
                          onChange={(e) =>
                            updateProject(
                              index,
                              "link",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <button
                        onClick={() =>
                          removeProject(index)
                        }
                        className="mt-4 text-red-400 text-sm"
                      >
                        Remove Project
                      </button>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* =================================================
                CERTIFICATIONS
            ================================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

              <h2 className="text-xl font-bold mb-5">
                Certifications
              </h2>

              <div className="flex gap-3">

                <input
                  className={inputClass}
                  placeholder="Certification name"
                  value={
                    certificationInput
                  }
                  onChange={(e) =>
                    setCertificationInput(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {

                    if (
                      e.key === "Enter"
                    ) {
                      e.preventDefault();
                      addCertification();
                    }

                  }}
                />

                <button
                  onClick={addCertification}
                  className="px-5 bg-blue-600 rounded-lg"
                >
                  Add
                </button>

              </div>

              <div className="mt-5 space-y-2">

                {resume.certifications.map(
                  (item, index) => (

                    <div
                      key={`${item}-${index}`}
                      className="flex justify-between items-center p-3 bg-slate-950 rounded-lg"
                    >

                      <span>
                        {item}
                      </span>

                      <button
                        onClick={() =>
                          removeCertification(
                            index
                          )
                        }
                        className="text-red-400"
                      >
                        Remove
                      </button>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* =================================================
                ACHIEVEMENTS
            ================================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

              <h2 className="text-xl font-bold mb-5">
                Achievements
              </h2>

              <div className="flex gap-3">

                <input
                  className={inputClass}
                  placeholder="Achievement"
                  value={
                    achievementInput
                  }
                  onChange={(e) =>
                    setAchievementInput(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {

                    if (
                      e.key === "Enter"
                    ) {
                      e.preventDefault();
                      addAchievement();
                    }

                  }}
                />

                <button
                  onClick={addAchievement}
                  className="px-5 bg-blue-600 rounded-lg"
                >
                  Add
                </button>

              </div>

              <div className="mt-5 space-y-2">

                {resume.achievements.map(
                  (item, index) => (

                    <div
                      key={`${item}-${index}`}
                      className="flex justify-between items-center p-3 bg-slate-950 rounded-lg"
                    >

                      <span>
                        {item}
                      </span>

                      <button
                        onClick={() =>
                          removeAchievement(
                            index
                          )
                        }
                        className="text-red-400"
                      >
                        Remove
                      </button>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* =================================================
                SAVE BUTTON
            ================================================= */}

            <div className="flex justify-end">

              <button
                onClick={saveResume}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : "Save Resume"}
              </button>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}


// =========================================================
// PROTECTED PAGE
// =========================================================

export default function ResumeBuilderPage() {

  return (
    <ProtectedRoute>
      <ResumeBuilderContent />
    </ProtectedRoute>
  );
}