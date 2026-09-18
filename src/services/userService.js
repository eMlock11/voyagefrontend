const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://voyagegabi.onrender.com';

export const userService = {
  /**
   * Realiza login do usuário com email e senha
   * @param {Object} credentials { email, password }
   * @returns {Promise<{ message: string, token: string, user: Object }>}
   */
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMsg =
        data?.error ||
        (data?.errors && data.errors.join(', ')) ||
        `Erro ao realizar login (${response.status})`;
      throw new Error(errorMsg);
    }
    return data;
  },

  /**
   * Registra um novo usuário no banco de dados
   * @param {Object} userData { name, email, password, type, phone, cpf }
   * @returns {Promise<{ message: string, token: string, user: Object }>}
   */
  async register(userData) {
    const payload = {
      type: 'client',
      ...userData,
    };

    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMsg =
        data?.error ||
        (data?.errors && data.errors.join(', ')) ||
        `Erro ao cadastrar usuário (${response.status})`;
      throw new Error(errorMsg);
    }
    return data;
  },

  /**
   * Obtém os dados de um usuário pelo ID
   * @param {number|string} id
   * @param {string} token
   * @returns {Promise<Object>}
   */
  async getUserById(id, token) {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/user/${id}`, {
      headers,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMsg =
        data?.error ||
        (data?.errors && data.errors.join(', ')) ||
        `Erro ao buscar usuário #${id}`;
      throw new Error(errorMsg);
    }
    return data;
  },

  /**
   * Atualiza os dados do perfil do usuário
   * @param {number|string} id
   * @param {Object} userData
   * @param {string} token
   * @returns {Promise<Object>}
   */
  async updateUser(id, userData, token) {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/user/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userData),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMsg =
        data?.error ||
        (data?.errors && data.errors.join(', ')) ||
        `Erro ao atualizar usuário (${response.status})`;
      throw new Error(errorMsg);
    }
    return data;
  },

  /**
   * Lista usuários (requer permissão de admin)
   * @param {string} query
   * @param {string} token
   * @returns {Promise<Array>}
   */
  async getUsers(query = '', token) {
    const url = query ? `${API_BASE_URL}/user?${query}` : `${API_BASE_URL}/user`;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      headers,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMsg =
        data?.error ||
        (data?.errors && data.errors.join(', ')) ||
        `Erro ao buscar usuários (${response.status})`;
      throw new Error(errorMsg);
    }
    return data;
  },
};
