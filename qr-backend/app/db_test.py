from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import QRLog  # 로그 모델
from app.database import DATABASE_URL  # DB 주소

# DB 연결 엔진 생성
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

def test_db_connection():
    try:
        session = Session()
        # 아주 간단한 SELECT 쿼리
        logs = session.query(QRLog).all()
        print("✅ 연결 성공! 현재 저장된 인증 로그 수:", len(logs))
        session.close()
    except Exception as e:
        print("🚨 연결 실패:", e)

if __name__ == "__main__":
    test_db_connection()
