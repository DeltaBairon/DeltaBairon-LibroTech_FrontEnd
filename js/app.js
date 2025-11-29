// ========== CONFIGURACIÓN API ==========
const API_URL = 'http://localhost:4000'; // Cambiar según tu configuración

// ========== DATOS LOCALES (cache temporal) ==========
let datos = {
    libros: [],
    autores: [],
    categorias: [],
    editoriales: []
};

// ========== ESTADO DE LA APLICACIÓN ==========
let currentSection = 'dashboard';
let currentModal = { type: '', mode: '', id: null };
let isLoading = false;

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
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando aplicación...');
    console.log('📡 API URL:', API_URL);
    
    initNavigation();
    initSearch();
    
    try {
        await cargarDatosIniciales();
        console.log('✅ Datos cargados exitosamente');
    } catch (error) {
        console.error('❌ Error al cargar datos iniciales:', error);
        showToast('Error al conectar con el servidor. Verifica que la API esté corriendo.', 'error');
    }
});

// ========== FUNCIONES API ==========
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    console.log(`📤 ${options.method || 'GET'} ${url}`);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        console.log(`📥 Respuesta: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error en respuesta:', errorText);
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error en fetchAPI:', error);
        
        if (error.message.includes('Failed to fetch')) {
            throw new Error('No se pudo conectar con el servidor. Verifica que esté corriendo en ' + API_URL);
        }
        
        throw error;
    }
}

async function cargarDatosIniciales() {
    if (isLoading) return;
    isLoading = true;
    
    console.log('📥 Cargando datos iniciales...');
    showToast('Cargando datos...', 'info');
    
    try {
        // Cargar cada recurso por separado para mejor debugging
        console.log('📚 Cargando libros...');
        const libros = await fetchAPI('/libros');
        datos.libros = libros;
        
        console.log('✍️ Cargando autores...');
        const autores = await fetchAPI('/autores');
        datos.autores = autores;
        
        console.log('📁 Cargando categorías...');
        const categorias = await fetchAPI('/categorias');
        datos.categorias = categorias;
        
        console.log('🏢 Cargando editoriales...');
        const editoriales = await fetchAPI('/editoriales');
        datos.editoriales = editoriales;

        console.log('✅ Todos los datos cargados:', datos);
        
        renderAll();
        updateStats();
        showToast('Datos cargados correctamente', 'success');
        
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        showToast(error.message, 'error');
        throw error;
    } finally {
        isLoading = false;
    }
}

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
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// ========== RENDERIZADO ==========
function renderAll() {
    console.log('🎨 Renderizando todas las secciones...');
    renderLibros();
    renderAutores();
    renderCategorias();
    renderEditoriales();
    renderRecentBooks();
}

function renderLibros() {
    const tbody = document.getElementById('librosTable');
    if (!tbody) return;
    
    console.log('📚 Renderizando libros:', datos.libros.length);
    
    if (datos.libros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No hay libros registrados</td></tr>';
        return;
    }
    
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
                <td>$${parseFloat(libro.precio || 0).toFixed(2)}</td>
                <td>${libro.stock || 0}</td>
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
    if (!tbody) return;
    
    if (datos.autores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No hay autores registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = datos.autores.map(autor => {
        // Formatear fecha para mostrar
        let fechaMostrar = 'N/A';
        if (autor.fecha_nacimiento) {
            const fecha = new Date(autor.fecha_nacimiento + 'T00:00:00');
            fechaMostrar = fecha.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        }
        
        return `
        <tr>
            <td>${autor.id}</td>
            <td><strong>${autor.nombre}</strong></td>
            <td>${autor.pais || 'N/A'}</td>
            <td>${fechaMostrar}</td>
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
        `;
    }).join('');
}

function renderCategorias() {
    const tbody = document.getElementById('categoriasTable');
    if (!tbody) return;
    
    if (datos.categorias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No hay categorías registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = datos.categorias.map(cat => `
        <tr>
            <td>${cat.id}</td>
            <td><strong>${cat.nombre}</strong></td>
            <td>${cat.descripcion || 'N/A'}</td>
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
    if (!tbody) return;
    
    if (datos.editoriales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No hay editoriales registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = datos.editoriales.map(ed => `
        <tr>
            <td>${ed.id}</td>
            <td><strong>${ed.nombre}</strong></td>
            <td>${ed.pais || 'N/A'}</td>
            <td>${ed.fundacion || 'N/A'}</td>
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
    if (!container) return;
    
    const recent = datos.libros.slice(-5).reverse();
    
    if (recent.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No hay libros registrados</p>';
        return;
    }
    
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
                <span class="recent-item-price">$${parseFloat(libro.precio || 0).toFixed(2)}</span>
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
    console.log(`🔧 Abriendo modal: ${mode} ${type}`, id);
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
                        <select id="form-autor_id" required>
                            <option value="">Seleccionar autor</option>
                            ${datos.autores.map(a => `<option value="${a.id}" ${item?.autor_id === a.id ? 'selected' : ''}>${a.nombre}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Categoría</label>
                        <select id="form-categoria_id" required>
                            <option value="">Seleccionar categoría</option>
                            ${datos.categorias.map(c => `<option value="${c.id}" ${item?.categoria_id === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Editorial</label>
                    <select id="form-editorial_id" required>
                        <option value="">Seleccionar editorial</option>
                        ${datos.editoriales.map(e => `<option value="${e.id}" ${item?.editorial_id === e.id ? 'selected' : ''}>${e.nombre}</option>`).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Precio ($)</label>
                        <input type="number" step="0.01" id="form-precio" value="${item?.precio || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Stock</label>
                        <input type="number" id="form-stock" value="${item?.stock || ''}" required>
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
            // Convertir fecha de YYYY-MM-DD a formato que acepta input type="date"
            let fechaParaInput = '';
            if (item?.fecha_nacimiento) {
                // Si viene como YYYY-MM-DD, usarla directamente
                if (item.fecha_nacimiento.includes('-')) {
                    fechaParaInput = item.fecha_nacimiento.split('T')[0]; // Quitar la parte de hora si existe
                }
            }
            
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
                        <input type="date" id="form-fecha_nacimiento" value="${fechaParaInput}">
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
async function handleSubmit() {
    const { type, mode, id } = currentModal;
    
    console.log(`💾 Guardando: ${mode} ${type}`, id);
    
    const formData = getFormData(type);
    console.log('📝 Datos del formulario:', formData);
    
    // Validar campos requeridos
    if (!formData.titulo && type === 'libros') {
        showToast('El título es requerido', 'error');
        return;
    }
    if (!formData.nombre && type !== 'libros') {
        showToast('El nombre es requerido', 'error');
        return;
    }
    
    try {
        if (mode === 'create') {
            await createItem(type, formData);
        } else {
            await updateItem(type, id, formData);
        }
    } catch (error) {
        console.error('❌ Error en handleSubmit:', error);
    }
}

function getFormData(type) {
    const data = {};
    const inputs = modalBody.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        const key = input.id.replace('form-', '');
        let value = input.value;
        
        // Convertir tipos de datos
        if (input.type === 'number') {
            value = value ? parseFloat(value) : null;
        }
        if (key.includes('_id') && value) {
            value = parseInt(value);
        }
        
        // Las fechas ya vienen en formato correcto YYYY-MM-DD desde input type="date"
        // No hacer conversión adicional
        
        // Solo incluir el campo si tiene valor (excepto para números que pueden ser 0)
        if (value !== '' && value !== null) {
            data[key] = value;
        }
    });
    return data;
}

async function createItem(type, data) {
    try {
        console.log(`➕ Creando ${type}:`, data);
        
        const newItem = await fetchAPI(`/${type}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        console.log('✅ Item creado:', newItem);

        // Actualizar cache local
        datos[type].push(newItem);
        
        closeModal();
        renderAll();
        updateStats();
        showToast(`${getSingular(type)} creado exitosamente`, 'success');
        
    } catch (error) {
        console.error('❌ Error al crear:', error);
        showToast(`Error al crear ${getSingular(type).toLowerCase()}: ${error.message}`, 'error');
    }
}

async function updateItem(type, id, data) {
    try {
        console.log(`✏️ Actualizando ${type} ${id}:`, data);
        
        const updatedItem = await fetchAPI(`/${type}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        console.log('✅ Item actualizado:', updatedItem);

        // Actualizar cache local
        const index = datos[type].findIndex(i => i.id === id);
        if (index !== -1) {
            datos[type][index] = { ...datos[type][index], ...updatedItem };
        }
        
        closeModal();
        renderAll();
        showToast(`${getSingular(type)} actualizado exitosamente`, 'success');
        
    } catch (error) {
        console.error('❌ Error al actualizar:', error);
        showToast(`Error al actualizar ${getSingular(type).toLowerCase()}: ${error.message}`, 'error');
    }
}

function openDeleteModal(type, id) {
    console.log(`🗑️ Abriendo modal de eliminación: ${type} ${id}`);
    currentModal = { type, mode: 'delete', id };
    deleteModalOverlay.classList.add('active');
    confirmDeleteBtn.onclick = () => deleteItem(type, id);
}

function closeDeleteModal() {
    deleteModalOverlay.classList.remove('active');
}

async function deleteItem(type, id) {
    try {
        console.log(`🗑️ Eliminando ${type} ${id}`);
        
        await fetchAPI(`/${type}/${id}`, {
            method: 'DELETE'
        });

        console.log('✅ Item eliminado');

        // Actualizar cache local
        datos[type] = datos[type].filter(i => i.id !== id);
        
        closeDeleteModal();
        renderAll();
        updateStats();
        showToast(`${getSingular(type)} eliminado exitosamente`, 'success');
        
    } catch (error) {
        console.error('❌ Error al eliminar:', error);
        showToast(`Error al eliminar ${getSingular(type).toLowerCase()}: ${error.message}`, 'error');
    }
}

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'success') {
    console.log(`📢 Toast [${type}]: ${message}`);
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