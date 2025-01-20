import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.integer("quantity").unsigned()
      table.uuid("order_id").references("id").inTable("orders")
      table.uuid("product_id").references("id").inTable("products")

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp("deleted_at").nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
