const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://voyagegabi.onrender.com';

/**
 * Limpa a sessão do usuário de forma centralizada no frontend
 */
export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('user_company');
  localStorage.removeItem('user_profile_data');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
}

/**
 * Utilitário central de requisições que automaticamente injeta
 * o Bearer Token salvo no localStorage no cabeçalho de autorização.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const token = localStorage.getItem('token');

  const isFormData = options.body instanceof FormData;

  const headers = {
    // Não definir Content-Type para FormData — o browser seta automaticamente com boundary
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  // Se houver token armazenado e o cabeçalho Authorization não foi passado explicitamente,
  // injeta apenas para a API do Voyage (nunca para provedores externos)
  const isVoyageApi = !endpoint.startsWith('http') || endpoint.startsWith(API_BASE_URL);
  if (token && !headers['Authorization'] && isVoyageApi) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  // Se receber 401 Unauthorized em uma rota protegida, limpa a sessão centralizada e interrompe o fluxo
  if (response.status === 401) {
    console.warn('Sessão expirada ou não autorizada (401). Limpando credenciais de forma centralizada.');
    clearSession();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    const authError = new Error('Sessão expirada ou não autorizada (401). Faça login novamente.');
    authError.status = 401;
    throw authError;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      data?.error ||
      data?.erro ||
      data?.erroPrincipal ||
      (Array.isArray(data?.solucoesDetalhadas) ? data.solucoesDetalhadas.join(', ') : null) ||
      (Array.isArray(data?.detalhes) ? data.detalhes.join(', ') : null) ||
      (Array.isArray(data?.errors) ? data.errors.join(', ') : null) ||
      data?.message ||
      `Erro na requisição (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'DELETE' }),
};
