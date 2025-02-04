from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional
import aiohttp
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="محول العملات API")

# إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConversionRequest(BaseModel):
    from_currency: str
    to_currency: str
    amount: float

# الحصول على سعر الصرف من API خارجي
async def get_exchange_rate(from_currency: str, to_currency: str) -> float:
    api_key = os.getenv("EXCHANGE_API_KEY", "demo_key")  # استخدم المفتاح الخاص بك
    url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                raise HTTPException(status_code=400, detail="خطأ في الحصول على سعر الصرف")
            data = await response.json()
            if to_currency not in data["rates"]:
                raise HTTPException(status_code=400, detail="العملة غير مدعومة")
            return data["rates"][to_currency]

@app.get("/")
async def read_root():
    return {"message": "مرحباً بك في خدمة تحويل العملات"}

@app.post("/convert")
async def convert_currency(request: ConversionRequest):
    try:
        rate = await get_exchange_rate(request.from_currency, request.to_currency)
        converted_amount = request.amount * rate
        return {
            "from_currency": request.from_currency,
            "to_currency": request.to_currency,
            "amount": request.amount,
            "converted_amount": round(converted_amount, 2),
            "rate": rate
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/supported-currencies")
async def get_supported_currencies():
    # قائمة العملات المدعومة
    currencies = {
        "USD": "دولار أمريكي",
        "EUR": "يورو",
        "GBP": "جنيه إسترليني",
        "JPY": "ين ياباني",
        "SAR": "ريال سعودي",
        "AED": "درهم إماراتي",
        "KWD": "دينار كويتي",
        "EGP": "جنيه مصري",
        "CNY": "يوان صيني",
        "INR": "روبية هندية"
    }
    return currencies

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
