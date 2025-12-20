import { jsonPlaceholderAPI } from '../api/jsonplaceholder.js';
import { formatDate, truncateText, capitalize } from '../utils/helpers.js';

export class UIManager {
    constructor() {
        // Elementos principais
        this.app = document.getElementById('app');
        this.loading = document.getElementById('loading');
        this.errorDiv = document.getElementById('error');
        
        // Navegação
        this.navLinks = document.querySelectorAll('[data-resource]');
        
        // Cache de estado
        this.currentResource = 'posts';
        this.currentView = 'list';
        this.currentItemId = null;
        
        // Inicializar
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadResource('posts');
    }
    
    setupEventListeners() {
        // Navegação por recursos
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const resource = e.target.dataset.resource;
                this.loadResource(resource);
            });
        });
        
        // Eventos delegados
        this.app.addEventListener('click', (e) => {
            // Ver detalhes
            if (e.target.classList.contains('view-details')) {
                const id = e.target.dataset.id;
                const resource = e.target.dataset.resource;
                this.showDetails(resource, id);
            }
            
            // Editar item
            if (e.target.classList.contains('edit-item')) {
                const id = e.target.dataset.id;
                const resource = e.target.dataset.resource;
                this.showEditForm(resource, id);
            }
            
            // Deletar item
            if (e.target.classList.contains('delete-item')) {
                const id = e.target.dataset.id;
                const resource = e.target.dataset.resource;
                this.deleteItem(resource, id);
            }
            
            // Criar novo
            if (e.target.classList.contains('create-new')) {
                const resource = e.target.dataset.resource;
                this.showCreateForm(resource);
            }
            
            // Voltar para lista
            if (e.target.classList.contains('back-to-list')) {
                this.loadResource(this.currentResource);
            }
        });
        
        // Formulários
        this.app.addEventListener('submit', (e) => {
            if (e.target.classList.contains('item-form')) {
                e.preventDefault();
                const resource = e.target.dataset.resource;
                const id = e.target.dataset.id;
                
                if (id) {
                    this.updateItem(resource, id, e.target);
                } else {
                    this.createItem(resource, e.target);
                }
            }
        });
    }
    
    async loadResource(resource) {
        try {
            this.showLoading();
            this.clearError();
            
            this.currentResource = resource;
            this.currentView = 'list';
            
            // Atualizar navegação ativa
            this.navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.resource === resource);
            });
            
            // Carregar dados
            const data = await this.fetchResource(resource);
            
            // Renderizar lista
            this.renderList(resource, data);
            
        } catch (error) {
            this.showError(`Erro ao carregar ${resource}: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }
    
    async fetchResource(resource) {
        switch(resource) {
            case 'posts':
                return await jsonPlaceholderAPI.getPosts();
            case 'comments':
                return await jsonPlaceholderAPI.getComments();
            case 'albums':
                return await jsonPlaceholderAPI.getAlbums();
            case 'photos':
                return await jsonPlaceholderAPI.getPhotos();
            case 'todos':
                return await jsonPlaceholderAPI.getTodos();
            case 'users':
                return await jsonPlaceholderAPI.getUsers();
            default:
                throw new Error(`Recurso não suportado: ${resource}`);
        }
    }
    
    renderList(resource, items) {
        let html = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>${capitalize(resource)} (${items.length})</h2>
                <button class="btn btn-primary create-new" data-resource="${resource}">
                    <i class="bi bi-plus-circle"></i> Novo ${resource.slice(0, -1)}
                </button>
            </div>
        `;
        
        if (items.length === 0) {
            html += `<div class="alert alert-info">Nenhum ${resource} encontrado.</div>`;
        } else {
            html += `<div class="row">`;
            
            items.forEach(item => {
                html += this.renderListItem(resource, item);
            });
            
            html += `</div>`;
        }
        
        this.app.innerHTML = html;
    }
    
    renderListItem(resource, item) {
        switch(resource) {
            case 'posts':
                return this.renderPostItem(item);
            case 'comments':
                return this.renderCommentItem(item);
            case 'albums':
                return this.renderAlbumItem(item);
            case 'photos':
                return this.renderPhotoItem(item);
            case 'todos':
                return this.renderTodoItem(item);
            case 'users':
                return this.renderUserItem(item);
            default:
                return `<div>Formato não suportado</div>`;
        }
    }
    
    renderPostItem(post) {
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${truncateText(post.title, 50)}</h5>
                        <p class="card-text">${truncateText(post.body, 100)}</p>
                        <div class="mt-3">
                            <small class="text-muted">User ID: ${post.userId}</small>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-sm btn-outline-primary view-details" 
                                data-resource="posts" data-id="${post.id}">
                            Ver detalhes
                        </button>
                        <button class="btn btn-sm btn-outline-secondary edit-item" 
                                data-resource="posts" data-id="${post.id}">
                            Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-item" 
                                data-resource="posts" data-id="${post.id}">
                            Deletar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCommentItem(comment) {
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h6 class="card-subtitle mb-2 text-muted">${comment.email}</h6>
                        <h5 class="card-title">${truncateText(comment.name, 50)}</h5>
                        <p class="card-text">${truncateText(comment.body, 100)}</p>
                        <div class="mt-3">
                            <small class="text-muted">Post ID: ${comment.postId}</small>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-sm btn-outline-primary view-details" 
                                data-resource="comments" data-id="${comment.id}">
                            Ver detalhes
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPhotoItem(photo) {
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <img src="${photo.thumbnailUrl}" class="card-img-top" alt="${photo.title}">
                    <div class="card-body">
                        <h5 class="card-title">${truncateText(photo.title, 50)}</h5>
                        <div class="mt-3">
                            <small class="text-muted">Album ID: ${photo.albumId}</small>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-sm btn-outline-primary view-details" 
                                data-resource="photos" data-id="${photo.id}">
                            Ver detalhes
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderTodoItem(todo) {
        const completedClass = todo.completed ? 'success' : 'warning';
        const completedText = todo.completed ? 'Concluído' : 'Pendente';
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title">${truncateText(todo.title, 50)}</h5>
                            <span class="badge bg-${completedClass}">${completedText}</span>
                        </div>
                        <div class="mt-3">
                            <small class="text-muted">User ID: ${todo.userId}</small>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-sm btn-outline-primary view-details" 
                                data-resource="todos" data-id="${todo.id}">
                            Ver detalhes
                        </button>
                        <button class="btn btn-sm btn-outline-secondary edit-item" 
                                data-resource="todos" data-id="${todo.id}">
                            Editar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderUserItem(user) {
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${user.name}</h5>
                        <p class="card-text">
                            <small>@${user.username}</small><br>
                            <i class="bi bi-envelope"></i> ${user.email}<br>
                            <i class="bi bi-phone"></i> ${user.phone}<br>
                            <i class="bi bi-globe"></i> ${user.website}
                        </p>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-sm btn-outline-primary view-details" 
                                data-resource="users" data-id="${user.id}">
                            Ver detalhes
                        </button>
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="uiManager.loadUserPosts(${user.id})">
                            Ver posts
                        </button>
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="uiManager.loadUserAlbums(${user.id})">
                            Ver álbuns
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAlbumItem(album) {
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${truncateText(album.title, 50)}</h5>
                        <div class="mt-3">
                            <small class="text-muted">User ID: ${album.userId}</small>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-sm btn-outline-primary view-details" 
                                data-resource="albums" data-id="${album.id}">
                            Ver detalhes
                        </button>
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="uiManager.loadAlbumPhotos(${album.id})">
                            Ver fotos
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    async showDetails(resource, id) {
        try {
            this.showLoading();
            this.clearError();
            
            this.currentView = 'details';
            this.currentItemId = id;
            
            let data;
            let relatedData = null;
            
            // Carregar dados principais
            switch(resource) {
                case 'posts':
                    data = await jsonPlaceholderAPI.getPost(id);
                    relatedData = await jsonPlaceholderAPI.getPostComments(id);
                    break;
                case 'comments':
                    data = await jsonPlaceholderAPI.getComment(id);
                    break;
                case 'albums':
                    data = await jsonPlaceholderAPI.getAlbum(id);
                    break;
                case 'photos':
                    data = await jsonPlaceholderAPI.getPhoto(id);
                    break;
                case 'todos':
                    data = await jsonPlaceholderAPI.getTodo(id);
                    break;
                case 'users':
                    data = await jsonPlaceholderAPI.getUser(id);
                    break;
            }
            
            // Renderizar detalhes
            this.renderDetails(resource, data, relatedData);
            
        } catch (error) {
            this.showError(`Erro ao carregar detalhes: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }
    
    renderDetails(resource, data, relatedData = null) {
        let html = `
            <div class="mb-4">
                <button class="btn btn-outline-secondary back-to-list">
                    <i class="bi bi-arrow-left"></i> Voltar para lista
                </button>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Detalhes do ${resource.slice(0, -1)} #${data.id}</h3>
                </div>
                <div class="card-body">
                    ${this.renderDetailsContent(resource, data)}
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary edit-item" 
                            data-resource="${resource}" data-id="${data.id}">
                        Editar
                    </button>
                    <button class="btn btn-danger delete-item" 
                            data-resource="${resource}" data-id="${data.id}">
                        Deletar
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar dados relacionados se existirem
        if (relatedData && relatedData.length > 0) {
            html += this.renderRelatedData(resource, relatedData);
        }
        
        this.app.innerHTML = html;
    }
    
    renderDetailsContent(resource, data) {
        let content = '';
        
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object') {
                content += `
                    <div class="mb-3">
                        <strong>${capitalize(key)}:</strong>
                        <pre class="mt-1 p-2 bg-light rounded">${JSON.stringify(value, null, 2)}</pre>
                    </div>
                `;
            } else {
                content += `
                    <div class="mb-2">
                        <strong>${capitalize(key)}:</strong> ${value}
                    </div>
                `;
            }
        }
        
        return content;
    }
    
    renderRelatedData(resource, data) {
        let title = '';
        switch(resource) {
            case 'posts':
                title = 'Comentários';
                break;
            default:
                return '';
        }
        
        let html = `
            <div class="mt-5">
                <h4>${title} (${data.length})</h4>
                <div class="row mt-3">
        `;
        
        data.forEach(item => {
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h6>${item.name || item.title}</h6>
                            <p class="small">${item.email || ''}</p>
                            <p class="mb-0">${truncateText(item.body, 150)}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    async showCreateForm(resource) {
        this.currentView = 'create';
        
        const formHtml = this.getFormTemplate(resource, null);
        this.app.innerHTML = `
            <div class="mb-4">
                <button class="btn btn-outline-secondary back-to-list">
                    <i class="bi bi-arrow-left"></i> Voltar para lista
                </button>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Criar novo ${resource.slice(0, -1)}</h3>
                </div>
                <div class="card-body">
                    ${formHtml}
                </div>
            </div>
        `;
    }
    
    async showEditForm(resource, id) {
        try {
            this.showLoading();
            
            let data;
            switch(resource) {
                case 'posts':
                    data = await jsonPlaceholderAPI.getPost(id);
                    break;
                case 'todos':
                    data = await jsonPlaceholderAPI.getTodo(id);
                    break;
                default:
                    throw new Error('Edição não suportada para este recurso');
            }
            
            this.currentView = 'edit';
            this.currentItemId = id;
            
            const formHtml = this.getFormTemplate(resource, data);
            this.app.innerHTML = `
                <div class="mb-4">
                    <button class="btn btn-outline-secondary back-to-list">
                        <i class="bi bi-arrow-left"></i> Voltar para lista
                    </button>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Editar ${resource.slice(0, -1)} #${id}</h3>
                    </div>
                    <div class="card-body">
                        ${formHtml}
                    </div>
                </div>
            `;
            
        } catch (error) {
            this.showError(`Erro ao carregar formulário: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }
    
    getFormTemplate(resource, data) {
        const isEdit = !!data;
        
        switch(resource) {
            case 'posts':
                return `
                    <form class="item-form" data-resource="${resource}" data-id="${data?.id || ''}">
                        <div class="mb-3">
                            <label for="userId" class="form-label">User ID</label>
                            <input type="number" class="form-control" id="userId" name="userId" 
                                   value="${data?.userId || ''}" required>
                        </div>
                        <div class="mb-3">
                            <label for="title" class="form-label">Título</label>
                            <input type="text" class="form-control" id="title" name="title" 
                                   value="${data?.title || ''}" required>
                        </div>
                        <div class="mb-3">
                            <label for="body" class="form-label">Conteúdo</label>
                            <textarea class="form-control" id="body" name="body" rows="5" required>${data?.body || ''}</textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? 'Atualizar' : 'Criar'}
                        </button>
                    </form>
                `;
                
            case 'todos':
                return `
                    <form class="item-form" data-resource="${resource}" data-id="${data?.id || ''}">
                        <div class="mb-3">
                            <label for="userId" class="form-label">User ID</label>
                            <input type="number" class="form-control" id="userId" name="userId" 
                                   value="${data?.userId || ''}" required>
                        </div>
                        <div class="mb-3">
                            <label for="title" class="form-label">Título</label>
                            <input type="text" class="form-control" id="title" name="title" 
                                   value="${data?.title || ''}" required>
                        </div>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="completed" name="completed" 
                                   ${data?.completed ? 'checked' : ''}>
                            <label class="form-check-label" for="completed">Concluído</label>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? 'Atualizar' : 'Criar'}
                        </button>
                    </form>
                `;
                
            default:
                return `<div class="alert alert-warning">Formulário não disponível para este recurso.</div>`;
        }
    }
    
    async createItem(resource, form) {
        try {
            this.showLoading();
            this.clearError();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Converter tipos
            if (data.userId) data.userId = parseInt(data.userId);
            if (data.completed) data.completed = data.completed === 'on';
            
            let result;
            switch(resource) {
                case 'posts':
                    result = await jsonPlaceholderAPI.createPost(data);
                    break;
                case 'todos':
                    result = await jsonPlaceholderAPI.updatePost(1, data); // Simulação
                    break;
                default:
                    throw new Error('Criação não suportada');
            }
            
            // Limpar cache
            jsonPlaceholderAPI.clearCache();
            
            // Mostrar sucesso e voltar para lista
            this.showSuccess(`${resource.slice(0, -1)} criado com sucesso! ID: ${result.id}`);
            setTimeout(() => this.loadResource(resource), 1500);
            
        } catch (error) {
            this.showError(`Erro ao criar: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }
    
    async updateItem(resource, id, form) {
        try {
            this.showLoading();
            this.clearError();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Converter tipos
            if (data.userId) data.userId = parseInt(data.userId);
            if (data.completed) data.completed = data.completed === 'on';
            
            switch(resource) {
                case 'posts':
                    await jsonPlaceholderAPI.updatePost(id, data);
                    break;
                case 'todos':
                    await jsonPlaceholderAPI.patchPost(id, data);
                    break;
                default:
                    throw new Error('Atualização não suportada');
            }
            
            // Limpar cache
            jsonPlaceholderAPI.clearCache();
            
            // Mostrar sucesso
            this.showSuccess(`${resource.slice(0, -1)} atualizado com sucesso!`);
            setTimeout(() => this.showDetails(resource, id), 1500);
            
        } catch (error) {
            this.showError(`Erro ao atualizar: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }
    
    async deleteItem(resource, id) {
        if (!confirm(`Tem certeza que deseja deletar este ${resource.slice(0, -1)}?`)) {
            return;
        }
        
        try {
            this.showLoading();
            this.clearError();
            
            switch(resource) {
                case 'posts':
                    await jsonPlaceholderAPI.deletePost(id);
                    break;
                default:
                    throw new Error('Deleção não suportada para este recurso');
            }
            
            // Limpar cache
            jsonPlaceholderAPI.clearCache();
            
            // Mostrar sucesso
            this.showSuccess(`${resource.slice(0, -1)} deletado com sucesso!`);
            setTimeout(() => this.loadResource(resource), 1500);
            
        } catch (error) {
            this.showError(`Erro ao deletar: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }
    
    async loadUserPosts(userId) {
        try {
            this.showLoading();
            const posts = await jsonPlaceholderAPI.getUserPosts(userId);
            this.renderList('posts', posts);
            this.currentResource = 'posts';
        } catch (error) {
            this.showError(`Erro ao carregar posts do usuário: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }
    
    async loadUserAlbums(userId) {
        try {
            this.showLoading();
            const albums = await jsonPlaceholderAPI.getUserAlbums(userId);
            this.renderList('albums', albums);
            this.currentResource = 'albums';
        } catch (error) {
            this.showError(`Erro ao carregar álbuns do usuário: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }
    
    async loadAlbumPhotos(albumId) {
        try {
            this.showLoading();
            const photos = await jsonPlaceholderAPI.getAlbumPhotos(albumId);
            this.renderList('photos', photos);
            this.currentResource = 'photos';
        } catch (error) {
            this.showError(`Erro ao carregar fotos do álbum: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }
    
    // Métodos auxiliares de UI
    showLoading() {
        if (this.loading) {
            this.loading.style.display = 'block';
        }
    }
    
    hideLoading() {
        if (this.loading) {
            this.loading.style.display = 'none';
        }
    }
    
    showError(message) {
        if (this.errorDiv) {
            this.errorDiv.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            this.errorDiv.style.display = 'block';
        }
    }
    
    showSuccess(message) {
        if (this.errorDiv) {
            this.errorDiv.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            this.errorDiv.style.display = 'block';
        }
    }
    
    clearError() {
        if (this.errorDiv) {
            this.errorDiv.innerHTML = '';
            this.errorDiv.style.display = 'none';
        }
    }
}