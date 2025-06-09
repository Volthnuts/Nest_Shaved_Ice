// src/pdf/pdf.service.ts

import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import signpdf from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PdfService {
    constructor(
        private readonly configService: ConfigService
    ) {}

    async pdfAddImage(pdf: Buffer | string): Promise<Buffer> {

        let pdfBytes: Buffer;
        if (!pdf) throw new Error('Input PDF buffer or filename is required');

        if (typeof pdf === 'string') {
            // input เป็นชื่อไฟล์ (string)
            const filePath = path.join(process.cwd(), `src/public/pdf-storage/${pdf}`)
            pdfBytes = fs.readFileSync(filePath);
        } else if (Buffer.isBuffer(pdf)) {
            // input เป็น Buffer อยู่แล้ว
            pdfBytes = pdf;
        } else {
            throw new Error('Invalid input type');
        }

        const sigImageBytes = fs.readFileSync(path.join(process.cwd(), `src/public/license-image/signature.png`));

        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pngImage = await pdfDoc.embedPng(sigImageBytes);

        const sigWidth = 25;
        const sigHeight = 25;
        const margin = 10;

        pdfDoc.getPages().forEach((page) => {
        const pageHeight = page.getHeight();
        const pageWidth = page.getWidth();

        page.drawImage(pngImage, {
            x: pageWidth - sigWidth - margin,
            y: pageHeight - sigHeight - margin,
            width: sigWidth,
            height: sigHeight,
        });
        });

        return Buffer.from(await pdfDoc.save({ useObjectStreams: false }));
    }

    async signPdfCertificate(pdf:string): Promise<Buffer> {
        console.log('pdf',pdf)
        const p12Base64 = this.configService.get<string>('CERT_P12_BASE64');
        const passwordbase64 = this.configService.get<string>('CERT_P12_PASSWORD');

        if (!p12Base64) throw new Error('CERT_P12_BASE64 is not defined in environment variables.');
        if (!passwordbase64) throw new Error('CERT_P12_PASSWORD is not defined in environment variables.');

        const p12Buffer = Buffer.from(p12Base64, 'base64');
        const password = Buffer.from(passwordbase64, 'base64').toString();

        const envPath = this.configService.get<string>('PDF_STORAGE_PATH');
        if(!envPath) throw new Error(`Can not config the pdf storage path`);

        const baseStoragePath = path.resolve(process.cwd(), envPath);

        // Normalize and resolve path safely
        const resolvedFilePath = path.resolve(baseStoragePath, pdf);

        console.log('envPath',envPath)
        console.log('baseStoragePath',baseStoragePath)
        console.log('resolvedFilePath',resolvedFilePath)

        // ป้องกัน path traversal
        if (!resolvedFilePath.startsWith(baseStoragePath)) {
            throw new Error('Invalid file path (path traversal attempt detected)');
        }

        if (!fs.existsSync(resolvedFilePath)) throw new Error(`PDF file not found at: ${resolvedFilePath}`);

        let pdfBuffer = fs.readFileSync(resolvedFilePath);
        let originalFileName = path.parse(pdf).name;

        var signer = new P12Signer(p12Buffer, { passphrase: password });

        var pdfWithPlaceholder = plainAddPlaceholder({
            pdfBuffer,
            reason: 'The user is decalaring consent',
            contactInfo: 'signpdf@example.com',
            name: 'John Doe',
            location: 'Free Text Str., Free World',
        });

        const signedPdf = await signpdf.sign(pdfWithPlaceholder, signer);
        
        // ✅ บันทึก PDF ที่เซ็นแล้วไว้ในโฟลเดอร์ที่ต้องการ
        const outputDir = path.resolve(process.cwd(), `${this.configService.get<string>('PDF_SAVE_SIGN_PATH')}`);
        const outputFileName = `signed-${originalFileName}-${Date.now()}.pdf`;
        const outputPath = path.join(outputDir, outputFileName);

        fs.writeFileSync(outputPath, signedPdf);

        return signedPdf;
    }

    async uploadPdf(pdf: File) {
        
    }
}
