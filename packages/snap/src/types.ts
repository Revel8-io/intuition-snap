type Triple = {
  id: string,
  vault_id: string,
  counter_vault_id: string,
  subject: {
    emoji: string,
    label: string,
    image: string,
    id: string,
  },
  predicate: {
    emoji: string,
    label: string,
    image: string,
    id: string,
  },
  object: {
    emoji: string,
    label: string,
    image: string,
    id: string,
  },
}