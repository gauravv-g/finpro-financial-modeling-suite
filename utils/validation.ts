
import { BusinessData } from '../types';

export const validateBusinessData = (data: BusinessData): string[] => {
  const errors: string[] = [];
  const f = data.financials;
  
  // 1. Funding Source Verification
  // The sum of Own Contribution + Loan must equal the Total Project Cost.
  const totalFunds = f.ownContribution + f.loanRequired;
  // Allowing a small floating-point tolerance of 0.5 Lakhs
  if (Math.abs(totalFunds - f.projectCost) > 0.5) {
    errors.push(`Mismatch in Funding: Sources (₹${totalFunds.toFixed(2)}L) must equal Project Cost (₹${f.projectCost.toFixed(2)}L). Please adjust Loan or Own Contribution.`);
  }

  // 2. Fundamental Checks
  if (f.projectCost <= 0) {
    errors.push("Total Project Cost must be greater than zero.");
  }

  if (f.year1Revenue <= 0) {
    errors.push("Year 1 Revenue estimate must be greater than zero.");
  }

  // 3. Ratio Sanity Checks
  if (f.netMargin >= 100) {
    errors.push("Net Profit Margin cannot be 100% or more.");
  }
  if (f.netMargin < 0) {
    errors.push("Net Profit Margin should be positive for a viable project report.");
  }

  if (f.revenueGrowthRate > 200) {
    errors.push("Revenue Growth Rate (>200%) seems unrealistic for a standard bank loan proposal.");
  }

  // 4. Interest Rate Reality Check
  if (f.interestRate > 30) {
    errors.push("Interest Rate seems exceptionally high (>30%). Please verify.");
  }
  if (f.interestRate < 4) {
    errors.push("Interest Rate seems unrealistic (<4%). Current market rates are typically 9-14%.");
  }

  // 5. Loan Tenure
  if (f.loanTenure > 20) {
    errors.push("Loan Tenure of >20 years is unusual for MSME Term Loans.");
  }

  return errors;
};
