import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userService } from '../../services/userService'
import { companyService } from '../../services/companyService'
import './Cadastro.css'

function Cadastro() {
  const navigate = useNavigate()
  const [foto, setFoto] = useState(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [tipo, setTipo] = useState('client') // 'client' | 'owner'
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')

  // Campos específicos obrigatórios para 'owner' (Empresário / Companhia)
  const [cnpj, setCnpj] = useState('')
  const [categoria, setCategoria] = useState('Lanchonete')
  const [localizacao, setLocalizacao] = useState('')

  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState(null) // { tipo: 'sucesso' | 'erro', texto: string }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFoto(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensagem(null)

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, preencha nome, e-mail e senha.' })
      return
    }

    if (tipo === 'owner') {
      if (!cnpj.trim()) {
        setMensagem({ tipo: 'erro', texto: 'Para conta de Empresário, o CNPJ é obrigatório.' })
        return
      }
      if (!categoria.trim()) {
        setMensagem({ tipo: 'erro', texto: 'Selecione a categoria da sua empresa.' })
        return
      }
      if (!localizacao.trim()) {
        setMensagem({ tipo: 'erro', texto: 'Informe a localização / endereço da empresa.' })
        return
      }
    }

    try {
      setCarregando(true)

      const userPayload = {
        name: nome.trim(),
        email: email.trim(),
        password: senha,
        type: tipo,
      }

      if (telefone.trim()) {
        userPayload.phone = telefone.trim()
      }
      if (cpf.trim()) {
        userPayload.cpf = cpf.trim()
      }

      // 1. Cadastra o usuário / proprietário
      const res = await userService.register(userPayload)

      // Se for empresário (owner), cadastra também a empresa vinculada
      if (tipo === 'owner') {
        try {
          const companyPayload = {
            name: nome.trim(),
            category: categoria.trim(),
            cnpj: cnpj.trim(),
            evaluate: 4.8,
            places: localizacao.trim(),
          }
          const novaEmpresa = await companyService.createCompany(companyPayload)
          if (novaEmpresa) {
            localStorage.setItem('user_company', JSON.stringify(novaEmpresa))
          }
        } catch (compErr) {
          console.warn('Aviso ao registrar dados da empresa vinculada:', compErr.message)
        }
      }

      setMensagem({ tipo: 'sucesso', texto: 'Conta criada com sucesso! Redirecionando...' })
      setTimeout(() => {
        const tipoFinal = res.user?.type || tipo
        navigate(tipoFinal === 'owner' ? '/company' : '/map')
      }, 1500)
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message || 'Erro ao criar conta.' })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div id="tela-cadastro">
      <div className="card-dispositivo">
        {/* Cabeçalho */}
        <div className="cabecalho">
          <h1 className="titulo">Foto de Perfil</h1>
        </div>

        {/* Avatar / Foto de Perfil */}
        <div className="secao-avatar">
          <label htmlFor="input-foto" className="avatar-wrapper" title="Adicionar foto de perfil">
            {foto ? (
              <img src={foto} alt="Prévia do Perfil" className="avatar-imagem" />
            ) : (
              <div className="avatar-placeholder">
                <svg
                  className="icone-avatar"
                  viewBox="0 0 24 24"
                  fill="#ffffff"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                </svg>
              </div>
            )}
          </label>
          <input
            id="input-foto"
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Feedback visual de erro/sucesso */}
        {mensagem && (
          <div
            style={{
              padding: '10px 14px',
              margin: '0 20px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              textAlign: 'center',
              backgroundColor: mensagem.tipo === 'erro' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
              color: mensagem.tipo === 'erro' ? '#ef4444' : '#22c55e',
              border: `1px solid ${mensagem.tipo === 'erro' ? '#ef4444' : '#22c55e'}`,
            }}
          >
            {mensagem.texto}
          </div>
        )}

        {/* Formulário Monobloco */}
        <form className="formulario" onSubmit={handleSubmit}>
          {/* Seletor de Tipo de Conta */}
          <div className="seletor-tipo">
            <button
              type="button"
              className={`btn-tipo ${tipo === 'client' ? 'ativo' : ''}`}
              onClick={() => setTipo('client')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Cliente
            </button>
            <button
              type="button"
              className={`btn-tipo ${tipo === 'owner' ? 'ativo' : ''}`}
              onClick={() => setTipo('owner')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
              </svg>
              Empresário
            </button>
          </div>

          {/* Campo Nome / Razão Social */}
          <div className="campo-grupo">
            <div className="linha-input">
              <svg
                className="icone-campo"
                viewBox="0 0 24 24"
                fill="#ffffff"
                xmlns="http://www.w3.org/2000/svg"
              >
                {tipo === 'owner' ? (
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                ) : (
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                )}
              </svg>
              <div className="conteudo-input">
                <span className="label-campo">
                  {tipo === 'owner' ? 'Nome Fantasia / Empresa' : 'Nome completo'}
                </span>
                <input
                  type="text"
                  className="input-texto"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={tipo === 'owner' ? 'Ex: Pizzaria Bella Napoli' : 'Seu nome completo'}
                  required
                  disabled={carregando}
                />
              </div>
            </div>
            <div className="linha-divisoria"></div>
          </div>

          {/* Campo E-mail */}
          <div className="campo-grupo">
            <div className="linha-input">
              <svg
                className="icone-campo"
                viewBox="0 0 24 24"
                fill="#ffffff"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <div className="conteudo-input">
                <span className="label-campo">E-mail corporativo / comercial</span>
                <input
                  type="email"
                  className="input-texto"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  required
                  disabled={carregando}
                />
              </div>
            </div>
            <div className="linha-divisoria"></div>
          </div>

          {/* CAMPOS OBRIGATÓRIOS PARA OWNER (EMPRESA) */}
          {tipo === 'owner' && (
            <>
              {/* Campo CNPJ (Obrigatório para Owner) */}
              <div className="campo-grupo">
                <div className="linha-input">
                  <svg
                    className="icone-campo"
                    viewBox="0 0 24 24"
                    fill="#ffffff"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                  <div className="conteudo-input">
                    <span className="label-campo">
                      CNPJ <span className="badge-obrigatorio">*</span>
                    </span>
                    <input
                      type="text"
                      className="input-texto"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      required
                      disabled={carregando}
                    />
                  </div>
                </div>
                <div className="linha-divisoria"></div>
              </div>

              {/* Campo Categoria da Empresa (Obrigatório para Owner) */}
              <div className="campo-grupo">
                <div className="linha-input">
                  <svg
                    className="icone-campo"
                    viewBox="0 0 24 24"
                    fill="#ffffff"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                  </svg>
                  <div className="conteudo-input">
                    <span className="label-campo">
                      Categoria da Empresa <span className="badge-obrigatorio">*</span>
                    </span>
                    <select
                      className="select-texto"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      required
                      disabled={carregando}
                    >
                      <option value="Lanchonete">Lanchonete</option>
                      <option value="Restaurante">Restaurante</option>
                      <option value="Pizzaria">Pizzaria</option>
                      <option value="Churrascaria">Churrascaria</option>
                      <option value="Supermercado">Supermercado</option>
                      <option value="Farmácia">Farmácia</option>
                      <option value="Serviços">Serviços</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Bar">Bar</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>
                <div className="linha-divisoria"></div>
              </div>

              {/* Campo Localização / Endereço (Obrigatório para Owner) */}
              <div className="campo-grupo">
                <div className="linha-input">
                  <svg
                    className="icone-campo"
                    viewBox="0 0 24 24"
                    fill="#ffffff"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <div className="conteudo-input">
                    <span className="label-campo">
                      Localização / Endereço Comercial <span className="badge-obrigatorio">*</span>
                    </span>
                    <input
                      type="text"
                      className="input-texto"
                      value={localizacao}
                      onChange={(e) => setLocalizacao(e.target.value)}
                      placeholder="Rua, número, bairro e cidade"
                      required
                      disabled={carregando}
                    />
                  </div>
                </div>
                <div className="linha-divisoria"></div>
              </div>
            </>
          )}

          {/* Campo Telefone (opcional) */}
          <div className="campo-grupo">
            <div className="linha-input">
              <svg
                className="icone-campo"
                viewBox="0 0 24 24"
                fill="#ffffff"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              <div className="conteudo-input">
                <span className="label-campo">
                  Telefone / WhatsApp <span className="badge-opcional">(opcional)</span>
                </span>
                <input
                  type="tel"
                  className="input-texto"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  disabled={carregando}
                />
              </div>
            </div>
            <div className="linha-divisoria"></div>
          </div>

          {/* Campo CPF (apenas para cliente) */}
          {tipo === 'client' && (
            <div className="campo-grupo">
              <div className="linha-input">
                <svg
                  className="icone-campo"
                  viewBox="0 0 24 24"
                  fill="#ffffff"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
                <div className="conteudo-input">
                  <span className="label-campo">
                    CPF <span className="badge-opcional">(opcional)</span>
                  </span>
                  <input
                    type="text"
                    className="input-texto"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    disabled={carregando}
                  />
                </div>
              </div>
              <div className="linha-divisoria"></div>
            </div>
          )}

          {/* Campo Senha */}
          <div className="campo-grupo">
            <div className="linha-input">
              <svg
                className="icone-campo"
                viewBox="0 0 24 24"
                fill="#ffffff"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
              <div className="conteudo-input">
                <span className="label-campo">Senha</span>
                <input
                  type="password"
                  className="input-texto"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder=""
                  required
                  disabled={carregando}
                />
              </div>
            </div>
            <div className="linha-divisoria"></div>
          </div>

          {/* Botão Criar */}
          <div className="secao-botao">
            <button type="submit" className="botao-criar" disabled={carregando}>
              {carregando ? 'Criando...' : 'Criar'}
            </button>
          </div>

          {/* Link para Login */}
          <div className="rodape-link">
            <span>Já possui uma conta? </span>
            <Link to="/login" className="link-entrar">
              Entrar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Cadastro
