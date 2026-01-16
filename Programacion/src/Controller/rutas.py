from flask import Blueprint, jsonify, redirect, render_template, request
from src.Service.Servicios import *

rutas = Blueprint('main', __name__)

@rutas.route('/index', methods=['GET'])
def index():
    return render_template('contenedor.html', resultado=alpha.getResultadoActual())

@rutas.route('/', methods=['GET'])
def redirigirIndex():
    return redirect('/index')

@rutas.route('/', methods=['POST'])
def clasificarObjeto():
    return alpha.procesarFlujo(charlie, estado_servidor)

@rutas.route('/verificar_actualizacion', methods=['GET'])
def verificarActualizacion():
    timestamp_cliente = float(request.args.get('timestamp', 0))
    resultado = esperarActualizacion(timestamp_cliente)
    return jsonify(resultado)

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