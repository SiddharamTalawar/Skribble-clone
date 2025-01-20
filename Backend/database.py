from sqlmodel import create_engine

DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    from models import SQLModel
    SQLModel.metadata.create_all(engine)
