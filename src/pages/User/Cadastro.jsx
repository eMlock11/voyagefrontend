import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userService } from '../../services/userService'
import { companyService } from '../../services/companyService'
import { 
  User, 
  Briefcase, 
  Mail, 
  Lock, 
  Phone, 
  FileText, 
  Tag, 
  MapPin, 
  Camera, 
  ArrowRight, 
  Compass,
  CheckCircle2
} from 'lucide-react'
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

  // Campos específicos para 'owner' (Empresário)
  const [cnpj, setCnpj] = useState('')
  const [categoria, setCategoria] = useState('Lanchonete')
  const [localizacao, setLocalizacao] = useState('')

  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState(null) // { tipo: 'sucesso' | 'erro', texto: string }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Liberar Object URL anterior para evitar memory leak
      if (foto) URL.revokeObjectURL(foto)
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

      // 1. Cadastra o usuário
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
      <div className="cadastro-wrapper">
        {/* Top Header */}
        <div className="cadastro-header">
          <div className="brand-badge-row">
            <Compass className="brand-badge-icon" size={24} />
            <span className="brand-badge-title">Voyage</span>
          </div>
          <h1 className="cadastro-title">Crie sua Conta</h1>
          <p className="cadastro-subtitle">
            Junte-se ao Voyage para explorar pontos de interesse ou gerenciar seu estabelecimento
          </p>
        </div>

        {/* Feedback visual */}
        {mensagem && (
          <div className={`mensagem-alerta ${mensagem.tipo}`}>
            <span>{mensagem.texto}</span>
          </div>
        )}

        <form className="cadastro-form" onSubmit={handleSubmit}>
          {/* Seletor de Perfil em Cards */}
          <div className="perfil-cards-container">
            <button
              type="button"
              className={`perfil-card ${tipo === 'client' ? 'ativo' : ''}`}
              onClick={() => setTipo('client')}
            >
              <div className="perfil-card-icon">
                <User size={22} />
              </div>
              <div className="perfil-card-info">
                <span className="perfil-card-title">Sou Cliente</span>
                <span className="perfil-card-desc">Quero explorar rotas e estabelecimentos</span>
              </div>
              {tipo === 'client' && <CheckCircle2 className="perfil-check-icon" size={18} />}
            </button>

            <button
              type="button"
              className={`perfil-card ${tipo === 'owner' ? 'ativo' : ''}`}
              onClick={() => setTipo('owner')}
            >
              <div className="perfil-card-icon">
                <Briefcase size={22} />
              </div>
              <div className="perfil-card-info">
                <span className="perfil-card-title">Sou Empresário</span>
                <span className="perfil-card-desc">Quero divulgar e gerenciar minha empresa</span>
              </div>
              {tipo === 'owner' && <CheckCircle2 className="perfil-check-icon" size={18} />}
            </button>
          </div>

          {/* Seção do Avatar com Upload */}
          <div className="avatar-upload-section">
            <label htmlFor="input-foto" className="avatar-preview-box" title="Escolha uma foto de perfil">
              {foto ? (
                <img src={foto} alt="Prévia do Perfil" className="avatar-img-preview" />
              ) : (
                <div className="avatar-placeholder-inner">
                  <User size={38} className="avatar-default-icon" />
                  <div className="avatar-camera-badge">
                    <Camera size={14} />
                  </div>
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
            <div className="avatar-text-col">
              <span className="avatar-label">Foto de Perfil</span>
              <span className="avatar-hint">Opcional. Formatos JPG, PNG ou WebP</span>
            </div>
          </div>

          {/* Grid de Campos em 2 Colunas para Desktop */}
          <div className="form-fields-grid">
            {/* Nome Completo / Nome Fantasia */}
            <div className="input-group">
              <label className="input-label" htmlFor="name-input">
                {tipo === 'owner' ? 'Nome Fantasia da Empresa *' : 'Nome Completo *'}
              </label>
              <div className="input-field-wrapper">
                {tipo === 'owner' ? <Briefcase className="input-leading-icon" size={18} /> : <User className="input-leading-icon" size={18} />}
                <input
                  id="name-input"
                  type="text"
                  className="custom-input"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={tipo === 'owner' ? 'Ex: Restaurante Sabor & Arte' : 'Seu nome completo'}
                  required
                  disabled={carregando}
                />
              </div>
            </div>

            {/* E-mail */}
            <div className="input-group">
              <label className="input-label" htmlFor="email-input">E-mail Comercial / Pessoal *</label>
              <div className="input-field-wrapper">
                <Mail className="input-leading-icon" size={18} />
                <input
                  id="email-input"
                  type="email"
                  className="custom-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@dominio.com"
                  required
                  disabled={carregando}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="input-group">
              <label className="input-label" htmlFor="password-input">Senha de Acesso *</label>
              <div className="input-field-wrapper">
                <Lock className="input-leading-icon" size={18} />
                <input
                  id="password-input"
                  type="password"
                  className="custom-input"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 10 caracteres"
                  required
                  disabled={carregando}
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="input-group">
              <label className="input-label" htmlFor="phone-input">Telefone / WhatsApp (opcional)</label>
              <div className="input-field-wrapper">
                <Phone className="input-leading-icon" size={18} />
                <input
                  id="phone-input"
                  type="tel"
                  className="custom-input"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  disabled={carregando}
                />
              </div>
            </div>

            {/* Campos Específicos para CLIENT */}
            {tipo === 'client' && (
              <div className="input-group full-width-field">
                <label className="input-label" htmlFor="cpf-input">CPF (opcional)</label>
                <div className="input-field-wrapper">
                  <FileText className="input-leading-icon" size={18} />
                  <input
                    id="cpf-input"
                    type="text"
                    className="custom-input"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    disabled={carregando}
                  />
                </div>
              </div>
            )}

            {/* Campos Específicos para OWNER (Empresário) */}
            {tipo === 'owner' && (
              <>
                <div className="input-group">
                  <label className="input-label" htmlFor="cnpj-input">CNPJ da Empresa *</label>
                  <div className="input-field-wrapper">
                    <FileText className="input-leading-icon" size={18} />
                    <input
                      id="cnpj-input"
                      type="text"
                      className="custom-input"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      required
                      disabled={carregando}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="category-select">Categoria do Estabelecimento *</label>
                  <div className="input-field-wrapper">
                    <Tag className="input-leading-icon" size={18} />
                    <select
                      id="category-select"
                      className="custom-input custom-select"
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

                <div className="input-group full-width-field">
                  <label className="input-label" htmlFor="location-input">Endereço Principal / Localização *</label>
                  <div className="input-field-wrapper">
                    <MapPin className="input-leading-icon" size={18} />
                    <input
                      id="location-input"
                      type="text"
                      className="custom-input"
                      value={localizacao}
                      onChange={(e) => setLocalizacao(e.target.value)}
                      placeholder="Rua, número, bairro e cidade"
                      required
                      disabled={carregando}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Ação de Submissão */}
          <div className="cadastro-actions">
            <button type="submit" className="btn-primary-cadastro" disabled={carregando}>
              {carregando ? (
                <span>Criando Conta...</span>
              ) : (
                <>
                  <span>Concluir Cadastro</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          <div className="cadastro-footer">
            <span className="footer-text">Já possui cadastro?</span>
            <Link to="/login" className="footer-link">
              Acesse sua conta existente
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Cadastro
