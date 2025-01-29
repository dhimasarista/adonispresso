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
  router.get("topsell", [OrdersController, "topSelling"])
}).prefix("/orders")

router.group(() => {
  router.get("", [ProductsController, "index"])
  router.post("", [ProductsController, "store"])
  router.put("", [ProductsController, "update"])
  router.post("image", [ProductsController, "uploadImage"])
  router.delete("image", [ProductsController, "deleteImage"])
  router.get("list", [ProductsController, "listPaginate"])
  router.get("/:id", [ProductsController, "show"])
}).prefix("/products")
