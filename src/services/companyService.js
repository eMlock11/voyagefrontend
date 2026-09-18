const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://voyagegabi.onrender.com';

export const companyService = {
  /**
   * Busca todas as empresas ou com filtro (sem autenticação)
   */
  async getCompanies(query = '') {
    const url = query ? `${API_BASE_URL}/company?${query}` : `${API_BASE_URL}/company`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.error || `Erro ao buscar empresas (${response.status})`);
    }
    return response.json();
  },

  /**
   * Busca uma única empresa por ID (sem autenticação)
   */
  async getCompanyById(id) {
    const response = await fetch(`${API_BASE_URL}/company/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.error || `Erro ao buscar empresa #${id}`);
    }
    return response.json();
  },

  /**
   * Cadastra / insere uma nova empresa no banco de dados (sem autenticação)
   * @param {Object} companyData { name, category, cnpj, evaluate, places }
   */
  async createCompany(companyData) {
    const response = await fetch(`${API_BASE_URL}/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(companyData),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMsg = data?.error || (data?.errors && data.errors.join(', ')) || `Erro ao salvar empresa (${response.status})`;
      throw new Error(errorMsg);
    }
    return data;
  },

  /**
   * Atualiza os dados de uma empresa existente (sem autenticação)
   * @param {number|string} id
   * @param {Object} companyData
   */
  async updateCompany(id, companyData) {
    const response = await fetch(`${API_BASE_URL}/company/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(companyData),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMsg = data?.error || (data?.errors && data.errors.join(', ')) || `Erro ao atualizar empresa (${response.status})`;
      throw new Error(errorMsg);
    }
    return data;
  }
};
