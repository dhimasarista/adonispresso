import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    username: vine.string().trim().minLength(6),
    email: vine.string().trim(),
    password: vine.string().trim().minLength(6)
  })
)
