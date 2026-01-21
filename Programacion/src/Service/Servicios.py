import time
import os
from src.Service.ManejadorHTTP import Manejador
from src.Service.HistorialResultados import estadisticasIdentificaciones
from src.Service.GestorImagenes  import GaleriaManager

#Ruta relativa para construccion en servidor web
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ruta_modelo = os.path.join(BASE_DIR, "static", "Modelos", "Identificacion de images", "model_retrained_REALDATA_v2.h5")

alpha = Manejador(modelo=ruta_modelo)
charlie = estadisticasIdentificaciones()
delta = GaleriaManager()
