import { ProductService } from '#services/product_service'
import { test } from '@japa/runner'

test.group('Product', () => {
  test('delete product', async ({ assert }) => {
    const productId = "0194b2e7-f1d9-74fa-9e55-e48e98b1d681";
    const productService = new ProductService()
    const deletedProduct = await productService.delete(productId);

    assert.equal(deletedProduct.message, `product ${productId} deleted`);
  })
})
