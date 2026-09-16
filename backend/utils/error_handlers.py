from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException


def api_error(
    code: str,
    message: str,
    status_code: int,
    fields=None,
):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": message,
                "fields": fields or [],
            },
        },
    )


async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
):
    return api_error(
        code=f"HTTP_{exc.status_code}",
        message=str(exc.detail),
        status_code=exc.status_code,
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    fields = []

    for error in exc.errors():
        location = error.get("loc", [])

        field = ".".join(
            str(item)
            for item in location
            if item != "body"
        )

        fields.append(
            {
                "field": field,
                "message": error.get(
                    "msg",
                    "Invalid value.",
                ),
            }
        )

    return api_error(
        code="VALIDATION_ERROR",
        message="Request validation failed.",
        status_code=422,
        fields=fields,
    )


async def integrity_exception_handler(
    request: Request,
    exc: IntegrityError,
):
    return api_error(
        code="DATABASE_CONFLICT",
        message="This operation conflicts with existing data.",
        status_code=409,
    )


async def sqlalchemy_exception_handler(
    request: Request,
    exc: SQLAlchemyError,
):
    return api_error(
        code="DATABASE_ERROR",
        message="A database error occurred.",
        status_code=500,
    )


async def general_exception_handler(
    request: Request,
    exc: Exception,
):
    return api_error(
        code="INTERNAL_SERVER_ERROR",
        message="An unexpected server error occurred.",
        status_code=500,
    )