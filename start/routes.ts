/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import OrdersController from '#controllers/orders_controller'
import ProductsController from '#controllers/products_controller'
import UsersController from '#controllers/users_controller'
import router from '@adonisjs/core/services/router'

router.on('/').redirect("/orders")

router.resource("/users", UsersController)

router.group(() => {
  router.get("", [OrdersController, "index"])
  router.post("", [OrdersController, "create"])
  router.get("list", [OrdersController, "renderListOrder"])
  router.get("new", [OrdersController, "renderNewOrder"])
  router.get("statistics", [OrdersController, "renderOrderStatistics"])
}).prefix("/orders")

router.group(() => {
  router.get("list", [ProductsController, "list"])
}).prefix("/products")
