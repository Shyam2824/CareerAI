# backend/services/booking_payment_service.py

import hashlib
import hmac
from typing import Any

import razorpay

from config.razorpay import (
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
)


def get_razorpay_client() -> razorpay.Client:
    """
    Create Razorpay client for mentor booking payments.
    """
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise RuntimeError("Razorpay configuration is missing.")

    return razorpay.Client(
        auth=(
            RAZORPAY_KEY_ID,
            RAZORPAY_KEY_SECRET,
        )
    )


def create_booking_order(
    booking_id: int,
    amount: float,
    user_id: int,
) -> dict[str, Any]:
    """
    Create Razorpay order for a mentor booking.

    Amount is converted from INR to paise.
    """

    if amount <= 0:
        raise ValueError("Booking amount must be greater than 0.")

    client = get_razorpay_client()

    amount_paise = int(round(amount * 100))

    order_data = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"mentor_booking_{booking_id}",
        "notes": {
            "booking_id": str(booking_id),
            "user_id": str(user_id),
            "payment_type": "mentor_booking",
        },
    }

    order = client.order.create(data=order_data)

    return {
        "id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "receipt": order.get("receipt"),
        "status": order.get("status"),
    }


def verify_booking_payment_signature(
    order_id: str,
    payment_id: str,
    signature: str,
) -> bool:
    """
    Verify Razorpay payment signature.

    Signature payload:
        order_id + "|" + payment_id
    """

    if not order_id or not payment_id or not signature:
        return False

    payload = f"{order_id}|{payment_id}"

    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(
        generated_signature,
        signature,
    )


def fetch_razorpay_payment(payment_id: str) -> dict[str, Any]:
    """
    Fetch payment details directly from Razorpay.
    """

    client = get_razorpay_client()

    payment = client.payment.fetch(payment_id)

    return payment


def fetch_razorpay_order(order_id: str) -> dict[str, Any]:
    """
    Fetch order details directly from Razorpay.
    """

    client = get_razorpay_client()

    order = client.order.fetch(order_id)

    return order