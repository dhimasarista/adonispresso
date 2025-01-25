import { test } from '@japa/runner'

test.group('Product', () => {
  test('test upload image', async ({ client, assert }: any) => {
    const fakeImageBuffer = Buffer.from('fake image content', 'utf-8')
    const response = await client.post("/products/upload")
    .file("image", fakeImageBuffer, {
      filename: "fake-image.jpg",
      contentType: "image/jpeg"
    })

    response.assertStatus(200)
    assert.property(response.body(), "message", "success upload image")
  })
})
