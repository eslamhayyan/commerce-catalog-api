import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "./user.entity";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { UpdateDto } from "./dtos/update.dto";
import { JwtPayLoadType } from "src/utils/types";
import { UserType } from "src/utils/enums";
import { AuthProvider } from "./auth.provider";
import { join } from "path";
import { unlink } from "fs/promises";
import { ResetPasswordDto } from "./dtos/reset-password.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) {}

  /**
   * register user
   * @param dto  data used to register user
   * @returns JWT (access token)
   */
  public async register(dto: RegisterDto) {
    return this.authProvider.register(dto);
  }

  /**
   * login user
   * @param dto  data used to login user
   * @returns JWT (access token)
   */
  public async login(dto: LoginDto) {
    return this.authProvider.login(dto);
  }

  /**
   * get current user
   * @param id user ID
   * @returns user object
   */
  public async getCurrentUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("invalid request");
    return user;
  }

  /**
   * get all users
   * @description only admin can access this route
   * @param none
   * @returns list of users
   */
  public async getAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * update user
   * @param id user ID
   * @param updateDto data used to update user
   * @returns updated user object
   */
  public async update(id: number, updateDto: UpdateDto) {
    const { password, username } = updateDto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("invalid request");

    user.username = username ?? user.username;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    return await this.userRepository.save(user);
  }

  /**
   * delete user
   * @param userId user ID
   * @param payload JWT payload
   * @returns deletion message
   */
  public async delete(userId: number, payload: JwtPayLoadType) {
    const user = await this.getCurrentUser(userId);
    if (user.id === payload.id || payload.userType === UserType.ADMIN) {
      await this.userRepository.remove(user);
      return { message: "user deleted" };
    }
    throw new ForbiddenException("access denied, you are not allowed");
  }

  /**
   * set profile image for user
   * @param userId id of the user
   * @param newProfileImage profile image path or name
   * @returns saved user object with updated profile image
   */
  public async setProfileImage(userId: number, newProfileImage: string) {
    const user = await this.getCurrentUser(userId);
    if (user.profileImage === null) {
      user.profileImage = newProfileImage;
    } else { await this.removeProfileImage(userId); 
      user.profileImage = newProfileImage
    }
    return this.userRepository.save(user);
  }


  /**
   * remove profile image for user
   * @param userId id of the user
   * @returns updated user object with profile image removed
   */
  public async removeProfileImage(userId: number) {
    const user = await this.getCurrentUser(userId);
    if (!user.profileImage) {
      throw new NotFoundException("No profile image found");
    }
    const imagePath = join(process.cwd(), "images", "users", user.profileImage);
    await unlink(imagePath).catch((err) => {
      console.error("Error deleting profile image:", err);
    });
    user.profileImage = null;
    return this.userRepository.save(user);
  }


  /**
   * verify email of the user
   * @param userId id of the user that we get from the link
   * @param verificationToken verification token that we get from the link
   * @returns success message if email is verified successfully
   */
  public async verifyEmail(userId: number, verificationToken: string) {
    const user = await this.getCurrentUser(userId);
    if (!user) throw new NotFoundException("invalid request");
    if (user.verificationToken === null) throw new NotFoundException("there is no verification token for this user");
    if (user.verificationToken !== verificationToken) throw new ForbiddenException("invalid request");
    user.isAcountVarified = true;
    user.verificationToken = null;
    await this.userRepository.save(user);
    return { message: "Email verified successfully" };
  }
  
  
  public async sendResetPassword(email: string){
    return this.authProvider.sendResetPasswordLink(email);
  }

  public async getResetPassword(userId: number, resetPasswordToken: string){
    return this.authProvider.getResetPasswordLink(userId, resetPasswordToken)
  }

  
  public async resetPassword(dto: ResetPasswordDto){
    return this.authProvider.resetPassword(dto);
  }
}