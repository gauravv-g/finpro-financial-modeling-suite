
import { FinancialInputs } from "../types";

export interface SectorDefaults {
  label: string;
  description: string;
  financials: Partial<FinancialInputs>;
}

export const SECTOR_TEMPLATES: Record<string, SectorDefaults> = {
  'general_mfg': {
    label: 'Manufacturing (General)',
    description: 'Standard production unit (Plastics, Packaging, Auto Parts)',
    financials: {
      netMargin: 12,
      workingCapitalCost: 20, // Higher margin needed for stock
      depreciationMachinery: 15,
      depreciationBuilding: 5,
      depreciationOther: 10,
      revenueGrowthRate: 10
    }
  },
  'textile': {
    label: 'Textile / Garments',
    description: 'Spinning, Weaving, or Garment manufacturing',
    financials: {
      netMargin: 10,
      workingCapitalCost: 25, // High inventory holding
      depreciationMachinery: 15,
      depreciationBuilding: 5,
      depreciationOther: 10,
      revenueGrowthRate: 12
    }
  },
  'food_processing': {
    label: 'Food Processing / FMCG',
    description: 'Flour mills, Bakeries, Packaged Food',
    financials: {
      netMargin: 15,
      workingCapitalCost: 15, // Perishable, faster rotation
      depreciationMachinery: 15,
      depreciationBuilding: 5,
      depreciationOther: 10,
      revenueGrowthRate: 15
    }
  },
  'services_it': {
    label: 'IT / Consultancy Services',
    description: 'Software, BPO, Professional Services',
    financials: {
      netMargin: 25, // High margin
      workingCapitalCost: 5, // Low WC needs
      depreciationMachinery: 40, // Computers depreciate faster
      depreciationBuilding: 5,
      depreciationOther: 10,
      revenueGrowthRate: 20
    }
  },
  'retail': {
    label: 'Retail / Trading',
    description: 'Kirana, Supermarket, Wholesalers',
    financials: {
      netMargin: 6, // Low margin volume business
      workingCapitalCost: 10,
      depreciationMachinery: 10, // Furniture & Fixtures
      depreciationBuilding: 5,
      depreciationOther: 5,
      revenueGrowthRate: 10
    }
  },
  'logistics': {
    label: 'Logistics / Transport',
    description: 'Fleet owners, Warehousing',
    financials: {
      netMargin: 12,
      workingCapitalCost: 10,
      depreciationMachinery: 30, // Vehicles
      depreciationBuilding: 5,
      depreciationOther: 10,
      revenueGrowthRate: 15
    }
  },
  'solar': {
    label: 'Solar / Renewable Energy',
    description: 'Solar Power Plant, EPC',
    financials: {
      netMargin: 18,
      workingCapitalCost: 5,
      depreciationMachinery: 15, 
      depreciationBuilding: 5,
      depreciationOther: 5,
      revenueGrowthRate: 8
    }
  },
  'restaurant': {
    label: 'Restaurant / Cloud Kitchen',
    description: 'Dine-in, Cafe, Food Delivery',
    financials: {
      netMargin: 20,
      workingCapitalCost: 8, // Cash business, low receivables
      depreciationMachinery: 15,
      depreciationBuilding: 5,
      depreciationOther: 15, // Interiors
      revenueGrowthRate: 18
    }
  }
};

export type SectorType = keyof typeof SECTOR_TEMPLATES;
