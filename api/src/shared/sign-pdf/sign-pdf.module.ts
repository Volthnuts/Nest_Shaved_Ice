// src/pdf/pdf.module.ts

import { Module } from '@nestjs/common';
import { PdfService } from './sign-pdf.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [PdfService],
    exports: [PdfService],
})
export class PdfModule {}
