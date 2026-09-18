import { api } from './api';

export const companyService = {
  /**
   * Busca todas as empresas ou com filtro.
   * Inclui automaticamente o Bearer token do localStorage se presente.
   */
  async getCompanies(query = '') {
    const endpoint = query ? `/company?${query}` : '/company';
    return await api.get(endpoint);
  },

  /**
   * Busca uma única empresa por ID.
   * Inclui automaticamente o Bearer token do localStorage se presente.
   */
  async getCompanyById(id) {
    return await api.get(`/company/${id}`);
  },

  /**
   * Cadastra / insere uma nova empresa no banco de dados.
   * Inclui automaticamente o Bearer token do localStorage.
   * @param {Object} companyData { name, category, cnpj, evaluate, places }
   */
  async createCompany(companyData) {
    return await api.post('/company', companyData);
  },

  /**
   * Atualiza os dados de uma empresa existente.
   * Inclui automaticamente o Bearer token do localStorage.
   * @param {number|string} id
   * @param {Object} companyData
   */
  async updateCompany(id, companyData) {
    return await api.put(`/company/${id}`, companyData);
  }
};
