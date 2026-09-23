const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://voyagegabi.onrender.com';

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

  // Se houver token armazenado e o cabeçalho Authorization não foi passado explicitamente, adiciona
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  // Se receber 401 Unauthorized em uma rota protegida, limpa a sessão e redireciona
  if (response.status === 401 && token) {
    console.warn('Sessão expirada ou não autorizada. Removendo credenciais.');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      data?.error ||
      (data?.errors && Array.isArray(data.errors) ? data.errors.join(', ') : null) ||
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
