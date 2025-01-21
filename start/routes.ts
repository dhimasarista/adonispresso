/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import OrdersController from '#controllers/orders_controller'
import UsersController from '#controllers/users_controller'
import router from '@adonisjs/core/services/router'

router.on('/').redirect("/orders")

router.resource("/users", UsersController)

router.group(() => {
  router.get("", [OrdersController, "render"])
  router.get("/list", [OrdersController, "index"])
}).prefix("/orders")
