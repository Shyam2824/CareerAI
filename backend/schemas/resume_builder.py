from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ResumeBuilderCreate(BaseModel):
    title: str = "My Resume"

    personal_info: dict[str, Any] = Field(default_factory=dict)

    summary: str = ""

    skills: list[str] = Field(default_factory=list)

    experience: list[dict[str, Any]] = Field(default_factory=list)

    education: list[dict[str, Any]] = Field(default_factory=list)

    projects: list[dict[str, Any]] = Field(default_factory=list)

    certifications: list[str] = Field(default_factory=list)

    achievements: list[str] = Field(default_factory=list)


class ResumeBuilderUpdate(BaseModel):
    title: str | None = None

    personal_info: dict[str, Any] | None = None

    summary: str | None = None

    skills: list[str] | None = None

    experience: list[dict[str, Any]] | None = None

    education: list[dict[str, Any]] | None = None

    projects: list[dict[str, Any]] | None = None

    certifications: list[str] | None = None

    achievements: list[str] | None = None


class ResumeBuilderResponse(BaseModel):
    id: int
    title: str

    personal_info: dict[str, Any]

    summary: str

    skills: list[str]

    experience: list[dict[str, Any]]

    education: list[dict[str, Any]]

    projects: list[dict[str, Any]]

    certifications: list[str]

    achievements: list[str]

    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True