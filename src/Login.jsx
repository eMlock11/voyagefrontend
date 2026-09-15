import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  return (
    <div id="tela-login">
      <div className="card-dispositivo">
        {/* Marca / Logo Voyage */}
        <div className="cabecalho-login">
          <div className="logo-container">
            <span className="logo-icone">V</span>
            <span className="logo-texto">oyage</span>
          </div>
          <p className="subtitulo-login">Seu Destino Começa Aqui</p>
        </div>

        {/* Formulário Monobloco de Login */}
        <form className="formulario-login" onSubmit={(e) => e.preventDefault()}>
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
                <span className="label-campo">E-mail</span>
                <input
                  type="email"
                  className="input-texto"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                />
              </div>
            </div>
            <div className="linha-divisoria"></div>
          </div>

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
                />
              </div>
            </div>
            <div className="linha-divisoria"></div>
          </div>

          {/* Botão Entrar */}
          <div className="secao-botao">
            <button type="submit" className="botao-entrar">
              Entrar
            </button>
          </div>

          {/* Link para Cadastro */}
          <div className="rodape-link">
            <span>Ainda não tem conta? </span>
            <Link to="/cadastro" className="link-cadastro">
              Cadastre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
