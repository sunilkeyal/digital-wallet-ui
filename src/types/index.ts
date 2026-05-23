export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface ImmunizationDto {
  id?: string;
  userId?: string;
  vaccineName: string;
  patientName?: string;
  manufacturer: string;
  lotNumber: string;
  administrationDate: string;
  administeredBy: string;
  facilityName: string;
  facilityAddress: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsuranceCardDto {
  id?: string;
  userId?: string;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  effectiveDate: string;
  expiryDate?: string;
  memberName: string;
  relationship?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabResultDto {
  id?: string;
  userId?: string;
  testName: string;
  testDate: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  orderingProvider: string;
  laboratory: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
}

export interface NoteDto {
  id?: string;
  userId?: string;
  groupId?: string;
  title: string;
  content: string;
  orderIndex?: number;
  viewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoteGroupDto {
  id?: string;
  userId?: string;
  name: string;
  orderIndex?: number;
  notes?: NoteDto[];
  createdAt?: string;
  updatedAt?: string;
}
