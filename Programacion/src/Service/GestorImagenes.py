import os
from pathlib import Path
from flask import jsonify

class GaleriaManager:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parent.parent.parent
        self.imagenes_dir = self.base_dir / "static" / "imagenes"
        self.imagenes_dir.mkdir(parents=True, exist_ok=True)

    def listarImagenes(self):
        try:
            extensiones = {'.jpg', '.jpeg', '.png', '.webp'}
            archivos = [
                f.name for f in self.imagenes_dir.iterdir()
                if f.is_file() 
                and f.suffix.lower() in extensiones 
                and f.name != 'placeholder.jpg'
            ]
            archivos.sort(reverse=True)
            return jsonify(archivos), 200
        except Exception as e:
            print(f"Error localizando imágenes en {self.imagenes_dir}: {e}")
            return jsonify([]), 500

    def eliminarImagenes(self):
        try:
            eliminados = 0
            for archivo in self.imagenes_dir.iterdir():
                if archivo.is_file() and archivo.name != 'placeholder.jpg':
                    archivo.unlink()
                    eliminados += 1
            return jsonify({
                "mensaje": f"Se eliminaron {eliminados} imágenes.", 
                "status": "success"            
                }), 200
        except Exception as e:
            print(f"Error al limpiar galería: {e}")
            return jsonify({
                "mensaje": "Error al limpiar la galería", 
                "status": "error"
            }), 500