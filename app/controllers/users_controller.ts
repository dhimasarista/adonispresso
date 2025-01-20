import { UserService } from '#services/user_service';
import { inject } from '@adonisjs/core';
import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UsersController {
  constructor(protected userService: UserService){}
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    return response.status(200).json({
      users: await this.userService.all()
    });
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
        "message": "success create user"
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Duplicate entry")) {
          return response.status(409).json({
            "message": "username has been used"
          });
        }
        return response.status(400).json({
          "message": error.message
        });
      }
    }
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const user = await this.userService.findByUsername(params.id)
    return response.status(200).json({ user })
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
        "message": "success update user"
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Duplicate entry")) {
          return response.status(409).json({
            "message": "username has been used"
          });
        }
        return response.status(400).json({
          "message": error.message
        });
      }
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const user  = await this.userService.deleteUser(params.id);
      return response.status(200).json({
        "message": "success update user",
        user,
      });
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({
          "message": error.message
        });
      }
    }
  }
}
