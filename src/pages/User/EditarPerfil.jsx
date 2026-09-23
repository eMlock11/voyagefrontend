import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../../services/userService'
import EditarPerfilClient from './EditarPerfilClient'
import EditarPerfilOwner from './EditarPerfilOwner'

/**
 * EditarPerfil — Roteador Inteligente
 * Detecta o tipo do usuário logado e renderiza a tela correta:
 *   - type === 'owner'  → EditarPerfilOwner  (Empresário)
 *   - type === 'client' → EditarPerfilClient (Cliente)
 */
function EditarPerfil() {
  const navigate = useNavigate()
  const currentUser = userService.getCurrentUser()

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true })
    }
  }, [currentUser, navigate])

  if (!currentUser) return null

  if (currentUser.type === 'owner') {
    return <EditarPerfilOwner />
  }

  return <EditarPerfilClient />
}

export default EditarPerfil
