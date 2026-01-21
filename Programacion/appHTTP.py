from flask import Flask
from src.Controller.rutas import rutas
from src.Service.Servicios import alpha

def create_app():
    app = Flask(__name__)
    
    app.register_blueprint(rutas)
    
    return app

if __name__ == '__main__':
    app = create_app()
    try:
        app.run(host=alpha.getIpServidor(), port=5000, debug=False, threaded=True)
    except Exception as e:
        print(f"Error al iniciar el servidor: {e}")