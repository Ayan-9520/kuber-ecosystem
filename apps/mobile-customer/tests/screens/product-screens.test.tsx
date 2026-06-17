import { render, screen } from '@testing-library/react';

import { EligibilityScreen } from '@/features/eligibility/screens/EligibilityScreen';
import { EmiScreen } from '@/features/emi/screens/EmiScreen';
import { LoanProductsScreen } from '@/features/loan-products/screens/LoanProductsScreen';
import { RecommendationsScreen } from '@/features/recommendations/screens/RecommendationsScreen';

jest.mock('@/services', () => ({
  productsService: {
    list: jest.fn(async () => ({ items: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } })),
    variants: jest.fn(async () => ({ items: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } })),
  },
  recommendationsService: { forCustomer: jest.fn(async () => ({ products: [] })) },
  eligibilityService: { calculate: jest.fn() },
  emiService: { calculate: jest.fn() },
}));

describe('Customer product screens', () => {
  it('LoanProducts — renders screen', () => {
    render(<LoanProductsScreen />);
    expect(screen.getByText('Loan Products')).toBeTruthy();
  });

  it('Eligibility — renders calculator', () => {
    render(<EligibilityScreen />);
    expect(screen.getByText('Eligibility Check')).toBeTruthy();
  });

  it('EmiCalculator — renders EMI form', () => {
    render(<EmiScreen />);
    expect(screen.getByText('EMI Calculator')).toBeTruthy();
  });

  it('Recommendations — renders offers', () => {
    render(<RecommendationsScreen customerId="c1" />);
    expect(screen.getByText('Recommended For You')).toBeTruthy();
  });
});
