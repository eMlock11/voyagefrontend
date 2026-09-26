import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../../services/userService'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  FileText, 
  Camera, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import './EditarPerfil.css'

function EditarPerfilClient() {
  const navigate = useNavigate()

  const [foto, setFoto] = useState(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [cpfCadastradoOriginal, setCpfCadastradoOriginal] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  useEffect(() => {
    const carregarUsuario = async () => {
      const storedUser = userService.getCurrentUser()
      const token = userService.getToken()

      if (storedUser) {
        setNome(storedUser.name || '')
        setEmail(storedUser.email || '')
        setTelefone(storedUser.phone || '')
        if (storedUser.avatar || storedUser.foto) {
          setFoto(storedUser.avatar || storedUser.foto)
        }
        if (storedUser.cpf && storedUser.cpf.trim() !== '') {
          setCpf(storedUser.cpf)
          setCpfCadastradoOriginal(true)
        } else {
          setCpfCadastradoOriginal(false)
        }

        // Tenta sincronizar com dados mais recentes da API
        if (storedUser.id && token) {
          try {
            const freshUser = await userService.getUserById(storedUser.id, token)
            if (freshUser) {
              setNome(freshUser.name || storedUser.name || '')
              setEmail(freshUser.email || storedUser.email || '')
              setTelefone(freshUser.phone || storedUser.phone || '')
              if (freshUser.avatar || freshUser.foto) {
                setFoto(freshUser.avatar || freshUser.foto)
              }
              if (freshUser.cpf && freshUser.cpf.trim() !== '') {
                setCpf(freshUser.cpf)
                setCpfCadastradoOriginal(true)
              }
            }
          } catch {
            // Mantém dados locais se offline ou erro na rota
          }
        }
      }
    }

    carregarUsuario()
  }, [])

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFoto(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVoltar = () => {
    navigate(-1)
  }

  const handleSalvar = async (e) => {
    e.preventDefault()
    setMensagem(null)

    const storedUser = userService.getCurrentUser()
    const token = userService.getToken()

    if (!storedUser) {
      setMensagem({ tipo: 'erro', texto: 'Nenhum usuário logado encontrado.' })
      return
    }

    try {
      setCarregando(true)

      const dadosAtualizar = {
        name: nome.trim(),
        email: email.trim(),
      }

      if (foto) {
        dadosAtualizar.avatar = foto
      }

      // Permite editar telefone
      dadosAtualizar.phone = telefone ? telefone.trim() : ''

      // Permite adicionar CPF caso não existisse previamente cadastrado
      if (!cpfCadastradoOriginal && cpf.trim()) {
        dadosAtualizar.cpf = cpf.trim()
      }

      // Se preencheu nova senha, inclui no payload da requisição
      if (senha && senha.trim()) {
        dadosAtualizar.password = senha
      }

      // Propaga falha da API — não exibe falso sucesso se a requisição falhar
      const atualizado = await userService.updateUser(storedUser.id, dadosAtualizar, token)

      // Atualiza os dados salvos localmente apenas com campos públicos confirmados
      const serverUser = (atualizado && typeof atualizado === 'object') ? (atualizado.user || atualizado) : {}
      const novoUser = {
        ...storedUser,
        name: dadosAtualizar.name,
        email: dadosAtualizar.email,
        phone: dadosAtualizar.phone,
        ...(dadosAtualizar.avatar ? { avatar: dadosAtualizar.avatar } : {}),
        ...serverUser,
      }
      // NUNCA persistir senha no estado persistente ou na sessão
      delete novoUser.password

      localStorage.setItem('user', JSON.stringify(novoUser))
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new CustomEvent('userPlanUpdated', { detail: novoUser }))

      if (!cpfCadastradoOriginal && cpf.trim()) {
        setCpfCadastradoOriginal(true)
      }

      setMensagem({ tipo: 'sucesso', texto: 'Perfil e foto atualizados com sucesso!' })
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
        {/* Cabeçalho */}
        <div className="cabecalho-edicao">
          <button
            type="button"
            className="botao-voltar"
            onClick={handleVoltar}
            aria-label="Voltar"
          >
            <ArrowLeft className="icone-voltar" size={20} />
          </button>
          <div className="titulos-container">
            <h1 className="titulo-edicao">Editar Perfil</h1>
            <span className="badge-tipo-perfil client">Perfil Cliente</span>
          </div>
        </div>

        {/* Seção Avatar */}
        <div className="secao-avatar">
          <label htmlFor="input-foto-client" className="avatar-wrapper" title="Alterar foto de perfil">
            {foto ? (
              <img src={foto} alt="Foto de perfil" className="avatar-imagem" />
            ) : (
              <div className="avatar-placeholder">
                <User size={46} className="icone-avatar" />
              </div>
            )}
            <div className="overlay-editar-foto">
              <Camera size={18} className="icone-camera" />
            </div>
          </label>
          <input
            id="input-foto-client"
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Feedback visual */}
        {mensagem && (
          <div className={`mensagem-alerta ${mensagem.tipo}`}>
            {mensagem.tipo === 'sucesso' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{mensagem.texto}</span>
          </div>
        )}

        {/* Formulário */}
        <form className="formulario-edicao" onSubmit={handleSalvar}>
          {/* Nome */}
          <div className="campo-grupo">
            <div className="linha-input">
              <User className="icone-campo" size={20} />
              <div className="conteudo-input">
                <span className="label-campo">Nome Completo *</span>
                <input
                  type="text"
                  className="input-texto"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  disabled={carregando}
                />
              </div>
            </div>
          </div>

          {/* E-mail */}
          <div className="campo-grupo">
            <div className="linha-input">
              <Mail className="icone-campo" size={20} />
              <div className="conteudo-input">
                <span className="label-campo">E-mail *</span>
                <input
                  type="email"
                  className="input-texto"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  required
                  disabled={carregando}
                />
              </div>
            </div>
          </div>

          {/* Telefone (Adicionar / Editar) */}
          <div className="campo-grupo">
            <div className="linha-input">
              <Phone className="icone-campo" size={20} />
              <div className="conteudo-input">
                <span className="label-campo">Número de Telefone / WhatsApp</span>
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
          </div>

          {/* CPF (Adicionar se não tinha, bloqueado para edição se já cadastrado) */}
          <div className={`campo-grupo ${cpfCadastradoOriginal ? 'campo-bloqueado' : ''}`}>
            <div className="linha-input">
              <FileText className="icone-campo" size={20} />
              <div className="conteudo-input">
                <div className="label-com-status">
                  <span className="label-campo">CPF</span>
                  {cpfCadastradoOriginal && (
                    <span className="tag-imutavel">Não editável</span>
                  )}
                </div>
                <input
                  type="text"
                  className="input-texto"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  disabled={cpfCadastradoOriginal || carregando}
                />
              </div>
            </div>
          </div>

          {/* Nova Senha */}
          <div className="campo-grupo">
            <div className="linha-input">
              <Lock className="icone-campo" size={20} />
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
          </div>

          {/* Botão Salvar */}
          <div className="secao-botao">
            <button type="submit" className="botao-salvar" disabled={carregando}>
              {carregando ? 'Salvando dados...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditarPerfilClient
