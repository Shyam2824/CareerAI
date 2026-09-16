from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class MentorAvailabilityCreate(BaseModel):
    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def validate_times(self):
        if self.end_time <= self.start_time:
            raise ValueError(
                "End time must be after start time."
            )

        return self


class MentorAvailabilityUpdate(BaseModel):
    start_time: datetime | None = None
    end_time: datetime | None = None

    @model_validator(mode="after")
    def validate_times(self):
        if (
            self.start_time is not None
            and self.end_time is not None
            and self.end_time <= self.start_time
        ):
            raise ValueError(
                "End time must be after start time."
            )

        return self


class MentorAvailabilityResponse(BaseModel):
    id: int
    mentor_id: int
    start_time: datetime
    end_time: datetime
    is_booked: bool

    model_config = ConfigDict(
        from_attributes=True
    )