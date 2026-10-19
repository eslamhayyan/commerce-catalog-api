import { Optional } from "@nestjs/common";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MinLength } from "class-validator";

export class UpdateDto{

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  @Optional()
  @ApiPropertyOptional()
  password?: string;

  @IsString()
  @Length(2,150)
  @IsOptional()
  @Optional()
  @ApiPropertyOptional()
  username?: string;
}