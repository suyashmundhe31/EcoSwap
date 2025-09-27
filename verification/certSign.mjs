
import {SignPdf} from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import fs from 'fs';

console.log(process.cwd());

export function signPDF(pdfName) {
    // Will add common path names later.
    // Will keep as is for now.
    let unsignedPDFBuffer = fs.readFileSync(`C:/Users/Acer/Documents/ethglobal/pdf/${pdfName}.pdf`); 
    let certP12Buffer = fs.readFileSync('C:/Users/Acer/cert.p12');

    const passphrase = '1234';

    let signer = new P12Signer(certP12Buffer, { passphrase: passphrase  });

    let pdfWithPlaceholder = plainAddPlaceholder({
        pdfBuffer: unsignedPDFBuffer,
        reason: 'Document Approval',
        signatureLength: 8192,
    });

    new SignPdf()
    .sign(pdfWithPlaceholder, signer)
    .then(function (signedPdf) {
        fs.writeFileSync(`C:/Users/Acer/Documents/ethglobal/pdf/${pdfName}.pdf`, signedPdf);
        console.log(`Signed PDF created: ${pdfName}.pdf`);
    })
}

// signPDF('Sample1');