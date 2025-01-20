import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.enum('status', ["pending", "success", "cancel"]).defaultTo("pending")
      table.bigInteger("total_amount").unsigned()
      table.string("transaction_token").nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp("deleted_at").nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
