
import * as XLSX from 'xlsx';
import { FinancialInputs } from '../types';

// specific types for the mapping logic
type MappingKeys = keyof FinancialInputs;

interface KeywordMap {
  key: MappingKeys;
  keywords: string[];
}

const KEYWORD_MAPPINGS: KeywordMap[] = [
  { key: 'year1Revenue', keywords: ['revenue', 'sales', 'turnover', 'income', 'receipts'] },
  { key: 'landCost', keywords: ['land', 'plot', 'site'] },
  { key: 'buildingCost', keywords: ['building', 'civil', 'construction', 'factory shed'] },
  { key: 'machineryCost', keywords: ['machine', 'plant', 'equipment', 'computer', 'asset'] },
  { key: 'ownContribution', keywords: ['capital', 'equity', 'promoter', 'own funds'] },
  // For Net Margin, we look for Net Profit and divide by Revenue later if possible, 
  // or just look for a profit figure to estimate.
];

export const parseFinancialFile = async (file: File): Promise<Partial<FinancialInputs>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Assume data is in the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays to scan rows
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        const mappedData: Partial<FinancialInputs> = {};
        let foundRevenue = 0;
        let foundNetProfit = 0;

        // Scan rows for keywords
        rows.forEach((row) => {
          if (!row || row.length < 2) return;
          
          const label = String(row[0]).toLowerCase().trim();
          const value = parseFloat(String(row[1]).replace(/,/g, '').replace(/₹/g, '').trim());

          if (isNaN(value)) return;

          // Check against mappings
          for (const map of KEYWORD_MAPPINGS) {
            if (map.keywords.some(k => label.includes(k))) {
              // specific heuristic: if mapping to machinery, accumulate it (often multiple lines)
              if (map.key === 'machineryCost') {
                mappedData[map.key] = (mappedData[map.key] || 0) + value;
              } 
              // For others, take the first valid match or largest match (simplified: first non-zero)
              else if (!mappedData[map.key]) {
                mappedData[map.key] = value;
              }
            }
          }

          // Special handling for Profit to calculate margin
          if (['net profit', 'profit after tax', 'pat', 'net income'].some(k => label.includes(k))) {
            foundNetProfit = value;
          }
        });

        // Post-processing
        if (mappedData.year1Revenue) {
            foundRevenue = mappedData.year1Revenue;
            // Convert absolute numbers to Lakhs if they seem too large (e.g. user uploaded actuals in Rupees)
            // Heuristic: If Revenue > 10,000, assume it's in Rupees, divide by 1,00,000
            if (foundRevenue > 10000) {
                 mappedData.year1Revenue = foundRevenue / 100000;
            }
        }
        
        // Normalize other large costs if revenue was normalized
        if (foundRevenue > 10000) {
            if (mappedData.landCost) mappedData.landCost /= 100000;
            if (mappedData.buildingCost) mappedData.buildingCost /= 100000;
            if (mappedData.machineryCost) mappedData.machineryCost /= 100000;
            if (mappedData.ownContribution) mappedData.ownContribution /= 100000;
            foundNetProfit /= 100000;
        }

        // Calculate Net Margin % if possible
        if (foundNetProfit && mappedData.year1Revenue) {
            const margin = (foundNetProfit / mappedData.year1Revenue) * 100;
            mappedData.netMargin = parseFloat(margin.toFixed(2));
        }

        resolve(mappedData);
      } catch (err) {
        console.error("Parse Error", err);
        reject(new Error("Failed to parse file. Please ensure it is a valid Excel or CSV file."));
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
