![CSS3](https://img.shields.io/badge/CSS3-Styling-blue?logo=css3)
![CSS](https://img.shields.io/badge/CSS-3-1572B6?logo=css3)
![Flexbox](https://img.shields.io/badge/Flexbox-Layout-1572B6?logo=css3)
![Grid](https://img.shields.io/badge/Grid-Layout-1572B6?logo=css3)
![Responsive](https://img.shields.io/badge/Responsive-Mobile%20First-blueviolet?logo=css3)
![SASS](https://img.shields.io/badge/SASS-Preprocessor-pink?logo=sass)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple?logo=bootstrap)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss)

# 📚 LibroTech - Sistema de Gestión de Librería
Sistema frontend completo para gestión de librería con operaciones CRUD para Libros, Autores, Categorías y Editoriales.

## 🚀 Características
- ✅ Dashboard con estadísticas en tiempo real
- ✅ CRUD completo para todas las entidades
- ✅ Diseño futurista y corporativo
- ✅ Totalmente responsive
- ✅ Búsqueda en tiempo real
- ✅ Notificaciones toast
- ✅ Modales de confirmación para eliminar
- ✅ Animaciones fluidas

## 📁 Estructura del Proyecto
libreria-frontend/
│
├── index.html          # Página principal
├── README.md           # Este archivo
│
├── css/
│   └── styles.css      # Estilos completos
│
└── js/
    └── app.js          # Lógica de la aplicación

## 🛠️ Instalación
1. Crear la estructura de carpetas:
mkdir libreria-frontend
cd libreria-frontend
mkdir css js

2. Copiar los archivos:
- Copiar index.html en la raíz
- Copiar styles.css en /css/
- Copiar app.js en /js/

3. Abrir en VS Code:
code .

4. Ejecutar con Live Server:
- Instalar extensión "Live Server"
- Click derecho en index.html → "Open with Live Server"
- O abrir index.html en el navegador

## 🔌 Conexión con API (Node.js + PostgreSQL)
El archivo app.js está preparado para conectarse a tu API. Solo necesitas descomentar las llamadas fetch en las funciones CRUD:

// En app.js, línea 1:
const API_URL = 'http://localhost:3000/api';

// Endpoints esperados:
// GET    /api/libros
// GET    /api/libros/:id
// POST   /api/libros
// PUT    /api/libros/:id
// DELETE /api/libros/:id
// Igual para /autores, /categorias, /editoriales

Ejemplo de integración:
async function createItem(type, data) {
    try {
        const response = await fetch(`${API_URL}/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const newItem = await response.json();
        datos[type].push(newItem);
        closeModal();
        renderAll();
        updateStats();
        showToast(`${getSingular(type)} creado exitosamente`, 'success');
    } catch (error) {
        showToast('Error al crear el registro', 'error');
    }
}

## 📊 Tablas de Base de Datos Esperadas
-- Autores
CREATE TABLE autores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    pais VARCHAR(100),
    fecha_nacimiento DATE,
    biografia TEXT
);

-- Categorías
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Editoriales
CREATE TABLE editorial
es (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    pais VARCHAR(100),
    fundacion INTEGER,
    direccion VARCHAR(255)
);

-- Libros
CREATE TABLE libros (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor_id INTEGER REFERENCES autores(id),
    categoria_id INTEGER REFERENCES categorias(id),
    editorial_id INTEGER REFERENCES editoriales(id),
    precio DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    isbn VARCHAR(20),
    año INTEGER
);

## 🎨 Personalización
Cambiar colores principales:
:root {
    --cyan-500: #06b6d4;
    --blue-600: #2563eb;
    --bg-primary: #0a0e1a;
}

## 📱 Responsive
- Desktop (> 1200px)
- Laptop (992px - 1200px)
- Tablet (768px - 991px)
- Mobile (< 768px)

## 🔧 Tecnologías
- HTML5
- CSS3 (Variables, Flexbox, Grid)
- JavaScript ES6+
- Google Fonts (Inter)

## 📝 Licencia
MIT License - Libre para uso personal y comercial.

Desarrollado con ❤️ para tu proyecto de librería

