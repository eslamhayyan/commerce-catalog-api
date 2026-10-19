import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseIntPipe, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { AuthGuard } from "./guards/auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { JwtPayLoadType } from "src/utils/types";
import { Roles } from "./decorators/user-role.decorator";
import { UserType } from "src/utils/enums";
import { AuthRolesGuard } from "./guards/auth.roles.guard";
import { UpdateDto } from "./dtos/update.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { basename, extname, join } from "path";
import type { Response } from "express";
import { existsSync } from "fs";
import { ForgetPasswordDto } from "./dtos/forget-password.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { ApiBody, ApiConsumes, ApiSecurity } from "@nestjs/swagger";
import { ImageUploadDto } from "./dtos/image-upload.dto";


@Controller("api/users")
export class UserController {

  constructor(private readonly userService: UserService) { }

  @Post("auth/register")
  public register(@Body() body: RegisterDto) {
    return this.userService.register(body);
  }

  @Post("auth/login")
  @HttpCode(HttpStatus.OK)
  public login(@Body() body: LoginDto) {
    return this.userService.login(body);
  }

  @Get("current-user")
  @Roles(UserType.ADMIN)
  @UseGuards(AuthGuard)
  public getCurrentUser(@CurrentUser() payload: JwtPayLoadType) {
    const user = this.userService.getCurrentUser(payload.id)
    return user
  }
  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public getAllUsers() {
    return this.userService.getAll();
  }

  @Put()
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public updateUser(@CurrentUser() payload: JwtPayLoadType, @Body() body: UpdateDto) {
    return this.userService.update(payload.id, body)
  }

  @Delete(":id")
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public deleteUser(@Param("id", ParseIntPipe) id: number, @CurrentUser() payload: JwtPayLoadType) {
    return this.userService.delete(id, payload)
  }

  @Post('/images/profile-image')
  @UseInterceptors(FileInterceptor('user-image'))
  @UseGuards(AuthGuard)
  @ApiSecurity('bearer')
  @ApiConsumes("multipart/form-data")
  @ApiBody({type: ImageUploadDto, description: 'upload profile image'})
  public uploadProfileImage(@CurrentUser() payload: JwtPayLoadType, @UploadedFile() file: Express.Multer.File) {
    if(!file){
      throw new BadRequestException("File not found");
    }
    return this.userService.setProfileImage(payload.id, file.filename);
  }

  @Delete('images/remove-profile-image')
  @UseGuards(AuthGuard)
  public removeProfileImage(@CurrentUser() payload: JwtPayLoadType) {
    return this.userService.removeProfileImage(payload.id);
  }

  @Get('images/:image')
  @UseGuards(AuthGuard)
  public getProfileImage(@Param('image') image: string, @Res() res: Response) {
    const safeName = basename(image); // Prevent directory traversal attacks
    if (!existsSync(join(process.cwd(), "images", "users", safeName))) {
      throw new NotFoundException("Image not found");
    }
    return res.sendFile(image, { root: './images/users' });
  }

  @Get('verify-email/:id/:validationToken')
  public verifyEmail(
    @Param('id', ParseIntPipe) id: number, 
    @Param('validationToken') verificationToken: string) {
    return this.userService.verifyEmail(id, verificationToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  public forgetPassword(@Body() body: ForgetPasswordDto) {
    return this.userService.sendResetPassword(body.email)
  }

  @Get('reset-password/:id/:resetPasswordToken')
  public getResetPassword(
    @Param('id', ParseIntPipe)id: number,
    @Param('resetPasswordToken') resetPasswordToken: string){
      return this.userService.getResetPassword(id, resetPasswordToken)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  public resetPassword(@Body() body:ResetPasswordDto){
    return this.userService.resetPassword(body)
  }

}