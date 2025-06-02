import { Controller, Get, Post, Body, Patch, Param, Delete, Response, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PdfService } from 'src/shared/sign-pdf/sign-pdf.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly pdfService: PdfService
  ) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Post('pdf-sign')
  @UseInterceptors(FileInterceptor('pdf'))
  async signPdf(
    @Response() res, 
    // @UploadedFile() file?: Express.Multer.File, 
    @Body('pdf-name') pdfName: string){
    // let pdf: string | Buffer;

    // if(file && file.buffer) pdf = file.buffer;
    // else if(pdfName) pdf = pdfName;
    // else throw  new HttpException('No PDF file or pdfBase64 string provided', HttpStatus.BAD_REQUEST);

    // const imageAdded = await this.pdfService.pdfAddImage(pdf);
    
    const signed = await this.pdfService.signPdfCertificate(pdfName); //รับ buffer เท่านั้น

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=signed.pdf',
    });

    res.send(signed);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
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
