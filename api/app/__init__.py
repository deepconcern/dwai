from flask import Flask

from .connectors import setup_connectors
from .models import setup_models
from .resolvers import setup_graphql

app = Flask(__name__)


@app.route("/")
def health_check() -> str:
    return "OK"

setup_connectors(app)
setup_models(app)
setup_graphql(app)
