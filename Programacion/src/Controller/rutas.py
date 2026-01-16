from flask import Blueprint, jsonify, redirect, render_template, request
from src.Service.Servicios import *

rutas = Blueprint('main', __name__)
ultimaActualizacion = 0

@rutas.route('/index', methods=['GET'])
def index():
    return render_template('contenedor.html', resultado=alpha.getResultadoActual())

@rutas.route('/', methods=['GET'])
def redirigirIndex():
    return redirect('/index')

@rutas.route('/', methods=['POST'])
def clasificar_objeto():
    global ultimaActualizacion
    alpha.recepcionMensaje()
    respuesta = alpha.enviarMensaje()
    if alpha.data.get("evento") == "imagen bytes":
            charlie.setDiccionarioPrincipal(alpha.diccionarioIdentificacion)
    ultimaActualizacion = time.time()
    return respuesta

@rutas.route('/verificar_actualizacion', methods=['GET'])
def verificar_actualizacion():
    global ultimaActualizacion
    timestamp_cliente = float(request.args.get('timestamp', 0))
    timeout = 30
    inicio = time.time()
    while True:
        if ultimaActualizacion > timestamp_cliente:
            if (alpha.diccionarioIdentificacion and 
                alpha.diccionarioIdentificacion.get('clase') != 'Esperando detección...'):
                
                return jsonify({
                    'actualizado': True,
                    'timestamp': ultimaActualizacion,
                    'datos': alpha.diccionarioIdentificacion
                })
        if (time.time() - inicio) > timeout:
            return jsonify({
                'actualizado': False,
                'timestamp': ultimaActualizacion
            })
        time.sleep(0.5)

@rutas.route('/historial', methods=['GET'])
def obtenerHistorial():
    return charlie.getHistorial()

@rutas.route('/estadisticas', methods=['GET'])
def obtenerEstadisticas():
    return charlie.getEstadisticas()

@rutas.route('/listarImagenes', methods=['GET'])
def getImagenes():
    return alpha.listarImagenes()

@rutas.route('/eliminarImagenes', methods=['DELETE'])
def setEliminarImagenes():
    return alpha.eliminarImagenes()