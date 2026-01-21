from collections import OrderedDict
import time
from flask import jsonify

class estadisticasIdentificaciones():
    def __init__(self):
        self.generalIdentificacion = OrderedDict()
        self.contador = 0
        self.bioContenedorFrontend = 0
        self.bioEstadisticaFrontend = 0
        self.nbContenedorFrontend = 0
        self.nbEstadisticaFrontend = 0

    
    def setDiccionarioPrincipal(self, data):
        self.contador += 1
        id_generado = f"id_{self.contador:04d}"
        
        clase_detectada = data.get('clase', 'Desconocido')
    
        if clase_detectada.lower() == 'biodegradable':
            self.bioEstadisticaFrontend += 1
            self.bioContenedorFrontend += 1
        elif clase_detectada.lower() == 'no biodegradable':
            self.nbEstadisticaFrontend += 1
            self.nbContenedorFrontend += 1

        entrada_historial = {
            'id': id_generado,
            'timestamp': time.time(),
            'clase': clase_detectada,
            'probabilidad': data.get('probabilidad', 0.0),
            'imagen_path': data.get('imagen_path', ''),
            'fecha_hora': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        self.generalIdentificacion[id_generado] = entrada_historial
        return self.generalIdentificacion
    

    def getHistorial(self):
        return jsonify(list(self.generalIdentificacion.values()))

    def getEstadisticas(self):
            if not self.generalIdentificacion:
                return jsonify({"mensaje": "Historial vacío"}), 200
                
            promedio = sum(item['probabilidad'] for item in self.generalIdentificacion.values()) / len(self.generalIdentificacion)
            
            claseMayoritaria = "---"
            if self.bioEstadisticaFrontend > self.nbEstadisticaFrontend:
                claseMayoritaria = "Biodegradable"
            elif self.nbEstadisticaFrontend > self.bioEstadisticaFrontend:
                claseMayoritaria = "No Biodegradable"
            else:
                claseMayoritaria = "Empate"

            return jsonify({
                'total_en_historial': len(self.generalIdentificacion),
                'promedio_confianza': round(promedio, 4),
                'BiodegradableE': self.bioEstadisticaFrontend,
                'BiodegradableC': self.bioContenedorFrontend,
                'NoBiodegradableE': self.nbEstadisticaFrontend,
                'NoBiodegradableC': self.nbContenedorFrontend,
                'claseMayoritaria': claseMayoritaria
            })

    def resetearEstadisticas(self):
        self.bioContenedorFrontend = 0
        self.nbContenedorFrontend = 0
        return jsonify({"status": "ok"}), 200