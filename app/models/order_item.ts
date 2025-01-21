import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import Order from './order.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { uuidv7 } from 'uuidv7'
import Product from './product.js'

export default class OrderItem extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare quantity: number

    @column()
    declare orderId: string

    @column()
    declare productId: string

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @column.dateTime()
    declare deletedAt: DateTime | null

    @beforeCreate()
    static async setId(orderItem: OrderItem) {
      orderItem.id = uuidv7()
    }

    @belongsTo(() => Order)
    declare order: BelongsTo<typeof Order>

    @belongsTo(() => Product)
    declare product: BelongsTo<typeof Product>
}
