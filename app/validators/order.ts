import vine from '@vinejs/vine'

export const createOrderValidator = vine.compile(
  vine.object({
    totalAmount: vine.number().min(0).positive(),
  })
)
