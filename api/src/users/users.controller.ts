import { Controller, Get, Post, Body, Patch, Param, Delete, Response, UseInterceptors, UploadedFile, HttpException, HttpStatus, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PdfService } from 'src/shared/sign-pdf/sign-pdf.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogsService } from 'src/logs/logs.service';
import { JwTAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth-guard';
import * as path from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs';

const uploadPath = path.join(process.cwd(),process.env.PDF_UPLOAD_PATH || 'src/public/pdf-storage');
const savedPath = path.join(process.cwd(),process.env.PDF_SAVE_SIGN_PATH || 'src/public/signed-pdf');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

if (!fs.existsSync(savedPath)) {
  fs.mkdirSync(savedPath, { recursive: true });
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly pdfService: PdfService,
    private readonly logService: LogsService
  ) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @UseGuards(JwTAuthGuard)
  @Post('pdf-sign')
  @UseInterceptors(FileInterceptor('pdf'))
  async signPdf(
    @Response() res, 
    @Request() req,
    // @UploadedFile() file?: Express.Multer.File, 
    @Body('pdf-name') pdf: string){
      const action = 'SIGN_PDF'
      try {
        pdf = pdf.replace(/\s+/g, '');
        const signed = await this.pdfService.signPdfCertificate(pdf);
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=signed.pdf',
        });

        await this.logService.logSingPdf(req.user.id,action,pdf,true)
        res.send(signed);

      } catch (error) {
        await this.logService.logSingPdf(req.user.id,action,pdf,false,error)
        return res.status(500).json({
          message: 'Can not sign pdf',
        })
      }
  }

  @UseGuards(JwTAuthGuard)
  @Post('upload-pdf')
  @UseInterceptors(
    FileInterceptor('pdf', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(),process.env.PDF_UPLOAD_PATH || 'src/public/pdf-storage');
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const fileExtName = path.extname(file.originalname); // .pdf
          const baseName = file.originalname
            .replace(fileExtName, '') // Remove extension
            .replace(/\s+/g, ''); // Remove spaces
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${baseName}-${uniqueSuffix}${fileExtName}`);
        },
      }),
        fileFilter: (req, file, cb) => {
          const allowedExt = ['.pdf'];
          const fileExt = path.extname(file.originalname).toLowerCase();
          if (!allowedExt.includes(fileExt)) {
            return cb(new BadRequestException('Only PDF files are allowed'), false);
          }
          if (file.mimetype !== 'application/pdf') {
            return cb(new BadRequestException('Invalid MIME type'), false);
          }
          cb(null, true);
        },
    }),
  )
  uploadPdf(@UploadedFile() pdf: Express.Multer.File) {
    if (!pdf) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      status: 'success',
      message: 'PDF uploaded successfully',
      filename: pdf.filename,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
