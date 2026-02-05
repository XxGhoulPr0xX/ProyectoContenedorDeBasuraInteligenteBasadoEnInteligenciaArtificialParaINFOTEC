# Contenedor de Basura Inteligente

Este proyecto es una solución integral de **Visión Artificial** e **IoT** diseñada para **automatizar la clasificación de residuos**.
Integra modelos de **aprendizaje profundo**, hardware embebido y una **interfaz web interactiva** para gestionar la clasificación y la capacidad de recolección en tiempo real.

 **Aplicación en línea:**

 [https://proyectocontenedordebasurainteligentebas.onrender.com](https://proyectocontenedordebasurainteligentebas.onrender.com)

---

## Características Principales

* **Clasificación con IA Dual**
  Soporte para modelos **TensorFlow/Keras** (`.h5`) y **YOLO (Ultralytics)**, capaces de identificar categorías como:

  * Biodegradable
  * Plástico
  * Metal
  * Vidrio
  * Otros residuos

* **Procesamiento de Imágenes en Tiempo Real**
  Recepción de imágenes como **arreglos de bytes** mediante solicitudes **HTTP POST** desde dispositivos IoT.

* **Filtrado por Nivel de Confianza**
  El sistema valida una detección únicamente si supera un **60% de confianza**.
  En caso contrario, se descarta y se solicita un nuevo intento.

* **Gestión de Inventario Visual**
  Módulo para:

  * Almacenar capturas
  * Listar imágenes
  * Eliminar registros del sistema

* **Dashboard Estadístico**
  Visualización automática de métricas como:

  * Promedio de confianza
  * Total de detecciones
  * Porcentaje de residuos por categoría

---

## Stack Tecnológico

### 🔹 Software

* **Backend**
  Desarrollado en **Python** con **Flask**, encargado de:

  * Recibir imágenes
  * Procesar inferencias
  * Comunicarse con el hardware IoT

* **Servidor de Producción**
  **Waitress**, utilizado para ejecutar el backend en un entorno estable y de producción.

* **Inteligencia Artificial**

  * **TensorFlow** y **Keras** para modelos de clasificación
  * **YOLO (Ultralytics)** para visión por computadora e inferencia en tiempo real

* **Frontend**
  Interfaz web desarrollada con:

  * **HTML5**
  * **CSS3**
  * **JavaScript**
  * **jQuery**, para actualización dinámica mediante *long polling*

---

### 🔹 Hardware

* **ESP32-S3 CAM**
  Microcontrolador encargado de:

  * Captura de imágenes
  * Comunicación inalámbrica
  * Envío de datos al backend

* **Sensor Ultrasónico (HC-SR04)**
  Detecta la presencia de residuos y **activa el proceso de clasificación**.

* **Servomotor**
  Controla la **apertura y direccionamiento de las compuertas** según la categoría detectada
  (Biodegradable / No Biodegradable).

* **Pantalla OLED**
  Muestra en tiempo real:

  * Estado del sistema
  * Conexión WiFi
  * Resultado de la clasificación

---

## Estructura del Código

* **`appHTTP.py`**
  Punto de entrada del sistema. Inicializa Flask y despliega el servidor usando **Waitress**.

* **`ManejadorHTTP.py`**
  Orquestador principal:

  * Recibe imágenes
  * Coordina el guardado
  * Ejecuta la inferencia con IA

* **`rutas.py`**
  Define todos los endpoints de la API:

  * Clasificación
  * Historial
  * Estadísticas
  * Galería

* **`Servicios.py`**
  Inicialización de servicios bajo el patrón **Singleton**:

  * Manejador principal
  * Gestor de estadísticas
  * Gestor de imágenes

* **`pruebaModelosTF.py` / `PruebaModelosYOLO.py`**
  Clases especializadas en la carga y ejecución de inferencias con los modelos de IA.

* **`HistorialResultados.py`**
  Memoria lógica del sistema:

  * Almacena cada detección
  * Mantiene el orden cronológico
  * Genera reportes

* **`GestorImagenes.py`**
  Administra el sistema de archivos de la galería de capturas.

---

## Flujo General del Sistema

*(Hardware + Software + Visualización)*

### 1️.- Detección del Objeto

El **sensor ultrasónico** monitorea el entorno y, al detectar un objeto a menos de **10 cm**, activa el proceso.

### 2️.- Captura y Envío

La **ESP32-CAM** toma una fotografía y la envía al backend mediante una petición **HTTP POST** como arreglo de bytes.

### 3️.- Recepción y Proxy

**Nginx** actúa como proxy inverso:

* Recibe la petición del ESP32
* La redirige al contenedor backend en **Flask**

### 4️.- Procesamiento e Inferencia

* El **Manejador** recibe la imagen
* Se ejecuta la inferencia con **TensorFlow o YOLO**
* Se determina la clase y la confianza

### 5️.- Validación y Persistencia

* Si la confianza es **> 60%**:

  * La imagen se guarda
  * Se registra en `HistorialResultados`
* Si no, se descarta para evitar falsos positivos

### 6️.- Respuesta al Dispositivo

El servidor responde con un **JSON**, por ejemplo:

```json
{ "clase": "Biodegradable" }
```

### 7️.- Acción Física

* La ESP32 muestra el resultado en la **pantalla OLED**
* El **servomotor** gira (0° / 90°) y deposita el residuo correctamente

### 8️.- Visualización y Sincronización

* El dashboard ejecuta `contenedor.js`
* Mediante **long polling**, detecta cambios
* Se actualizan:

  * Historial
  * Estadísticas
  * Nivel de llenado

---

## Endpoints de la API

| Ruta                       | Método | Descripción                                  |
| -------------------------- | ------ | -------------------------------------------- |
| `/index`                   | GET    | Renderiza el dashboard principal             |
| `/`                        | GET    | Redirección a `/index`                       |
| `/`                        | POST   | Recibe la imagen en bytes para clasificación |
| `/verificar_actualizacion` | GET    | Long polling para refrescar la interfaz      |
| `/estadisticas`            | GET    | Conteos y promedios de confianza             |
| `/historial`               | GET    | Registro cronológico de detecciones          |
| `/listarImagenes`          | GET    | Lista de imágenes almacenadas                |
| `/eliminarImagenes`        | DELETE | Limpia capturas y reinicia estado            |
| `/resetEstadisticas`       | POST   | Reinicia contadores de la sesión             |

---

## Configuración y Ejecución

### 1️.- Requisitos

Python **3.10.10** y dependencias:

```bash
pip install flask waitress tensorflow ultralytics numpy opencv-python matplotlib
```

### 2️.- Ejecución Local

```bash
python appHTTP.py
```

El servidor se inicia en el puerto **8080**.

---

## Ejecución con Docker (Recomendado)

El proyecto incluye un entorno Docker para asegurar compatibilidad total.

**Servicios:**

1. **Backend Flask** (motor de IA)
2. **Nginx** (proxy inverso, subida de imágenes hasta **10MB**)

```bash
docker-compose up --build
```

Acceso desde:
 `http://localhost:80`

### Detalles de Infraestructura

* **Dockerfile**
  Basado en `python:3.10.10-slim`, optimizado y ejecutado con **Waitress**.

* **nginx.conf**
  Maneja:

  * Redirección al backend
  * Buffers de imágenes para dispositivos IoT

---

## Nota Importante sobre el ESP32

Para que el sistema funcione correctamente es **obligatorio**:

* Contar con un **ESP32 configurado con los módulos adecuados**
* Utilizar el firmware incluido en el proyecto:

**`static/esp32/Esp32ToPythonOledHttpCAM.ino`**

Este programa permite:

* Capturar imágenes
* Enviar peticiones HTTP al backend
* Mostrar resultados en la pantalla OLED
* Controlar el servomotor según la clasificación recibida
