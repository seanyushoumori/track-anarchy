/** Subway Builder Modding API v1.0.0 */

export interface Bond {
  id?: string;
  principal: number;
  interestRate: number;
  remainingPrincipal?: number;
  startDay?: number;
}

export interface BondType {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  termDays?: number;
}

export interface BondResult {
  success: boolean;
  message?: string;
  bond?: Bond;
}
