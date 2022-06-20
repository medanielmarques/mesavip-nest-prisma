import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { google } from 'googleapis';
import { createReadStream } from 'fs';
import { resolve } from 'path';

@Controller()
export class AppController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('cpf'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const keyfilepath =
      'C:\\Users\\daniel\\mesavip\\mesavip-nest-prisma\\credentials.json';

    const auth = new google.auth.GoogleAuth({
      keyFile: keyfilepath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const driveService = google.drive({
      version: 'v3',
      auth,
    });

    const fileMetaData = {
      name: file.originalname,
      parents: ['1BBsLmbW8us2j_kBR6abfuoLSebtTDAOl'],
    };

    console.log(file);

    const media = {
      mimeType: 'image/png',
      body: createReadStream(resolve(__dirname, '..', file.path)),
    };

    await driveService.files.create({
      requestBody: fileMetaData,
      media,
    });
  }

  @Post('upload-files')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'cpf',
        maxCount: 1,
      },
      {
        name: 'rg',
        maxCount: 1,
      },
    ]),
  )
  async uploadFiles(
    @UploadedFiles()
    files: {
      cpf?: Express.Multer.File[];
      rg?: Express.Multer.File[];
    },
  ) {
    const keyfilepath =
      'C:\\Users\\daniel\\mesavip\\mesavip-nest-prisma\\credentials.json';
    const auth = new google.auth.GoogleAuth({
      keyFile: keyfilepath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const driveService = google.drive({
      version: 'v3',
      auth,
    });

    console.log(files.cpf[0].originalname);

    Object.entries(files).map(async ([key, file]) => {
      const fileMetaData = {
        name: file[0].originalname,
        parents: ['1BBsLmbW8us2j_kBR6abfuoLSebtTDAOl'],
      };

      const media = {
        mimeType: file[0].mimetype,
        body: file[0].stream,
      };

      await driveService.files.create({
        requestBody: fileMetaData,
        media,
      });
    });
  }
}
