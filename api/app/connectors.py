from typing import Optional
from flask import Flask, current_app, g
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

engine = create_engine("sqlite:///dwai.db")

def build_connectors() -> None:
    g.session = Session(engine)

def teardown_connectors(_) -> None:
    session: Optional[Session] = g.pop("session", None)

    if session is not None:
        session.close()

def setup_connectors(app: Flask) -> None:
    app.before_request(build_connectors)
    app.teardown_appcontext(teardown_connectors)

__all__ = ["engine"]