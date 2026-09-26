import { api, clearSession } from './api.js';
export { clearSession };

/**
 * Sanitiza o objeto de usuário removendo propriedades sensíveis
 * como senha e garantindo conformidade com a sessão pública.
 * @param {Object} user
 * @returns {Object|null}
 */
export function sanitizeUser(user) {
  if (!user || typeof user !== 'object') return null;
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}

export const userService = {
  /**
   * Realiza login do usuário com email e senha na API Voyage
   * @param {Object} credentials { email, password }
   * @returns {Promise<{ message: string, token: string, user: Object }>}
   */
  async login(credentials) {
    // Limpa resquícios da sessão anterior
    this.clearSession();

    const data = await api.post('/user/login', credentials);
    if (data && data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data && data.user) {
      const safe = sanitizeUser(data.user);
      localStorage.setItem('user', JSON.stringify(safe));
    }
    return data;
  },

  /**
   * Registra um novo usuário no banco de dados
   * @param {Object} userData { name, email, password, type, phone, cpf }
   * @returns {Promise<{ message: string, token: string, user: Object }>}
   */
  async register(userData) {
    this.clearSession();

    const payload = {
      type: 'client',
      ...userData,
    };

    const data = await api.post('/user', payload);
    if (data && data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data && data.user) {
      const safe = sanitizeUser(data.user);
      // Nova conta criada inicia sem plano ativo para fins de teste
      const userWithoutPlan = {
        ...safe,
        plan: 'Nenhum',
        planId: null,
        planStatus: 'inactive',
      };
      localStorage.setItem('user', JSON.stringify(userWithoutPlan));
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
   * Encerra a sessão do usuário e limpa todos os caches de forma centralizada
   */
  logout() {
    clearSession();
  },

  /**
   * Limpa a sessão de forma centralizada
   */
  clearSession() {
    clearSession();
  },

  /**
   * Retorna o token atual do usuário
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Retorna o usuário logado, higienizando qualquer senha de sessões antigas
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    try {
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      if (user && typeof user === 'object' && 'password' in user) {
        delete user.password;
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Atualiza as informações do plano/assinatura do usuário logado no localStorage
   * @param {Object} planData { planId, planName, planStatus, planPrice, planPeriod }
   */
  updateCurrentUserPlan(planData) {
    const user = this.getCurrentUser() || {};
    delete user.password;
    try {
      const updatedUser = {
        ...user,
        plan: planData.planName || user.plan || 'Gratuito',
        planId: planData.planId || user.planId || 'basic',
        planStatus: planData.planStatus || 'active',
        isDemoSubscription: Boolean(planData.isDemoSubscription),
        planPrice: planData.planPrice,
        planPeriod: planData.planPeriod,
        subscriptionDate: new Date().toISOString()
      };
      delete updatedUser.password;
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

