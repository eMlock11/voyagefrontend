import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../../services/userService'
import './EditarPerfil.css'

function EditarPerfil() {
  const navigate = useNavigate()

  const [foto, setFoto] = useState(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState(null) // { tipo: 'sucesso' | 'erro', texto: string }

  // Carrega dados do usuário logado ou armazenados
  useEffect(() => {
    const carregarUsuario = async () => {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')

      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser)
          setNome(userObj.name || '')
          setEmail(userObj.email || '')

          // Se tiver token e id, tenta buscar dados mais atualizados do backend
          if (userObj.id && token) {
            const freshUser = await userService.getUserById(userObj.id, token)
            if (freshUser) {
              setNome(freshUser.name || userObj.name || '')
              setEmail(freshUser.email || userObj.email || '')
            }
          }
        } catch {
          // Mantém o estado atual
        }
      }
    }

    carregarUsuario()
  }, [])

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Liberar Object URL anterior para evitar memory leak
      if (foto) URL.revokeObjectURL(foto)
      setFoto(URL.createObjectURL(file))
    }
  }

  const handleVoltar = () => {
    navigate(-1)
  }

  const handleSalvar = async (e) => {
    e.preventDefault()
    setMensagem(null)

    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!storedUser) {
      setMensagem({ tipo: 'erro', texto: 'Nenhum usuário logado encontrado.' })
      return
    }

    try {
      const userObj = JSON.parse(storedUser)
      setCarregando(true)

      const dadosAtualizar = {
        name: nome,
        email: email,
      }
      // Se preencheu nova senha, inclui no payload
      if (senha && senha.trim()) {
        dadosAtualizar.password = senha
      }

      const atualizado = await userService.updateUser(userObj.id, dadosAtualizar, token)

      // Atualiza os dados salvos localmente
      const novoUser = { ...userObj, ...atualizado }
      localStorage.setItem('user', JSON.stringify(novoUser))

      setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' })
      setSenha('')
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message || 'Erro ao atualizar perfil.' })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div id="tela-editar-perfil">
      <div className="card-dispositivo">
        {/* Cabeçalho com botão de retorno e título alinhado à esquerda */}
        <div className="cabecalho-edicao">
          <button
            type="button"
            className="botao-voltar"
            onClick={handleVoltar}
            aria-label="Voltar"
          >
            <svg
              className="icone-voltar"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1 className="titulo-edicao">Editar Perfil</h1>
        </div>

        {/* Avatar / Foto com opção de edição */}
        <div className="secao-avatar">
          <label htmlFor="input-foto-editar" className="avatar-wrapper" title="Alterar foto de perfil">
            {foto ? (
              <img src={foto} alt="Foto de perfil" className="avatar-imagem" />
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
            <div className="overlay-editar-foto">
              <svg
                className="icone-camera"
                viewBox="0 0 24 24"
                fill="#ffffff"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
              </svg>
            </div>
          </label>
          <input
            id="input-foto-editar"
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

        {/* Formulário Monobloco com campos preenchidos */}
        <form className="formulario-edicao" onSubmit={handleSalvar}>
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
                <span className="label-campo">E-mail</span>
                <input
                  type="email"
                  className="input-texto"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  required
                  disabled={carregando}
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
                <span className="label-campo">Nova Senha (opcional)</span>
                <input
                  type="password"
                  className="input-texto"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Deixe em branco para manter a atual"
                  disabled={carregando}
                />
              </div>
            </div>
            <div className="linha-divisoria"></div>
          </div>

          {/* Botão Salvar */}
          <div className="secao-botao">
            <button type="submit" className="botao-salvar" disabled={carregando}>
              {carregando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditarPerfil
