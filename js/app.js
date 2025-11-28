// ========== CONFIGURACIÓN API ==========
const API_URL = 'http://localhost:3000/api'; // Cambiar según tu configuración

// ========== DATOS LOCALES (mientras no esté la API) ==========
let datos = {
    libros: [
        { id: 1, titulo: 'Cien años de soledad', autor_id: 1, categoria_id: 1, editorial_id: 1, precio: 29.99, stock: 45, isbn: '978-0307474728', año: 1967 },
        { id: 2, titulo: '1984', autor_id: 2, categoria_id: 2, editorial_id: 2, precio: 19.99, stock: 32, isbn: '978-0451524935', año: 1949 },
        { id: 3, titulo: 'El principito', autor_id: 3, categoria_id: 3, editorial_id: 3, precio: 15.99, stock: 78, isbn: '978-0156012195', año: 1943 },
        { id: 4, titulo: 'Don Quijote de la Mancha', autor_id: 4, categoria_id: 4, editorial_id: 1, precio: 35.99, stock: 25, isbn: '978-8420412146', año: 1605 },
        { id: 5, titulo: 'Rayuela', autor_id: 5, categoria_id: 1, editorial_id: 1, precio: 24.99, stock: 18, isbn: '978-8437604572', año: 1963 },
    ],
    autores: [
        { id: 1, nombre: 'Gabriel García Márquez', pais: 'Colombia', fecha_nacimiento: '1927-03-06', biografia: 'Premio Nobel de Literatura 1982' },
        { id: 2, nombre: 'George Orwell', pais: 'Reino Unido', fecha_nacimiento: '1903-06-25', biografia: 'Autor de obras distópicas' },
        { id: 3, nombre: 'Antoine de Saint-Exupéry', pais: 'Francia', fecha_nacimiento: '1900-06-29', biografia: 'Escritor y aviador francés' },
        { id: 4, nombre: 'Miguel de Cervantes', pais: 'España', fecha_nacimiento: '1547-09-29', biografia: 'Máximo exponente de la literatura española' },
        { id: 5, nombre: 'Julio Cortázar', pais: 'Argentina', fecha_nacimiento: '1914-08-26', biografia: 'Maestro del relato corto' },
    ],
    categorias: [
        { id: 1, nombre: 'Realismo Mágico', descripcion: 'Literatura con elementos fantásticos en contextos realistas' },
        { id: 2, nombre: 'Distopía', descripcion: 'Sociedades futuristas opresivas y totalitarias' },
        { id: 3, nombre: 'Infantil', descripcion: 'Literatura dirigida al público infantil y juvenil' },
        { id: 4, nombre: 'Clásicos', descripcion: 'Obras fundamentales de la literatura universal' },
    ],
    editoriales: [
        { id: 1, nombre: 'Sudamericana', pais: 'Argentina', fundacion: 1939, direccion: 'Buenos Aires' },
        { id: 2, nombre: 'Debolsillo', pais: 'España', fundacion: 1999, direccion: 'Barcelona' },
        { id: 3, nombre: 'Salamandra', pais: 'España', fundacion: 1989, direccion: 'Madrid' },
    ]
};

// ========== ESTADO DE LA APLICACIÓN ==========
let currentSection = 'dashboard';
let currentModal = { type: '', mode: '', id: null };

// ========== ELEMENTOS DOM ==========
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const pageTitle = document.getElementById('pageTitle');
const searchInput = document.getElementById('searchInput');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalSubmit = document.getElementById('modalSubmit');
const deleteModalOverlay = document.getElementById('deleteModalOverlay');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSearch();
    renderAll();
    updateStats();
});

// ========== NAVEGACIÓN ==========
function initNavigation() {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        sidebar.classList.toggle('open');
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            navigateTo(section);
        });
    });
}

function navigateTo(section) {
    currentSection = section;
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });
    sections.forEach(sec => {
        sec.classList.toggle('active', sec.id === `section-${section}`);
    });
    pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
}

// ========== BÚSQUEDA ==========
function initSearch() {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filterCurrentSection(term);
    });
}

function filterCurrentSection(term) {
    if (currentSection === 'dashboard') return;
    const tableBody = document.getElementById(`${currentSection}Table`);
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// ========== RENDERIZADO ==========
function renderAll() {
    renderLibros();
    renderAutores();
    renderCategorias();
    renderEditoriales();
    renderRecentBooks();
}

function renderLibros() {
    const tbody = document.getElementById('librosTable');
    tbody.innerHTML = datos.libros.map(libro => {
        const autor = datos.autores.find(a => a.id === libro.autor_id);
        const categoria = datos.categorias.find(c => c.id === libro.categoria_id);
        const editorial = datos.editoriales.find(e => e.id === libro.editorial_id);
        return `
            <tr>
                <td>${libro.id}</td>
                <td><strong>${libro.titulo}</strong></td>
                <td>${autor?.nombre || 'N/A'}</td>
                <td>${categoria?.nombre || 'N/A'}</td>
                <td>${editorial?.nombre || 'N/A'}</td>
                <td>$${libro.precio.toFixed(2)}</td>
                <td>${libro.stock}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon edit" onclick="openModal('libros', 'edit', ${libro.id})" title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon delete" onclick="openDeleteModal('libros', ${libro.id})" title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderAutores() {
    const tbody = document.getElementById('autoresTable');
    tbody.innerHTML = datos.autores.map(autor => `
        <tr>
            <td>${autor.id}</td>
            <td><strong>${autor.nombre}</strong></td>
            <td>${autor.pais}</td>
            <td>${autor.fecha_nacimiento}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon edit" onclick="openModal('autores', 'edit', ${autor.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="openDeleteModal('autores', ${autor.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderCategorias() {
    const tbody = document.getElementById('categoriasTable');
    tbody.innerHTML = datos.categorias.map(cat => `
        <tr>
            <td>${cat.id}</td>
            <td><strong>${cat.nombre}</strong></td>
            <td>${cat.descripcion}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon edit" onclick="openModal('categorias', 'edit', ${cat.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="openDeleteModal('categorias', ${cat.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderEditoriales() {
    const tbody = document.getElementById('editorialesTable');
    tbody.innerHTML = datos.editoriales.map(ed => `
        <tr>
            <td>${ed.id}</td>
            <td><strong>${ed.nombre}</strong></td>
            <td>${ed.pais}</td>
            <td>${ed.fundacion}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon edit" onclick="openModal('editoriales', 'edit', ${ed.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="openDeleteModal('editoriales', ${ed.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderRecentBooks() {
    const container = document.getElementById('recentBooks');
    const recent = datos.libros.slice(-5).reverse();
    container.innerHTML = recent.map(libro => {
        const autor = datos.autores.find(a => a.id === libro.autor_id);
        return `
            <div class="recent-item">
                <div class="recent-item-info">
                    <div class="recent-item-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                    </div>
                    <div class="recent-item-text">
                        <h4>${libro.titulo}</h4>
                        <p>${autor?.nombre || 'Autor desconocido'}</p>
                    </div>
                </div>
                <span class="recent-item-price">$${libro.precio.toFixed(2)}</span>
            </div>
        `;
    }).join('');
}

function updateStats() {
    document.getElementById('statLibros').textContent = datos.libros.length;
    document.getElementById('statAutores').textContent = datos.autores.length;
    document.getElementById('statCategorias').textContent = datos.categorias.length;
    document.getElementById('statEditoriales').textContent = datos.editoriales.length;
}

// ========== MODALES ==========
function openModal(type, mode, id = null) {
    currentModal = { type, mode, id };
    modalTitle.textContent = mode === 'create' ? `Nuevo ${getSingular(type)}` : `Editar ${getSingular(type)}`;
    modalBody.innerHTML = getFormHTML(type, mode, id);
    modalOverlay.classList.add('active');
    modalSubmit.onclick = () => handleSubmit();
}

function closeModal() {
    modalOverlay.classList.remove('active');
    currentModal = { type: '', mode: '', id: null };
}

function getSingular(type) {
    const map = { libros: 'Libro', autores: 'Autor', categorias: 'Categoría', editoriales: 'Editorial' };
    return map[type] || type;
}

function getFormHTML(type, mode, id) {
    const item = id ? datos[type].find(i => i.id === id) : null;
    
    switch(type) {
        case 'libros':
            return `
                <div class="form-group">
                    <label>Título</label>
                    <input type="text" id="form-titulo" value="${item?.titulo || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Autor</label>
                        <select id="form-autor_id">
                            <option value="">Seleccionar autor</option>
                            ${datos.autores.map(a => `<option value="${a.id}" ${item?.autor_id === a.id ? 'selected' : ''}>${a.nombre}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Categoría</label>
                        <select id="form-categoria_id">
                            <option value="">Seleccionar categoría</option>
                            ${datos.categorias.map(c => `<option value="${c.id}" ${item?.categoria_id === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Editorial</label>
                    <select id="form-editorial_id">
                        <option value="">Seleccionar editorial</option>
                        ${datos.editoriales.map(e => `<option value="${e.id}" ${item?.editorial_id === e.id ? 'selected' : ''}>${e.nombre}</option>`).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Precio ($)</label>
                        <input type="number" step="0.01" id="form-precio" value="${item?.precio || ''}">
                    </div>
                    <div class="form-group">
                        <label>Stock</label>
                        <input type="number" id="form-stock" value="${item?.stock || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>ISBN</label>
                        <input type="text" id="form-isbn" value="${item?.isbn || ''}">
                    </div>
                    <div class="form-group">
                        <label>Año</label>
                        <input type="number" id="form-año" value="${item?.año || ''}">
                    </div>
                </div>
            `;
        case 'autores':
            return `
                <div class="form-group">
                    <label>Nombre completo</label>
                    <input type="text" id="form-nombre" value="${item?.nombre || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>País</label>
                        <input type="text" id="form-pais" value="${item?.pais || ''}">
                    </div>
                    <div class="form-group">
                        <label>Fecha de nacimiento</label>
                        <input type="date" id="form-fecha_nacimiento" value="${item?.fecha_nacimiento || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Biografía</label>
                    <textarea id="form-biografia">${item?.biografia || ''}</textarea>
                </div>
            `;
        case 'categorias':
            return `
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" id="form-nombre" value="${item?.nombre || ''}" required>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea id="form-descripcion">${item?.descripcion || ''}</textarea>
                </div>
            `;
        case 'editoriales':
            return `
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" id="form-nombre" value="${item?.nombre || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>País</label>
                        <input type="text" id="form-pais" value="${item?.pais || ''}">
                    </div>
                    <div class="form-group">
                        <label>Año de fundación</label>
                        <input type="number" id="form-fundacion" value="${item?.fundacion || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Dirección</label>
                    <input type="text" id="form-direccion" value="${item?.direccion || ''}">
                </div>
            `;
        default:
            return '';
    }
}

// ========== CRUD OPERATIONS ==========
function handleSubmit() {
    const { type, mode, id } = currentModal;
    const formData = getFormData(type);
    
    if (mode === 'create') {
        createItem(type, formData);
    } else {
        updateItem(type, id, formData);
    }
}

function getFormData(type) {
    const data = {};
    const inputs = modalBody.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        const key = input.id.replace('form-', '');
        let value = input.value;
        if (input.type === 'number') value = parseFloat(value) || 0;
        if (key.includes('_id')) value = parseInt(value) || null;
        data[key] = value;
    });
    return data;
}

function createItem(type, data) {
    // Generar nuevo ID
    const maxId = Math.max(...datos[type].map(i => i.id), 0);
    data.id = maxId + 1;
    
    // Agregar a datos locales
    datos[type].push(data);
    
    // TODO: Llamar a la API
    // await fetch(`${API_URL}/${type}`, { method: 'POST', body: JSON.stringify(data) });
    
    closeModal();
    renderAll();
    updateStats();
    showToast(`${getSingular(type)} creado exitosamente`, 'success');
}

function updateItem(type, id, data) {
    const index = datos[type].findIndex(i => i.id === id);
    if (index !== -1) {
        datos[type][index] = { ...datos[type][index], ...data };
    }
    
    // TODO: Llamar a la API
    // await fetch(`${API_URL}/${type}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    
    closeModal();
    renderAll();
    showToast(`${getSingular(type)} actualizado exitosamente`, 'success');
}

function openDeleteModal(type, id) {
    currentModal = { type, mode: 'delete', id };
    deleteModalOverlay.classList.add('active');
    confirmDeleteBtn.onclick = () => deleteItem(type, id);
}

function closeDeleteModal() {
    deleteModalOverlay.classList.remove('active');
}

function deleteItem(type, id) {
    datos[type] = datos[type].filter(i => i.id !== id);
    
    // TODO: Llamar a la API
    // await fetch(`${API_URL}/${type}/${id}`, { method: 'DELETE' });
    
    closeDeleteModal();
    renderAll();
    updateStats();
    showToast(`${getSingular(type)} eliminado exitosamente`, 'success');
}

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========== CERRAR MODALES CON ESC ==========
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDeleteModal();
    }
});

// ========== CERRAR MODALES CLICK FUERA ==========
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

deleteModalOverlay.addEventListener('click', (e) => {
    if (e.target === deleteModalOverlay) closeDeleteModal();
});