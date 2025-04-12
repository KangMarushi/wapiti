import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import csv from 'csv-parse';
import xlsx from 'xlsx';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface Transaction {
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

async function parsePDF(filePath: string): Promise<Transaction[]> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  
  // This is a simplified example. In production, you would need more sophisticated
  // regex patterns to match different bank statement formats
  const transactions: Transaction[] = [];
  const lines = data.text.split('\n');
  
  for (const line of lines) {
    const match = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(.*?)\s+([\d,]+\.\d{2})\s+(CR|DR)/);
    if (match) {
      transactions.push({
        date: new Date(match[1]),
        description: match[2].trim(),
        amount: parseFloat(match[3].replace(/,/g, '')),
        type: match[4] === 'CR' ? 'credit' : 'debit'
      });
    }
  }
  
  return transactions;
}

async function parseCSV(filePath: string): Promise<Transaction[]> {
  const transactions: Transaction[] = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Adjust these indices based on your CSV format
        transactions.push({
          date: new Date(row[0]),
          description: row[1],
          amount: parseFloat(row[2]),
          type: row[3].toLowerCase() as 'credit' | 'debit'
        });
      })
      .on('end', () => resolve(transactions))
      .on('error', reject);
  });
}

function parseExcel(filePath: string): Transaction[] {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  return data.map((row: any) => ({
    date: new Date(row.Date),
    description: row.Description,
    amount: parseFloat(row.Amount),
    type: row.Type.toLowerCase()
  }));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let transactions: Transaction[] = [];
    const fileType = file.originalFilename?.split('.').pop()?.toLowerCase();

    switch (fileType) {
      case 'pdf':
        transactions = await parsePDF(file.filepath);
        break;
      case 'csv':
        transactions = await parseCSV(file.filepath);
        break;
      case 'xlsx':
      case 'xls':
        transactions = parseExcel(file.filepath);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Clean up the temporary file
    fs.unlinkSync(file.filepath);

    // Process transactions to identify investment-related entries
    const investmentTransactions = transactions.filter(tx => 
      tx.description.toLowerCase().includes('invest') ||
      tx.description.toLowerCase().includes('stock') ||
      tx.description.toLowerCase().includes('mutual fund')
    );

    return res.status(200).json({
      success: true,
      transactions: investmentTransactions
    });

  } catch (error) {
    console.error('Statement parsing error:', error);
    return res.status(500).json({ error: 'Failed to parse statement' });
  }
} 