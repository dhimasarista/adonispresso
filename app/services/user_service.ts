import User from "#models/user";
import { DateTime } from "luxon";

export class UserService {
  public async all() {
    return await User.query().select("*").whereNull("deleted_at");
  }

  public async createUser(data: any) {
    this.validate(data); // validasi data menggunakan regex
    const newUser = await User.create(data);
    if (!newUser.$isPersisted) {
      throw new Error("Failed to create user");
    }
  }

  public async findByUsername(username: string){
    return await User.findBy("username", username);
  }
  public async updateUser(username: string, data: any){
    this.validate(data); // validasi data menggunakan regex
    const user = await User.findBy("username", username);
    if (user) {
      user.username = data.username;
      user.email = data.email;
      if (user.password) {
        user.password = data.password;
      }
      await user.save()
    } else throw new Error("failed to update user");
  }

  // soft deleted
  public async deleteUser(username: string): Promise<void> {
    const user = await User.findBy({ "username": username, "deleted_at": null});
    if (!user) throw new Error("User not found");

    // user finded, update it
    user.createdAt = DateTime.now();
    await user.save();
  }

  private validate(data: any){
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!data.email || !emailRegex.test(data.email)) {
      throw new Error('invalid email');
    }

    if (!data.username || !usernameRegex.test(data.username)) {
      throw new Error('username must be 3-20 characters long and can only contain letters, numbers, and underscores');
    }

    if (!data.password || !passwordRegex.test(data.password)) {
      throw new Error('password must be at least 8 characters long, containing uppercase, lowercase, digits, and symbols');
    }
  }
}
