import time
from src.Service.ManejadorHTTP import Manejador
from src.Service.HistorialResultados import estadisticasIdentificaciones

# Inicialización de componentes globales
alpha = Manejador(modelo="C:\\Users\\XxGho\\OneDrive\\Documentos\\Escuela\\Proceso Dual\\Proyecto\\3° Proyecto\\Programacion\\static\\Modelos\\Identificacion de images\\model_retrained_REALDATA_v2.h5")
charlie = estadisticasIdentificaciones()
estado_servidor = {
    "ultima_actualizacion": 0
}

def esperarActualizacion(timestamp_cliente, timeout=30):
    inicio = time.time()
    while True:
        if estado_servidor["ultima_actualizacion"] > timestamp_cliente:
            if (alpha.diccionarioIdentificacion and 
                alpha.diccionarioIdentificacion.get('clase') != 'Esperando detección...'):
                return {
                    'actualizado': True,
                    'timestamp': estado_servidor["ultima_actualizacion"],
                    'datos': alpha.diccionarioIdentificacion
                }
        if (time.time() - inicio) > timeout:
            return {
                'actualizado': False, 
                'timestamp': estado_servidor["ultima_actualizacion"]
            }
        time.sleep(0.5)