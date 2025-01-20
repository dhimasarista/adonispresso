import { DateTime } from 'luxon'
import { uuidv7 } from "uuidv7";
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'

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
}
