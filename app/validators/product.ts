import vine from '@vinejs/vine'

export const createProductValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    price: vine.number().withoutDecimals().min(0),
    // image: vine.string().nullable(),
  })
)
