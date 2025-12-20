const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Cache para otimização
const cache = new Map();
const CACHE_DURATION = 300000; // 5 minutos

export const jsonPlaceholderAPI = {
    // Função utilitária para fetch com tratamento de erros
    async request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        
        // Verificar cache para requisições GET
        if (!options.method || options.method === 'GET') {
            const cached = cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                console.log(`Cache hit: ${endpoint}`);
                return cached.data;
            }
        }
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Para DELETE (não retorna conteúdo)
            if (response.status === 204) {
                return null;
            }
            
            const data = await response.json();
            
            // Armazenar no cache para GET
            if (!options.method || options.method === 'GET') {
                cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
            }
            
            return data;
            
        } catch (error) {
            console.error(`Erro na requisição ${endpoint}:`, error);
            throw error;
        }
    },
    
    // === POSTS ===
    
    // GET /posts - Listar todos os posts
    async getPosts() {
        return this.request('/posts');
    },
    
    // GET /posts/:id - Obter um post específico
    async getPost(id) {
        return this.request(`/posts/${id}`);
    },
    
    // GET /posts/:id/comments - Comentários de um post
    async getPostComments(postId) {
        return this.request(`/posts/${postId}/comments`);
    },
    
    // POST /posts - Criar novo post
    async createPost(postData) {
        return this.request('/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    },
    
    // PUT /posts/:id - Atualizar post completo
    async updatePost(id, postData) {
        return this.request(`/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    },
    
    // PATCH /posts/:id - Atualizar parcialmente
    async patchPost(id, postData) {
        return this.request(`/posts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(postData)
        });
    },
    
    // DELETE /posts/:id - Deletar post
    async deletePost(id) {
        return this.request(`/posts/${id}`, {
            method: 'DELETE'
        });
    },
    
    // === COMMENTS ===
    
    async getComments() {
        return this.request('/comments');
    },
    
    async getComment(id) {
        return this.request(`/comments/${id}`);
    },
    
    // GET /comments?postId=:id - Comentários por post
    async getCommentsByPost(postId) {
        return this.request(`/comments?postId=${postId}`);
    },
    
    // === ALBUMS ===
    
    async getAlbums() {
        return this.request('/albums');
    },
    
    async getAlbum(id) {
        return this.request(`/albums/${id}`);
    },
    
    // GET /albums/:id/photos - Fotos de um álbum
    async getAlbumPhotos(albumId) {
        return this.request(`/albums/${albumId}/photos`);
    },
    
    // === PHOTOS ===
    
    async getPhotos() {
        return this.request('/photos');
    },
    
    async getPhoto(id) {
        return this.request(`/photos/${id}`);
    },
    
    // === TODOS ===
    
    async getTodos() {
        return this.request('/todos');
    },
    
    async getTodo(id) {
        return this.request(`/todos/${id}`);
    },
    
    // GET /todos?userId=:id - Todos por usuário
    async getTodosByUser(userId) {
        return this.request(`/todos?userId=${userId}`);
    },
    
    // === USERS ===
    
    async getUsers() {
        return this.request('/users');
    },
    
    async getUser(id) {
        return this.request(`/users/${id}`);
    },
    
    // GET /users/:id/posts - Posts de um usuário
    async getUserPosts(userId) {
        return this.request(`/users/${userId}/posts`);
    },
    
    // GET /users/:id/albums - Álbuns de um usuário
    async getUserAlbums(userId) {
        return this.request(`/users/${userId}/albums`);
    },
    
    // GET /users/:id/todos - Todos de um usuário
    async getUserTodos(userId) {
        return this.request(`/users/${userId}/todos`);
    },
    
    // === FILTROS E PESQUISA ===
    
    // Filtro genérico por query parameters
    async filter(resource, filters) {
        const queryString = new URLSearchParams(filters).toString();
        return this.request(`/${resource}?${queryString}`);
    },
    
    // === UTILITÁRIOS ===
    
    // Limpar cache
    clearCache() {
        cache.clear();
    },
    
    // Estatísticas do cache
    getCacheStats() {
        return {
            size: cache.size,
            keys: Array.from(cache.keys())
        };
    }
};