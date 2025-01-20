import User from '#models/user'
import { test } from '@japa/runner'

test.group('User model', () => {
  test('create user', async ({ assert }) => {
    const user = await User.create({
      email: "dhimasarista@email.com",
      password: "dhimas_test123",
      username: "dhimasarista"
    })

    assert.isTrue(user.$isPersisted)
  })
})
