import Product from '#models/product'
import { test } from '@japa/runner'

test.group('Order', () => {
  test('get a list of users', async ({ client }: any) => {
    const products = await Product.all();
    const response = await client.post('/order').json({
      products: {
        product_id: products[0].id,
        quantity: 2,
      }
    })

    response.assertStatus(200)
    response.assertBody({
      data: [
        {
          id: 1,
          email: 'foo@bar.com',
        }
      ]
    })
  })
})
