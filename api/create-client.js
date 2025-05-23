import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { email, password, name, phone, cpf_cnpj, address, admin_id } = req.body

  // Validação simples
  if (!email || !password || !name || !admin_id) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
  }

  // 1. Cria o usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError) {
    return res.status(400).json({ error: `Erro no auth: ${authError.message}` })
  }

  const userId = authData.user.id

  // 2. Cria registro na tabela `users`
  const { error: insertError } = await supabase.from('users').insert({
    id: userId,
    name,
    email,
    phone,
    cpf_cnpj,
    address,
    role: 'client',
    admin_id
  })

  if (insertError) {
    return res.status(400).json({ error: `Erro no banco: ${insertError.message}` })
  }

  return res.status(200).json({ success: true, user_id: userId })
}
