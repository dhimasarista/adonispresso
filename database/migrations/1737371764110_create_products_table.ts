import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string("name")
      table.bigInteger("price").unsigned()
      table.string("image").nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp("deleted_at").nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
