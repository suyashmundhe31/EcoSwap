
import { spawnSync } from 'child_process';
import readline from 'readline';
import { signPDF } from './certSign.mjs';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("This code converts ODT to PDF and then a signed PDF.")
console.log("All of the odt files to be converted must be stored within /odt")
console.log("All of the converted and signed PDFs will be stored within /pdf")
console.log("The name of the converted PDF will be the same as the ODT file.")

rl.question(
    "\nEnter filename to convert. '.odt' will be automatically added.", (answer) => {
    console.log(`You entered: ${answer}`);
    rl.close();
    odt_to_pdf(answer);
});

function odt_to_pdf(filename){
    try{
        const result = spawnSync(
            'wsl', [
                'libreoffice', 
                '--headless', 
                '--convert-to', 'pdf', 
                '--outdir', 
                '/mnt/c/Users/Acer/Documents/ethglobal/pdf', 
                `/mnt/c/Users/Acer/Documents/ethglobal/odt/${filename}.odt`
            ], { encoding: 'utf-8' });
        
        if(result.error){
            throw result.error;
        }
        else{
            console.log('\nCommand executed successfully:');
            console.log(result.stdout);
            console.log('---------------------------------------------------------')
            console.log(`Converted odt to ${filename}.pdf`);

            console.log(`\n Now digitally signing the PDF with X509 certificate and private key.`)
            signPDF(filename)
        }
    }
    catch(err){
        console.error('Error executing command:', err);
    }
}
