import { IsEmail, IsNotEmpty, MaxLength } from "class-validator";

export class ForgetPasswordDto {
  @IsEmail()
  @MaxLength(250)
  @IsNotEmpty()
  email!: string;
}