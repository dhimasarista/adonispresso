import { UserService } from '#services/user_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UsersController {
  constructor(protected userService: UserService){}
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    try {
      return response.status(200).json({
        message: "get users",
        users: await this.userService.all()
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        return response.status(500).json({
          message: "internal server error"
        });
      }
    }
  }

  /**
   * Display form to create a new record
   */
  // async create({request, response}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({request, response}: HttpContext) {
    try {
      await this.userService.createUser(request.body());
      return response.status(200).json({
        message: "success create user"
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Duplicate entry")) {
          return response.status(409).json({
            message: "username has been used"
          });
        }
        console.error(error.message);
        return response.status(500).json({
          message: "internal server error"
        });
      }
    }
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    try {
      const user = await this.userService.findByUsername(params.id)
      return response.status(200).json({ user })
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "E_ROW_NOT_FOUND") {
          return response.status(404).json({
            message: "username not found"
          });
        }
        console.error(error)
        return response.status(500).json({
          message: "internal server error"
        });
      }
    }
  }

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response}: HttpContext) {
    try {
      await this.userService.updateUser(params.id, request.body());
      return response.status(200).json({
        message: "success update user"
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Duplicate entry")) {
          return response.status(409).json({
            message: "username has been used"
          });
        }
        if (error.name === "E_ROW_NOT_FOUND") {
          return response.status(404).json({
            message: "user not found"
          });
        }
        console.error(error);
        return response.status(500).json({
          message: "internal server error"
        });
      }
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    try {
      await this.userService.deleteUser(params.id);
      return response.status(200).json({
        message: "success deleted user",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "E_ROW_NOT_FOUND") {
          return response.status(404).json({
            message: "user not found"
          });
        }
        console.error(error)
        return response.status(500).json({
          message: "internal server error"
        });
      }
    }
  }
}
