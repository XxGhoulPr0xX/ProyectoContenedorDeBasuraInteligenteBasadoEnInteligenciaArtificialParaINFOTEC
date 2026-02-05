#  Contenedor de Basura Inteligente (Smart Waste Container)

Este proyecto es una solución integral de **Visión Artificial** e **IoT** diseñada para automatizar la clasificación de residuos. Utiliza modelos de aprendizaje profundo para identificar materiales y gestionar la capacidad de recolección en tiempo real a través de una interfaz web interactiva.

## Características Principales

* **Clasificación con IA Dual:** Soporte para modelos **TensorFlow/Keras** (.h5) y **YOLO** (Ultralytics) para detectar categorías como biodegradable, plástico, metal, vidrio, entre otros.
* **Procesamiento de Imágenes en Tiempo Real:** Capacidad de recibir archivos de imagen como arreglos de bytes mediante solicitudes HTTP POST.
* **Filtrado por Confianza:** El sistema exige un umbral mínimo del **60% de confianza** para validar una detección; de lo contrario, solicita un reintento.
* **Gestión de Inventario Visual:** Incluye un gestor que almacena, lista y permite eliminar las capturas realizadas por el sistema.
* **Dashboard Estadístico:** Seguimiento automático de métricas como el promedio de confianza, total de detecciones y porcentaje de residuos por categoría.

## Stack Tecnológico

* **Backend:** Python con **Flask**.
* **Servidor de Producción:** **Waitress**.
* **Inteligencia Artificial:** TensorFlow, Keras y YOLO (Ultralytics).
* **Frontend:** HTML5, CSS3, JavaScript (jQuery).
* **Gestión de Datos:** Programación Orientada a Objetos para el manejo de estados y estadísticas en memoria.

## Estructura del Código

* **`appHTTP.py`**: Punto de entrada que inicializa el servidor Flask y lo despliega usando Waitress.
* **`ManejadorHTTP.py`**: Orquestador principal que recibe los datos, coordina la lógica de guardado de imágenes y llama al modelo de IA.
* **`rutas.py`**: Definición de todos los endpoints de la API (clasificación, historial, estadísticas, galería).
* **`Servicios.py`**: Módulo de inicialización de servicios (Singleton) para el manejador, gestor de estadísticas y de imágenes.
* **`pruebaModelosTF.py` / `PruebaModelosYOLO.py**`: Clases especializadas en la carga y ejecución de inferencias de los modelos de IA.
* **`HistorialResultados.py`**: Lógica de negocio para el conteo de residuos y generación de reportes.

## ⚙️ Configuración y Ejecución

### 1. Requisitos

Asegúrate de tener instalado Python 3.10.10 y las dependencias necesarias:

```bash
pip install flask waitress tensorflow ultralytics numpy opencv-python matplotlib
```

### 2. Ejecución

Para iniciar el servidor, ejecuta el archivo principal:

```bash
python appHTTP.py
```

El servidor se iniciará automáticamente y mostrará la IP local en el puerto **8080**.

## 📡 Endpoints Principales

| Ruta | Método | Descripción |
| --- | --- | --- |
| `/` | POST | Recibe la imagen en bytes para clasificar el objeto. |
| `/verificar_actualizacion` | GET | Long polling para actualizar la interfaz del usuario. |
| `/estadisticas` | GET | Retorna los conteos de residuos y promedios de confianza. |
| `/eliminarImagenes` | DELETE | Limpia la carpeta de capturas y resetea el estado actual. |

