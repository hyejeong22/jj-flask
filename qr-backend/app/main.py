from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from uuid import uuid4
from datetime import datetime, timedelta
from app.database import QRLog, QRCode, SessionLocal
from fastapi import Query
from typing import Optional

app = FastAPI()

# ✅ CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 1. QR 생성 요청 모델
class QRCreateRequest(BaseModel):
    phone_number: str
    memo: str
    duration_minutes: int

# ✅ 2. QR 인증 요청 모델
class QRData(BaseModel):
    qr_code: str

# ✅ 3. 인증 로그 응답 모델
from typing import Optional

class LogSchema(BaseModel):
    id: int
    qr_code: str
    status: str
    memo: Optional[str] = None
    phone_number: Optional[str] = None  
    timestamp: datetime

    class Config:
        orm_mode = True


# ✅ 4. QR 코드 생성 API
@app.post("/generate_qr")
def generate_qr(data: QRCreateRequest):
    db = SessionLocal()

    qr_code_value = str(uuid4())
    expires_at = datetime.now() + timedelta(minutes=data.duration_minutes)

    qr = QRCode(
        qr_code=qr_code_value,
        phone_number=data.phone_number,
        memo=data.memo,
        expires_at=expires_at,
    )

    db.add(qr)
    db.commit()
    db.close()

    return {
        "status": "success",
        "message": "QR 코드가 생성되었습니다",
        "qr_code": qr_code_value
    }

# ✅ 5. QR 코드 인증 API (DB에서 확인)
@app.post("/verify")
async def verify_qr(data: QRData):
    db = SessionLocal()

    qr_record = db.query(QRCode).filter(QRCode.qr_code == data.qr_code).first()

    if qr_record:
        now = datetime.now()
        if now <= qr_record.expires_at:
            status = "success"
            message = "QR 인증 성공 ✅"

            # ✅ 일회용 처리: 인증 성공 시 QR 삭제
            db.delete(qr_record)

        else:
            status = "fail"
            message = "QR 코드 만료 ❌"
    else:
        status = "fail"
        message = "등록되지 않은 QR ❌"

    log = QRLog(
    qr_code=data.qr_code,
    status=status,
    memo=qr_record.memo if qr_record else "",
    phone_number=qr_record.phone_number if qr_record else "")
    db.add(log)
    db.commit()
    db.close()

    return {"status": status, "message": message}


# ✅ 6. 인증 로그 조회 API
@app.get("/logs", response_model=List[LogSchema])
def get_logs(skip: int = Query(0), limit: int = Query(10)):
    db = SessionLocal()
    logs = db.query(QRLog).order_by(QRLog.timestamp.desc()).offset(skip).limit(limit).all()
    db.close()
    return logs
