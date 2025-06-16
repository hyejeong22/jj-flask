from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# MySQL 연결 설정
DATABASE_URL = "mysql+pymysql://root@localhost/qr_system" 

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# 인증 기록 모델
class QRLog(Base):
    __tablename__ = "qr_logs"

    id = Column(Integer, primary_key=True, index=True)
    qr_code = Column(String(255))
    status = Column(String(20))
    phone_number = Column(String(20)) 
    memo = Column(String(255))
    timestamp = Column(DateTime, default=datetime.now)


# QR 생성 기록 모델
class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(Integer, primary_key=True, index=True)
    qr_code = Column(String(255))
    phone_number = Column(String(20))
    memo = Column(String(255))
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)