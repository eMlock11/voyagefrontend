import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Cadastro.css'

function Cadastro() {
  const [foto, setFoto] = useState(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFoto(URL.createObjectURL(file))
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

        {/* Formulário Monobloco */}
        <form className="formulario" onSubmit={(e) => e.preventDefault()}>
          {/* Campo Nome */}
          <div className="campo-grupo">
            <div className="linha-input">
              <svg
                className="icone-campo"
                viewBox="0 0 24 24"
                fill="#ffffff"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <div className="conteudo-input">
                <span className="label-campo">Nome</span>
                <input
                  type="text"
                  className="input-texto"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder=""
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

          {/* Botão Criar */}
          <div className="secao-botao">
            <button type="submit" className="botao-criar">
              Criar
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
