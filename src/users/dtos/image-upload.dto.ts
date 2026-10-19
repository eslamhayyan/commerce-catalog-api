import { ApiProperty } from "@nestjs/swagger";
import type { Express } from "express";

export class ImageUploadDto {
  @ApiProperty({
    required: true,
    type: 'string',
    format: 'binary',
    name: 'user-image',
  })
  file!: Express.Multer.File;
}