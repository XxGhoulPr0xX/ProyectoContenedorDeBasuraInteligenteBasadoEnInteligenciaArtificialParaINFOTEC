from flask import Flask
from waitress import serve

from src.Controller.rutas import rutas
from src.Service.Servicios import alpha

def create_app():
    app = Flask(__name__)
    app.register_blueprint(rutas)
    return app

if __name__ == '__main__':
    app = create_app()
    print(f"Servidor iniciado en http://{alpha.getIpServidor()}:8080")
    serve(app, host=alpha.getIpServidor(), port=8080)