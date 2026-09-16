import os
import razorpay
from dotenv import load_dotenv

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")

PREMIUM_PRICE = float(os.getenv("PREMIUM_PRICE", "499"))
PREMIUM_PLAN = os.getenv("PREMIUM_PLAN", "premium")
PREMIUM_DURATION_DAYS = int(
    os.getenv("PREMIUM_DURATION_DAYS", "30")
)

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise RuntimeError(
        "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required."
    )

razorpay_client = razorpay.Client(
    auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
)