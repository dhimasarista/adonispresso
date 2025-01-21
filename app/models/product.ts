import { DateTime } from 'luxon'
import { uuidv7 } from "uuidv7";
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations';
import OrderItem from './order_item.js';

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedat: DateTime

  @beforeCreate()
  public static async setId(p: Product){
    p.id = uuidv7()
  }

  @hasMany(() => OrderItem, {})
  declare orderItem: HasMany<typeof OrderItem>
}
