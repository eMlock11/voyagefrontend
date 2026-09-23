import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../../services/userService'
import { companyService } from '../../services/companyService'
import {
  ArrowLeft,
  Briefcase,
  Mail,
  Lock,
  Phone,
  MapPin,
  Building,
  Camera,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react'
import './EditarPerfil.css'

function EditarPerfilOwner() {
  const navigate = useNavigate()

  const [foto, setFoto] = useState(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')

  // Dados da empresa vinculada
  const [companyId, setCompanyId] = useState(null)
  const [nomeEmpresa, setNomeEmpresa] = useState('')

  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  useEffect(() => {
    const carregarDados = async () => {
      const storedUser = userService.getCurrentUser()
      const token = userService.getToken()

      if (!storedUser) return

      setNome(storedUser.name || '')
      setEmail(storedUser.email || '')
      setTelefone(storedUser.phone || '')

      // Tenta buscar dados atualizados do usuário
      if (storedUser.id && token) {
        try {
          const freshUser = await userService.getUserById(storedUser.id, token)
          if (freshUser) {
            setNome(freshUser.name || storedUser.name || '')
            setEmail(freshUser.email || storedUser.email || '')
            setTelefone(freshUser.phone || storedUser.phone || '')
          }
        } catch {
          // usa dados locais
        }
      }

      // Carrega dados da empresa vinculada para pegar o endereço atual
      try {
        const storedCompany = localStorage.getItem('user_company')
        if (storedCompany) {
          const parsedCompany = JSON.parse(storedCompany)
          if (parsedCompany && (parsedCompany.id || parsedCompany.name)) {
            setCompanyId(parsedCompany.id || null)
            setNomeEmpresa(parsedCompany.name || storedUser.name || '')
            setEndereco(parsedCompany.places || '')
            return
          }
        }

        // Tenta buscar empresa pela lista
        const companies = await companyService.getCompanies()
        if (Array.isArray(companies) && companies.length > 0) {
          const myCompany = companies.find(
            (c) =>
              c.name?.toLowerCase().trim() === storedUser?.name?.toLowerCase().trim() ||
              (storedUser?.cnpj && c.cnpj === storedUser.cnpj)
          )
          if (myCompany) {
            setCompanyId(myCompany.id)
            setNomeEmpresa(myCompany.name || storedUser.name || '')
            setEndereco(myCompany.places || '')
          }
        }
      } catch {
        // empresa não encontrada, endereço fica vazio para preenchimento
      }
    }

    carregarDados()
  }, [])

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
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

    const storedUser = userService.getCurrentUser()
    const token = userService.getToken()

    if (!storedUser) {
      setMensagem({ tipo: 'erro', texto: 'Nenhum usuário logado encontrado.' })
      return
    }

    try {
      setCarregando(true)

      // 1. Atualiza dados do usuário (nome, email, telefone, senha)
      const dadosUsuario = {
        name: nome.trim(),
        email: email.trim(),
        phone: telefone ? telefone.trim() : '',
      }
      if (senha && senha.trim()) {
        dadosUsuario.password = senha
      }

      const usuarioAtualizado = await userService.updateUser(storedUser.id, dadosUsuario, token)
      const novoUser = { ...storedUser, ...dadosUsuario, ...(usuarioAtualizado || {}) }
      localStorage.setItem('user', JSON.stringify(novoUser))

      // 2. Atualiza endereço da empresa (places) se houve mudança
      if (endereco.trim() && companyId) {
        try {
          const storedCompany = JSON.parse(localStorage.getItem('user_company') || '{}')
          const companyPayload = {
            name: storedCompany.name || nome.trim(),
            category: storedCompany.category || 'Outros',
            cnpj: storedCompany.cnpj || '',
            evaluate: storedCompany.evaluate || 4.8,
            places: endereco.trim(),
          }
          const empresaAtualizada = await companyService.updateCompany(companyId, companyPayload)
          localStorage.setItem(
            'user_company',
            JSON.stringify({ ...storedCompany, ...companyPayload, ...(empresaAtualizada || {}) })
          )
        } catch {
          // Avisa mas não bloqueia o fluxo
          setMensagem({
            tipo: 'erro',
            texto: 'Perfil atualizado, mas houve um problema ao salvar o endereço da empresa.',
          })
          setSenha('')
          setCarregando(false)
          return
        }
      }

      setMensagem({ tipo: 'sucesso', texto: 'Perfil de empresário atualizado com sucesso!' })
      setSenha('')
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message || 'Erro ao atualizar perfil.' })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div id="tela-editar-perfil">
      <div className="card-dispositivo card-owner">
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
            <span className="badge-tipo-perfil owner">Perfil Empresário</span>
          </div>
        </div>

        {/* Seção Avatar */}
        <div className="secao-avatar">
          <label htmlFor="input-foto-owner" className="avatar-wrapper" title="Alterar foto de perfil">
            {foto ? (
              <img src={foto} alt="Foto de perfil" className="avatar-imagem" />
            ) : (
              <div className="avatar-placeholder">
                <Building size={46} className="icone-avatar" />
              </div>
            )}
            <div className="overlay-editar-foto">
              <Camera size={18} className="icone-camera" />
            </div>
          </label>
          <input
            id="input-foto-owner"
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            style={{ display: 'none' }}
          />
          {nomeEmpresa && (
            <p className="texto-empresa-avatar">{nomeEmpresa}</p>
          )}
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

          {/* ── Seção: Dados Pessoais ── */}
          <div className="secao-grupo">
            <span className="secao-titulo-form">
              <Briefcase size={14} />
              Dados do Responsável
            </span>

            {/* Nome */}
            <div className="campo-grupo">
              <div className="linha-input">
                <Briefcase className="icone-campo" size={20} />
                <div className="conteudo-input">
                  <span className="label-campo">Nome / Razão Social *</span>
                  <input
                    type="text"
                    className="input-texto"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome do responsável ou razão social"
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
                  <span className="label-campo">E-mail Comercial *</span>
                  <input
                    type="email"
                    className="input-texto"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                    required
                    disabled={carregando}
                  />
                </div>
              </div>
            </div>

            {/* Telefone */}
            <div className="campo-grupo">
              <div className="linha-input">
                <Phone className="icone-campo" size={20} />
                <div className="conteudo-input">
                  <span className="label-campo">Telefone Comercial</span>
                  <input
                    type="tel"
                    className="input-texto"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 0000-0000"
                    disabled={carregando}
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
          </div>

          {/* ── Seção: Dados da Empresa ── */}
          <div className="secao-grupo">
            <span className="secao-titulo-form">
              <MapPin size={14} />
              Dados do Estabelecimento
            </span>

            {/* Endereço */}
            <div className="campo-grupo">
              <div className="linha-input">
                <MapPin className="icone-campo" size={20} />
                <div className="conteudo-input">
                  <span className="label-campo">
                    Endereço Principal da Empresa
                    {!companyId && (
                      <span className="tag-info"> — empresa ainda não cadastrada</span>
                    )}
                  </span>
                  <input
                    type="text"
                    className="input-texto"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, número, bairro e cidade"
                    disabled={carregando || !companyId}
                  />
                  {!companyId && (
                    <span className="hint-campo">
                      Cadastre sua empresa pelo Painel Corporativo antes de editar o endereço.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="secao-botao">
            <button type="submit" className="botao-salvar" disabled={carregando}>
              {carregando ? (
                'Salvando dados...'
              ) : (
                <>
                  <Save size={17} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditarPerfilOwner
