import { api } from './api';

export const userService = {
  /**
   * Realiza login do usuário com email e senha na API Voyage
   * @param {Object} credentials { email, password }
   * @returns {Promise<{ message: string, token: string, user: Object }>}
   */
  async login(credentials) {
    const data = await api.post('/user/login', credentials);
    if (data && data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
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

    const data = await api.post('/user', payload);
    if (data && data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Obtém os dados de um usuário pelo ID
   * O Bearer token é injetado automaticamente a partir do localStorage.
   * @param {number|string} id
   * @param {string} [token] - Opcional, caso queira passar manualmente
   * @returns {Promise<Object>}
   */
  async getUserById(id, token) {
    const options = {};
    if (token) {
      options.headers = { Authorization: `Bearer ${token}` };
    }
    return await api.get(`/user/${id}`, options);
  },

  /**
   * Atualiza os dados do perfil do usuário
   * O Bearer token é injetado automaticamente a partir do localStorage.
   * @param {number|string} id
   * @param {Object} userData
   * @param {string} [token] - Opcional
   * @returns {Promise<Object>}
   */
  async updateUser(id, userData, token) {
    const options = {};
    if (token) {
      options.headers = { Authorization: `Bearer ${token}` };
    }
    return await api.put(`/user/${id}`, userData, options);
  },

  /**
   * Lista usuários (requer permissão de admin)
   * @param {string} query
   * @param {string} [token]
   * @returns {Promise<Array>}
   */
  async getUsers(query = '', token) {
    const endpoint = query ? `/user?${query}` : '/user';
    const options = {};
    if (token) {
      options.headers = { Authorization: `Bearer ${token}` };
    }
    return await api.get(endpoint, options);
  },

  /**
   * Encerra a sessão do usuário no frontend
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_company');
    localStorage.removeItem('user_profile_data');
  },

  /**
   * Retorna o token atual do usuário
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Retorna o usuário logado
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Atualiza as informações do plano/assinatura do usuário logado no localStorage
   * @param {Object} planData { planId, planName, planStatus, planPrice, planPeriod }
   */
  updateCurrentUserPlan(planData) {
    const userStr = localStorage.getItem('user');
    try {
      const user = userStr ? JSON.parse(userStr) : {};
      const updatedUser = {
        ...user,
        plan: planData.planName || user.plan || 'Gratuito',
        planId: planData.planId || user.planId || 'basic',
        planStatus: planData.planStatus || 'active',
        planPrice: planData.planPrice,
        planPeriod: planData.planPeriod,
        subscriptionDate: new Date().toISOString()
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('userPlanUpdated', { detail: updatedUser }));
      return updatedUser;
    } catch {
      return null;
    }
  },

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

