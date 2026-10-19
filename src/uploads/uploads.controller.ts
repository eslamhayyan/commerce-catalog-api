import { BadRequestException, Controller, Get, NotFoundException, Param, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import type {Express, Response} from "express";
import { basename, extname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import { FilesUploadDto } from "./dtos/files-upload.dto";

// Ensure the images directory exists
  if (!existsSync("./images")) {
    mkdirSync("./images", { recursive: true });
  }

@Controller("api/uploads")

export class UploadController{

  //Post ~/api/uploads
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(@UploadedFile() file: Express.Multer.File){
    if(!file){
      throw new BadRequestException("File not found");
    }
    console.log(file);
    return {
      message: "File uploaded successfully",
      fileName: file.filename,
      filePath: file.path
    }
  }

  /**
   * receive multiple files from the client and handle them
   * @param files files uploaded from the client
   * @returns files uploaded successfully message with the list of uploaded files
   */
  @Post('multiple-files')
  @UseInterceptors(FileInterceptor("files"))
  @ApiConsumes('multipart/form-data')
  @ApiBody({type: FilesUploadDto, description: 'Upload multiplle file'})
  uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>){
    if(!files || files.length === 0){
      throw new BadRequestException("No files found");
    }
    console.log(files);
    return {
      message: "Files uploaded successfully",
    }
  }

  /**
   * retrieve an uploaded image by its name
   * @param image image name to be retrieved from the server 
   * @param res response object to send the image file
   * @returns file response with the requested image or a 404 error if not found
   */
  @Get(":image")
  public showUploadedImage(@Param("image") image: string, @Res() res: Response){
    const safeName = basename(image); // Prevent directory traversal attacks
    if (!existsSync(join(process.cwd(), "images", safeName))) {
      throw new NotFoundException("Image not found");
    }
    return res.sendFile(safeName, { root: "./images" });
  }




}