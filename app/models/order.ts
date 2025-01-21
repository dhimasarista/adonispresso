import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { uuidv7 } from 'uuidv7'
import OrderItem from './order_item.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare status: string

  @column({ columnName: "total_amount" })
  declare totalAmount: number

  @column()
  declare transactionToken: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @beforeCreate()
  static async setId(order: Order) {
    order.id = uuidv7()
  }

  @hasMany(() => OrderItem, {})
  declare orderItems: HasMany<typeof OrderItem>
}
