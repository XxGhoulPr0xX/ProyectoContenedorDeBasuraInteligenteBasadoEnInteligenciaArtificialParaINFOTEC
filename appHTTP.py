import os
from flask import Flask
from waitress import serve

from src.Controller.rutas import rutas
from src.Service.Servicios import alpha

def create_app():
    app = Flask(__name__)
    app.register_blueprint(rutas)
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    serve(app, host=alpha.getIpServidor(), port=8080)