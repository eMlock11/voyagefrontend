import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userService } from '../../services/userService'
import { Mail, Lock, Eye, EyeOff, Compass, Building2, MapPin, ShieldCheck, ArrowRight } from 'lucide-react'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState(null) // { tipo: 'sucesso' | 'erro', texto: string }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensagem(null)

    if (!email.trim() || !senha.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, informe e-mail e senha.' })
      return
    }

    try {
      setCarregando(true)
      const res = await userService.login({
        email: email,
        password: senha,
      })

      setMensagem({ tipo: 'sucesso', texto: 'Login efetuado com sucesso! Redirecionando...' })
      setTimeout(() => {
        const userType = res.user?.type
        navigate(userType === 'owner' ? '/company' : '/map')
      }, 1000)
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message || 'Credenciais inválidas.' })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div id="tela-login">
      <div className="login-wrapper">
        {/* Lado Esquerdo: Vitrine Institucional Voyage (Desktop) */}
        <div className="login-hero-panel">
          <div className="login-hero-glow"></div>
          
          <div className="login-brand-header">
            <div className="brand-logo-badge">
              <Compass className="brand-icon" size={28} />
            </div>
            <div className="brand-text">
              <span className="brand-name">Voyage</span>
              <span className="brand-tag">Platform</span>
            </div>
          </div>

          <div className="login-hero-content">
            <h1 className="hero-title">
              Descubra lugares incríveis e impulsione o seu <span className="highlight-text">negócio local</span>.
            </h1>
            <p className="hero-description">
              A plataforma inteligente que conecta estabelecimentos comerciais a milhares de clientes através de geolocalização e rotas em tempo real.
            </p>

            <div className="hero-features-grid">
              <div className="hero-feature-item">
                <div className="feature-icon-wrapper">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4>Exploração GIS</h4>
                  <p>Mapeamento de rotas e pontos de interesse com precisão.</p>
                </div>
              </div>

              <div className="hero-feature-item">
                <div className="feature-icon-wrapper">
                  <Building2 size={20} />
                </div>
                <div>
                  <h4>Gestão Empresarial</h4>
                  <p>Painel com métricas, filiais e visibilidade comercial.</p>
                </div>
              </div>

              <div className="hero-feature-item">
                <div className="feature-icon-wrapper">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4>Acesso Seguro</h4>
                  <p>Perfis protegidos e autenticação centralizada.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-footer-note">
            <span className="voyage-demo-badge">Versão Web Desktop</span>
            <span>Experiência corporativa otimizada</span>
          </div>
        </div>

        {/* Lado Direito: Formulário de Autenticação */}
        <div className="login-card-container">
          <div className="login-card">
            <div className="card-header">
              <div className="mobile-brand-row">
                <Compass className="mobile-brand-icon" size={24} />
                <span className="mobile-brand-name">Voyage</span>
              </div>
              <h2 className="card-title">Acesse sua conta</h2>
              <p className="card-subtitle">Insira suas credenciais para continuar no sistema</p>
            </div>

            {/* Alerta de Feedback */}
            {mensagem && (
              <div className={`mensagem-alerta ${mensagem.tipo}`}>
                <span>{mensagem.texto}</span>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label" htmlFor="email-input">E-mail</label>
                <div className="input-field-wrapper">
                  <Mail className="input-leading-icon" size={18} />
                  <input
                    id="email-input"
                    type="email"
                    className="custom-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    required
                    disabled={carregando}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="input-label-row">
                  <label className="input-label" htmlFor="password-input">Senha</label>
                </div>
                <div className="input-field-wrapper">
                  <Lock className="input-leading-icon" size={18} />
                  <input
                    id="password-input"
                    type={mostrarSenha ? 'text' : 'password'}
                    className="custom-input"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••••"
                    required
                    disabled={carregando}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="btn-toggle-password"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    tabIndex={-1}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary-login" disabled={carregando}>
                {carregando ? (
                  <span>Autenticando...</span>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="card-footer">
              <span className="footer-text">Não tem uma conta ainda?</span>
              <Link to="/cadastro" className="footer-link">
                Cadastre-se gratuitamente
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
