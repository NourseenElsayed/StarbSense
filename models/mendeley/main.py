import sys, os, math, random
import numpy as np
import datetime
from fpdf import FPDF
import shutil
import cv2
import matplotlib.pyplot as plt
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QLabel, QPushButton,
    QVBoxLayout, QHBoxLayout, QFileDialog, QDialog, QComboBox, QSpacerItem, QSizePolicy, QLineEdit, QMessageBox
)
from PyQt5.QtGui import QPixmap, QPainter, QColor, QImage, QIcon, QMovie, QIntValidator
from PyQt5.QtCore import Qt, QTimer, QSize
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.nasnet import preprocess_input
import tensorflow as tf
from translations import LANGUAGES

# Carga de modelos y clasificadores
interpreter = tf.lite.Interpreter(model_path="Modelos/NASNETLARGE.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

FACE_CASCADE = cv2.CascadeClassifier("Clasificadores/haarcascade_frontalface_default.xml")
EYE_CASCADE = cv2.CascadeClassifier("Clasificadores/haarcascade_eye.xml")

class GifSplashScreen(QDialog):
    def __init__(self, gif_path, duration_ms=4000):
        super().__init__()
        self.setWindowFlags(Qt.FramelessWindowHint)
        self.setFixedSize(600, 400)
        self.setStyleSheet("background-color: black;")

        self.label = QLabel(self)
        self.label.setAlignment(Qt.AlignCenter)
        self.movie = QMovie(gif_path)
        self.label.setMovie(self.movie)
        self.movie.start()

        layout = QVBoxLayout()
        layout.addWidget(self.label)
        self.setLayout(layout)

        QTimer.singleShot(duration_ms, self.close)

from matplotlib.patches import Wedge

def draw_gauge(value, label):
    import matplotlib.pyplot as plt
    from matplotlib.patches import Wedge

    fig, ax = plt.subplots(figsize=(5, 3), subplot_kw={'aspect': 'equal'})
    ax.set_xlim(-1.2, 1.2)
    ax.set_ylim(-0.2, 1.1)
    ax.axis('off')

    # Fondo semicírculo gris claro
    ax.add_patch(Wedge((0, 0), 1, 0, 180, facecolor='#e0e0e0'))

    # Solo pintar si el valor ≥ 10%
    if value >= 0.10:
        angle = 180 * value
        color = '#f44336' if value >= 0.5 else '#4caf50'
        ax.add_patch(Wedge((0, 0), 1, 0, angle, facecolor=color))

    # Etiquetas
    ax.text(-1.0, -0.1, 'Normal', fontsize=13, ha='center', color='#666')
    ax.text(1.0, -0.1, 'Estrabismo', fontsize=13, ha='center', color='#666')

    # Valor en el centro
    ax.text(0, 0.1, f'{value*100:.1f}%', fontsize=20, fontweight='bold', ha='center', color='#222')

    plt.tight_layout()
    plt.savefig("resultado.png")
    plt.close()

class DialogoPaciente(QDialog):
    def __init__(self, parent=None, idioma="es"):
        super().__init__(parent)
        self.idioma=idioma
        t= LANGUAGES[self.idioma]
        self.setWindowTitle(t["title"])
        self.setFixedSize(360, 200)
        self.setStyleSheet("""
            QDialog {
                background-color: #f0f0f0;
                border-radius: 12px;
            }
            QLabel {
                font: 11pt 'Segoe UI';
                color: #222222;
                background-color: transparent;
            }
            QLineEdit {
                font: 10pt 'Segoe UI';
                padding: 4px 6px;
                border: 1.2px solid #4caf50;
                border-radius: 4px;
                background-color: #ffffff;
                color: #000000;
                min-height: 23px;  /* 👈 Altura más contenida */
            }
            QLineEdit:focus {
                border: 1.5px solid #2e7d32;
            }

            QPushButton {
                background-color: #2e8b57;
                color: white;
                font: bold 11pt 'Segoe UI';
                padding: 8px 20px;
                min-width: 120px;
                max-width: 100px;  /* 👈 Evita que se pase del borde */
                min-height: 20px;
                border-radius: 8px;
                qproperty-iconSize: 10px;
            }
            QPushButton:hover {
                background-color: #3cb371;
            }
        """)

        self.nombre_input = QLineEdit()
        self.nombre_input.setPlaceholderText("Ej. Juan Pérez")

        self.edad_input = QLineEdit()
        self.edad_input.setPlaceholderText("Ej. 32")
        self.edad_input.setValidator(QIntValidator(0, 120))

        self.btn_ok = QPushButton(" " + t["accept"] + " ")
        self.btn_ok.setIcon(QIcon("icons/checked.png"))
        self.btn_ok.setIconSize(QSize(70, 70))
        self.btn_ok.clicked.connect(self.validar_y_aceptar)

        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)
        layout.addWidget(QLabel(t["patient_name"]))
        layout.addWidget(self.nombre_input)
        layout.addWidget(QLabel(t["age"]))
        layout.addWidget(self.edad_input)
        layout.addWidget(self.btn_ok, alignment=Qt.AlignCenter)

        self.setLayout(layout)

    def validar_y_aceptar(self):
        t= LANGUAGES[self.idioma]
        nombre = self.nombre_input.text().strip()
        edad = self.edad_input.text().strip()
        if not nombre or not edad:
            QMessageBox.warning(self, "Faltan datos", f"{t['patient_name']} / {t['age']}")
            return
        self.accept()

    def obtener_datos(self):
        return self.nombre_input.text(), self.edad_input.text()

class EstrabismoApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Módulo de detección de estrabismo")
        self.setFixedSize(1000, 700)
        self.setStyleSheet("background-color: #1c1c1c; color: white;")
        self.image_path = None

        # ===== Datos Paciente ======
        self.nombre_paciente = ""
        self.edad_paciente = ""

        # ===== Layout principal =====
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        self.main_layout = QVBoxLayout(main_widget)
        self.main_layout.setAlignment(Qt.AlignmentFlag.AlignTop)


        # ===== Cabecera con logo a la izquierda y título centrado visualmente =====
        header_layout = QHBoxLayout()

        # Logo
        self.logo_label = QLabel()
        logo_pixmap = QPixmap("Logos/logocorhuila.png").scaled(130, 110, Qt.KeepAspectRatio, Qt.SmoothTransformation)
        self.logo_label.setPixmap(logo_pixmap)
        self.logo_label.setAlignment(Qt.AlignmentFlag.AlignLeft)

        # Título
        self.title_label = QLabel("Módulo de detección de estrabismo")
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setStyleSheet("""
            font: bold italic 24pt 'Courier New';
            color: #ffffff;
        """)

        # Tres columnas para logo, título, y espaciador
        logo_container = QHBoxLayout()
        logo_container.addWidget(self.logo_label, alignment=Qt.AlignmentFlag.AlignLeft)

        title_container = QHBoxLayout()
        title_container.addWidget(self.title_label, alignment=Qt.AlignCenter)

        espaciador = QHBoxLayout()
        espaciador.addStretch()

        # Contenedor horizontal final (logo - título - vacío)
        header_layout.addLayout(logo_container, stretch=1)
        header_layout.addLayout(title_container, stretch=2)
        header_layout.addLayout(espaciador, stretch=1)

        # Añadir cabecera al layout principal
        self.main_layout.addLayout(header_layout)

        # === Botones (ahora alineados y centrados juntos) ===
        button_layout = QHBoxLayout()
        button_layout.setAlignment(Qt.AlignCenter)

        # Botón Usar cámara
        self.btn_camera = QPushButton(" Usar cámara ")
        self.btn_camera.setIcon(QIcon("icons/camera.png"))
        self.btn_camera.setFixedWidth(160)
        self.btn_camera.setStyleSheet("""
            QPushButton {
                background-color: #4682b4;
                color: white;
                font: bold 11pt;
                padding: 10px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #5a9bd3;
            }
        """)
        self.btn_camera.clicked.connect(self.abrir_ventana_camara)

        # Botón Seleccionar Imagen
        self.btn_select = QPushButton(" Seleccionar ")
        self.btn_select.setIcon(QIcon("icons/folder.png"))
        self.btn_select.setFixedWidth(160)
        self.btn_select.setStyleSheet("""
            QPushButton {
                background-color: #2e8b57;
                color: white;
                font: bold 11pt;
                padding: 10px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #3cb371;
            }
        """)
        self.btn_select.clicked.connect(self.seleccionar_imagen)

        # Botón Continuar
        self.btn_predict = QPushButton(" Continuar ")
        self.btn_predict.setIcon(QIcon("icons/next.png"))
        self.btn_predict.setFixedWidth(160)
        self.btn_predict.setStyleSheet("""
            QPushButton {
                background-color: #2e8b57;
                color: white;
                font: bold 11pt;
                padding: 10px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #3cb371;
            }
        """)
        self.btn_predict.clicked.connect(self.realizar_prediccion)

        # Añadir botones al layout
        button_layout.addWidget(self.btn_camera)
        button_layout.addWidget(self.btn_select)
        button_layout.addWidget(self.btn_predict)

        self.main_layout.addLayout(button_layout)

        # ===== Imagen central =====
        self.image_label = QLabel("Selecciona una imagen para continuar")
        self.image_label.setFixedSize(600, 450)
        self.image_label.setAlignment(Qt.AlignCenter)
        self.image_label.setStyleSheet("background-color: white; border: 2px solid #555;")

        self.result_text_label = QLabel("")
        self.result_text_label.setAlignment(Qt.AlignCenter)
        self.result_text_label.setStyleSheet("""
            font: 14pt 'Segoe UI';
            color: #ffffff;
            padding: 10px;
        """)
        self.main_layout.addWidget(self.result_text_label)

        # ===== GIF de carga =====
        self.loading_container = QVBoxLayout()
        self.loading_container.addStretch()  # Espacio arriba

        self.loading_label = QLabel()
        self.loading_movie = QMovie("gif/loading.gif")
        self.loading_label.setMovie(self.loading_movie)
        self.loading_label.setAlignment(Qt.AlignCenter)
        self.loading_label.setVisible(False)  # Oculto por defecto

        self.loading_container.addWidget(self.loading_label, alignment=Qt.AlignCenter)
        self.loading_container.addStretch()  # Espacio abajo

        # Añade el contenedor al layout principal
        self.main_layout.addLayout(self.loading_container)

        image_container = QHBoxLayout()
        image_container.addStretch()
        image_container.addWidget(self.image_label)
        image_container.addStretch()
        self.main_layout.addLayout(image_container)

        # Eventos
        self.es_ojos_directos = False  # Nueva bandera

        # Idioma actual y botón para cambiarlo
        self.current_language = "es"
        self.btn_idioma = QPushButton(" English ")
        self.btn_idioma.setFixedWidth(100)
        self.btn_idioma.setStyleSheet("background-color: #444; color: white; font-weight: bold;")
        self.btn_idioma.setIcon(QIcon("icons/translation.png"))
        self.btn_idioma.setIconSize(QSize(20, 20))
        self.btn_idioma.clicked.connect(self.cambiar_idioma)
        self.btn_idioma.setStyleSheet("""
            QPushButton {
                background-color: #2e8b57;
                color: white;
                font: bold 11pt 'Segoe UI';
                padding: 8px 14px;
                border-radius: 6px;
            }
            QPushButton:hover {
                background-color: #3cb371;
            }
        """)

        # ===== Pie de página con botón de idioma alineado a la derecha =====
        footer_layout = QHBoxLayout()
        footer_layout.addStretch()  # empuja el botón hacia la derecha
        footer_layout.addWidget(self.btn_idioma)
        self.main_layout.addLayout(footer_layout)


        self.widgets_a_ocultar = [
            self.title_label,
            self.btn_camera,
            self.btn_select,
            self.btn_predict,
            self.result_text_label,
            self.btn_idioma,
            self.image_label
        ]

    def abrir_ventana_camara(self):
        self.ocultar_boton_tratamiento()  # ocultar si existe
        self.cam_window = CapturaCamara(self, idioma=self.current_language)
        self.cam_window.show()

    def seleccionar_imagen(self):
        self.ocultar_boton_tratamiento()

        # Reiniciar datos del paciente al seleccionar nueva imagen
        self.nombre_paciente = ""
        self.edad_paciente = ""

        file_path, _ = QFileDialog.getOpenFileName(self, "Abrir imagen", "", "Images (*.png *.jpg *.jpeg)")
        if file_path:
            self.image_path = file_path
            self.es_ojos_directos = "ojos" in os.path.basename(file_path).lower()
            pixmap = QPixmap(file_path).scaled(
                self.image_label.size(), Qt.KeepAspectRatio,
                Qt.SmoothTransformation
            )
            self.image_label.setPixmap(pixmap)

            # ✅ Limpieza del mensaje previo de predicción
            self.result_text_label.setText("")
            self.result_text_label.setStyleSheet("""
                font: 14pt 'Segoe UI';
                color: #ffffff;
                padding: 10px;
            """)

    def detectar_ojos(self):
        if not self.image_path:
            return None

        # Si ya es una imagen de ojos, solo cárgala y devuélvela
        if self.es_ojos_directos:
            return cv2.imread(self.image_path)

        img = cv2.imread(self.image_path)
        img_resized = cv2.resize(img, (256, 256))
        gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
        faces = FACE_CASCADE.detectMultiScale(gray, 1.3, 5)
        for x, y, w, h in faces:
            roi_gray = gray[y:y+h, x:x+w]
            roi_color = img_resized[y:y+h, x:x+w]
            eyes = EYE_CASCADE.detectMultiScale(roi_gray)
            for (ex, ey, ew, eh) in eyes:
                eye_region = roi_color[ey:ey+eh, ex:ex+ew+65]
                return eye_region
        return None

    def realizar_prediccion(self):
        # Obtener datos del paciente solo si no han sido ingresados aún
        if not self.nombre_paciente or not self.edad_paciente:
            dialogo = DialogoPaciente(self, idioma=self.current_language)
            if dialogo.exec() == QDialog.Accepted:
                nombre, edad = dialogo.obtener_datos()
                self.nombre_paciente = nombre
                self.edad_paciente = edad
            else:
                return  # Si se cancela el formulario, no continuar

        # Ocultar contenido
        for widget in self.widgets_a_ocultar:
            widget.setVisible(False)

        self.loading_label.setVisible(True)
        self.loading_movie.start()
        QApplication.processEvents()

        image = self.detectar_ojos()
        if image is None:
            self.loading_label.setVisible(False)
            self.loading_movie.stop()
            for widget in self.widgets_a_ocultar:
                widget.setVisible(True)
            self.image_label.setText("❌ No se detectaron ojos en la imagen cargada.")
            self.result_text_label.setText("Intenta con otra imagen donde los ojos estén visibles.")
            self.result_text_label.setStyleSheet("""
                font: bold 13pt 'Segoe UI';
                color: #f44336;
                padding: 10px;
            """)
            return

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image_resized = cv2.resize(image_rgb, (331, 331))
        x = np.expand_dims(image_resized, axis=0)
        x = preprocess_input(x)
        
        interpreter.set_tensor(input_details[0]['index'], x.astype(np.float32))
        interpreter.invoke()
        preds = interpreter.get_tensor(output_details[0]['index'])[0]

        # Ocultar gif después del análisis
        self.loading_label.setVisible(False)
        self.loading_movie.stop()

        # Volver a mostrar los otros widgets
        for widget in self.widgets_a_ocultar:
            widget.setVisible(True)

        # Gráfico de tipo gauge semicircular
        label = "Estrabismo" if preds[0] > 0.5 else "Normal"
        draw_gauge(preds[0], label)

        pixmap = QPixmap("resultado.png").scaled(
            self.image_label.size(), Qt.KeepAspectRatio,
            Qt.SmoothTransformation
        )
        self.image_label.setPixmap(pixmap)

        # Mostrar texto interpretativo debajo del gráfico según idioma
        t = LANGUAGES[self.current_language]

        if preds[0] < 0.1:
            mensaje = "✅ " + t["diagnosis_normal"]
            color = "#4caf50"  # Verde
        elif preds[0] < 0.5:
            mensaje = "⚠️ " + t["diagnosis_mild"]
            color = "#ff9800"  # Naranja
        else:
            mensaje = "🚨 " + t["diagnosis_high"]
            color = "#f44336"  # Rojo


        self.result_text_label.setText(mensaje)
        self.result_text_label.setStyleSheet(f"""
            font: bold 15pt 'Segoe UI';
            color: {color};
            padding: 12px;
        """)

        # Eliminar emojis para evitar errores de codificación
        mensaje_sin_emojis = mensaje.replace("✅ ", "").replace("⚠️ ", "").replace("🚨 ", "")

        self.guardar_reporte_pdf(
            imagen_path=self.image_path,
            pred=preds[0],
            texto_diagnostico=mensaje_sin_emojis
        )

        if preds[0] > 0.5:
            self.mostrar_boton_tratamiento()


    def mostrar_boton_tratamiento(self):
    # Verificar si ya existe un botón de tratamiento y eliminarlo
        if hasattr(self, 'btn_tratamiento') and self.btn_tratamiento is not None:
            self.main_layout.removeWidget(self.btn_tratamiento)
            self.btn_tratamiento.deleteLater()
            self.btn_tratamiento = None

        # Crear nuevo botón
        self.btn_tratamiento = QPushButton(" Iniciar tratamiento ")
        self.btn_tratamiento.setIcon(QIcon("icons/tratamiento.png"))
        self.btn_tratamiento.setStyleSheet("""
            QPushButton {
                background-color: #2e8b57;
                color: white;
                font: bold 12pt;
                padding: 10px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #3cb371;
            }
        """)
        self.btn_tratamiento.clicked.connect(self.abrir_tratamiento)

        self.main_layout.addWidget(self.btn_tratamiento, alignment=Qt.AlignCenter)
        self.actualizar_textos() 


    def abrir_tratamiento(self):
        self.tratamiento_window = TratamientoVisual(idioma=self.current_language)
        self.tratamiento_window.exec_()

    def ocultar_boton_tratamiento(self):
        if hasattr(self, 'btn_tratamiento') and self.btn_tratamiento is not None:
            self.main_layout.removeWidget(self.btn_tratamiento)
            self.btn_tratamiento.deleteLater()
            self.btn_tratamiento = None

    def guardar_reporte_pdf(self, imagen_path, pred, texto_diagnostico):
        fecha_hora = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        nombre_archivo = f"reporte_estrabismo_{fecha_hora}.pdf"
        ruta_salida = os.path.join("reportes", nombre_archivo)

        os.makedirs("reportes", exist_ok=True)

        pdf = FPDF()
        pdf.add_page()

        # === LOGO INSTITUCIONAL CENTRADO ===
        if os.path.exists("logocorhuila.jpg"):
            pdf.image("logocorhuila.jpg", x=80, y=10, w=50)
            pdf.ln(30)

        # Datos del paciente
        pdf.set_font("Arial", size=12)
        pdf.cell(0, 10, f"Paciente: {self.nombre_paciente}", ln=True, align='C')
        pdf.cell(0, 10, f"Edad: {self.edad_paciente} años", ln=True, align='C')
        pdf.ln(5)

        # === TÍTULO CENTRADO ===
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, "Informe de Detección de Estrabismo", ln=True, align='C')
        pdf.ln(5)

        # === FECHA Y HORA ===
        pdf.set_font("Arial", size=12)
        pdf.cell(0, 10, f"Fecha y hora del análisis: {fecha_hora}", ln=True, align='C')
        pdf.ln(10)

        # === SECCIÓN DE DIAGNÓSTICO ===
        pdf.set_font("Arial", size=12)
        pdf.multi_cell(0, 10, f"Probabilidad estimada de estrabismo: {pred*100:.1f}%")
        pdf.multi_cell(0, 10, f"Diagnóstico automático: {texto_diagnostico}")
        pdf.ln(5)

        # === IMAGEN DEL GRÁFICO ===
        if os.path.exists("resultado.png"):
            pdf.cell(0, 10, "Resultado gráfico:", ln=True, align='C')
            pdf.image("resultado.png", x=30, w=150)
            pdf.ln(10)

        # === IMAGEN ANALIZADA ===
        if os.path.exists(imagen_path):
            pdf.cell(0, 10, "Imagen analizada:", ln=True, align='C')
            pdf.image(imagen_path, x=30, w=150)

        # === ESPACIO RESERVADO PARA FUTURO (datos del paciente) ===
        pdf.ln(10)
        pdf.set_font("Arial", 'I', 10)
        pdf.cell(0, 10, "Este reporte fue generado automáticamente por el módulo de detección.", ln=True, align='C')

        pdf.output(ruta_salida)
        print(f"[INFO] Reporte guardado en: {ruta_salida}")

    def cambiar_idioma(self):
        self.current_language = "en" if self.current_language == "es" else "es"
        self.btn_idioma.setText("Español" if self.current_language == "en" else "English")
        self.actualizar_textos()

    def actualizar_textos(self):
        t = LANGUAGES[self.current_language]

        self.setWindowTitle(t["title"])
        self.title_label.setText(t["title"])
        self.btn_camera.setText(t["use_camera"])
        self.btn_select.setText(t["select_image"])
        self.btn_predict.setText(t["continue"])

        if hasattr(self, 'btn_tratamiento') and self.btn_tratamiento:
            self.btn_tratamiento.setText(t["start_treatment"])


    
from PyQt5.QtWidgets import QGroupBox, QFormLayout
class TratamientoVisual(QDialog):
    def __init__(self, idioma="es"):
        super().__init__()
        self.idioma = idioma
        t = LANGUAGES[self.idioma]
        self.setWindowTitle(t["start_treatment"])
        self.setFixedSize(820, 640)

        self.combo = QComboBox()
        self.patrones = {
            "diagonal": t["patterns"][0],
            "circle": t["patterns"][1],
            "random": t["patterns"][2]
        }
        self.combo.addItems(self.patrones.values())
        self.combo.currentTextChanged.connect(self.set_tipo)
        self.tipo = "diagonal"  # identificador interno


        # -- PARÁMETROS DE DIFICULTAD --
        self.velocidad_combo = QComboBox()
        self.velocidad_combo.addItems(t["speeds"])
        self.velocidad_combo.currentTextChanged.connect(self.cambiar_velocidad)

        self.color_combo = QComboBox()
        self.color_combo.addItems(t["colors"])
        self.color_combo.currentTextChanged.connect(self.cambiar_color)

        self.tamano_combo = QComboBox()
        self.tamano_combo.addItems(t["sizes"])
        self.tamano_combo.currentTextChanged.connect(self.cambiar_tamano)


        self.canvas = QLabel(self)
        self.canvas.setFixedSize(800, 600)
        self.canvas.setStyleSheet("background-color: black;")

        self.label_tiempo = QLabel(t["duration"].format(s=0))
        self.label_tiempo.setStyleSheet("color: white; font-size: 12pt; padding: 5px;")

        self.segundos = 0
        self.timer_tiempo = QTimer()
        self.timer_tiempo.timeout.connect(self.actualizar_tiempo)
        self.timer_tiempo.start(1000)  # cada 1 segundo


        layout = QVBoxLayout()

        # Agrupador de configuración
        config_group = QGroupBox(t["config_title"])
        config_group.setStyleSheet("QGroupBox { font-weight: bold; color: white; }")

        config_layout = QFormLayout()
        config_layout.addRow(t["pattern"], self.combo)
        config_layout.addRow(t["speed"], self.velocidad_combo)
        config_layout.addRow(t["color"], self.color_combo)
        config_layout.addRow(t["size"], self.tamano_combo)
        config_group.setLayout(config_layout)

        layout.addWidget(config_group)
        layout.addWidget(self.canvas)

        layout.addWidget(self.label_tiempo, alignment=Qt.AlignCenter)

        self.setLayout(layout)

        self.setStyleSheet("""
            QDialog {
                background-color: #1e1e1e;
            }
            QLabel {
                color: white;
                font-size: 11pt;
            }
            QComboBox {
                font-size: 11pt;
                padding: 4px;
            }
            QGroupBox {
                margin-top: 10px;
                padding: 10px;
                border: 1px solid #4caf50;
                border-radius: 8px;
            }
        """)


        self.x, self.y = 390, 290
        self.angulo = 0
        self.dx, self.dy = 5, 5

        self.timer = QTimer()
        self.timer.timeout.connect(self.mover_punto)
        # Valores por defecto
        self.color = QColor("red")
        self.tamano = 20
        self.velocidad_combo.setCurrentIndex(1)  # Media / Medium
        self.color_combo.setCurrentIndex(0)      # Rojo / Red
        self.tamano_combo.setCurrentIndex(1)     # Mediano / Medium

        self.timer.start(100)

    def cambiar_velocidad(self, texto):
        velocidad = {"Lenta": 150, "Media": 80, "Rápida": 30,
                     "Slow": 150, "Medium": 80, "Fast": 30}
        self.timer.setInterval(velocidad.get(texto, 100))

    def cambiar_color(self, color):
        colores = {
            "Rojo": QColor("red"), "Verde": QColor("green"),
            "Azul": QColor("blue"), "Amarillo": QColor("yellow"),
            "Red": QColor("red"), "Green": QColor("green"),
            "Blue": QColor("blue"), "Yellow": QColor("yellow")
        }
        self.color = colores.get(color, QColor("red"))

    def cambiar_tamano(self, size):
        tamaños = {"Pequeño": 10, "Mediano": 20, "Grande": 30,
                   "Small": 10, "Medium": 20, "Large": 30}
        self.tamano = tamaños.get(size, 20)

    def set_tipo(self, texto):
        for key, val in self.patrones.items():
            if texto == val:
                self.tipo = key
                break


    def mover_punto(self):
        if self.tipo == "diagonal":
            if self.x <= 0 or self.x >= 780: self.dx *= -1
            if self.y <= 0 or self.y >= 580: self.dy *= -1
            self.x += self.dx
            self.y += self.dy
        elif self.tipo == "circle":
            r = 100
            cx, cy = 400, 300
            self.x = int(cx + r * math.cos(math.radians(self.angulo)))
            self.y = int(cy + r * math.sin(math.radians(self.angulo)))
            self.angulo = (self.angulo + 5) % 360
        elif self.tipo == "random":
            self.x = random.randint(50, 750)
            self.y = random.randint(50, 550)

        self.actualizar_canvas()

    def actualizar_tiempo(self):
        t = LANGUAGES[self.idioma]
        self.segundos += 1
        self.label_tiempo.setText(t["duration"].format(s=self.segundos))


    def actualizar_canvas(self):
        pixmap = QPixmap(800, 600)
        pixmap.fill(QColor("black"))
        painter = QPainter(pixmap)
        painter.setPen(QColor("white"))  # Borde blanco
        painter.setBrush(self.color)     # Color seleccionado
        painter.drawEllipse(self.x, self.y, self.tamano, self.tamano)

        painter.end()
        self.canvas.setPixmap(pixmap)


class CapturaCamara(QDialog):
    def __init__(self, parent=None, idioma="es"):
        super().__init__(parent)
        self.idioma = idioma
        self.t = LANGUAGES[self.idioma]
        self.setWindowTitle(self.t["capture_window"])
        self.setFixedSize(800, 600)
        self.setStyleSheet("background-color: black;")
        self.parent = parent
        self.modo = "rostro"  # o "ojos"

        self.video_label = QLabel(self)
        self.video_label.setFixedSize(800, 500)

        self.btn_capturar = QPushButton(self.t["capture"])
        self.btn_modo = QPushButton(self.t["switch_to_eyes"])
        self.btn_capturar.clicked.connect(self.capturar)
        self.btn_modo.clicked.connect(self.cambiar_modo)

        self.cap = cv2.VideoCapture(0)
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_frame)
        self.timer.start(30)

        layout = QVBoxLayout()
        layout.addWidget(self.video_label)

        btns = QHBoxLayout()
        btns.addStretch()
        btns.addWidget(self.btn_modo)
        btns.addWidget(self.btn_capturar)
        btns.addStretch()

        layout.addLayout(btns)
        self.setLayout(layout)

    def detectar_ojos_cam(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = FACE_CASCADE.detectMultiScale(gray, 1.3, 5)
        for (x, y, w, h) in faces:
            roi_gray = gray[y:y+h, x:x+w]
            roi_color = frame[y:y+h, x:x+w]
            eyes = EYE_CASCADE.detectMultiScale(roi_gray)

            if len(eyes) == 2:
                eyes = sorted(eyes, key=lambda e: e[0])
                ex1, ey1, ew1, eh1 = eyes[0]
                ex2, ey2, ew2, eh2 = eyes[1]

                x1 = min(ex1, ex2)
                y1 = min(ey1, ey2)
                x2 = max(ex1 + ew1, ex2 + ew2)
                y2 = max(ey1 + eh1, ey2 + eh2)

                padding = 10
                x1 = max(0, x1 - padding)
                y1 = max(0, y1 - padding)
                x2 = min(roi_color.shape[1], x2 + padding)
                y2 = min(roi_color.shape[0], y2 + padding)

                eye_region = roi_color[y1:y2, x1:x2]

                # Retornar región de ojos Y coordenadas absolutas en frame original
                return eye_region, (x + x1, y + y1, x2 - x1, y2 - y1)

        return None, None

    def cambiar_modo(self):
        if self.modo == "rostro":
            self.modo = "ojos"
            self.btn_modo.setText(self.t["switch_to_face"])
        else:
            self.modo = "rostro"
            self.btn_modo.setText(self.t["switch_to_eyes"])

    def update_frame(self):
        ret, frame = self.cap.read()
        if not ret:
            return
        frame = cv2.flip(frame, 1)
        display = frame.copy()

        if self.modo == "rostro":
            h, w = display.shape[:2]
            cv2.rectangle(display, (int(w * 0.3), int(h * 0.2)), (int(w * 0.7), int(h * 0.8)), (0, 255, 0), 2)
            cv2.putText(display, self.t["face_mode"], (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)
        else:
            # Llamar a la detección en tiempo real de ojos
            _, eye_coords = self.detectar_ojos_cam(frame)
            if eye_coords is not None:
                ex, ey, ew, eh = eye_coords
                cv2.rectangle(display, (ex, ey), (ex + ew, ey + eh), (0, 255, 255), 2)
                cv2.putText(display, self.t["eyes_detected"], (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)
            else:
                h, w = display.shape[:2]
                cv2.rectangle(display, (int(w * 0.4), int(h * 0.4)), (int(w * 0.6), int(h * 0.6)), (0, 0, 255), 2)
                cv2.putText(display, self.t["searching_eyes"], (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)

        img_rgb = cv2.cvtColor(display, cv2.COLOR_BGR2RGB)
        qimg = QPixmap.fromImage(QImage(img_rgb.data, img_rgb.shape[1], img_rgb.shape[0],
                                        img_rgb.strides[0], QImage.Format.Format_RGB888))
        self.video_label.setPixmap(qimg)


    def capturar(self):
        # En capturar() de CapturaCamara

        ret, frame = self.cap.read()
        if not ret:
            return
        frame = cv2.flip(frame, 1)

        if self.modo == "rostro":
            face = self.detectar_rostro(frame)
            if face is not None:
                self.parent.image_path = "captura.jpg"
                cv2.imwrite(self.parent.image_path, face)
        else:
            # Modo 'ojos': utilizar la detección robusta de dos ojos
            eye_region, _ = self.detectar_ojos_cam(frame)
            # En capturar() de CapturaCamara
            self.parent.es_ojos_directos = True  # solo si es en modo 'ojos'

            if eye_region is not None:
                self.parent.image_path = "captura_ojos.jpg"
                cv2.imwrite(self.parent.image_path, eye_region)
            else:
                # Mostrar advertencia si no se detectaron dos ojos
                QMessageBox.warning(self, self.t["capture_window"], self.t["eye_detection_failed"])
                return

        # Reiniciar los datos del paciente al capturar una nueva imagen
        self.parent.nombre_paciente = ""
        self.parent.edad_paciente = ""
        self.parent.seleccionar_imagen()  # Actualiza el widget con la imagen capturada
        self.close()

    def detectar_rostro(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = FACE_CASCADE.detectMultiScale(gray, 1.3, 5)
        for x, y, w, h in faces:
            return frame[y:y+h, x:x+w]
        return None

    def captura_ojos_directo(self, frame):
        h, w = frame.shape[:2]
        # Extrae área central aproximada donde se esperarían los ojos
        x1 = int(w*0.4)
        x2 = int(w*0.6)
        y1 = int(h*0.4)
        y2 = int(h*0.6)
        return frame[y1:y2, x1:x2]

    def closeEvent(self, event):
        self.cap.release()
        self.timer.stop()
        event.accept()


if __name__ == "__main__":
    app = QApplication(sys.argv)

    splash = GifSplashScreen("gif/logo.gif", duration_ms=4000)
    splash.exec_()  # Espera a que se cierre automáticamente

    ventana = EstrabismoApp()
    ventana.show()

    sys.exit(app.exec_())


