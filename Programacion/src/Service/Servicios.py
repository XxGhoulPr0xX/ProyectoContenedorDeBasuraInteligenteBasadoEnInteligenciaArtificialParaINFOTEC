import time
from src.Service.ManejadorHTTP import Manejador
from src.Service.HistorialResultados import estadisticasIdentificaciones

# Inicialización de componentes globales
alpha = Manejador(modelo="C:\\Users\\XxGho\\OneDrive\\Documentos\\Escuela\\Proceso Dual\\Proyecto\\3° Proyecto\\Programacion\\static\\Modelos\\Identificacion de images\\model_retrained_REALDATA_v2.h5")
charlie = estadisticasIdentificaciones()
