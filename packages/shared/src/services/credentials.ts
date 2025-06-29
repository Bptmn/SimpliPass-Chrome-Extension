import type { CredentialDecrypted, CredentialVaultDb } from '../types';

export interface CredentialsService {
  getAllCredentials: () => Promise<CredentialVaultDb[]>;
  createCredential: (credential: CredentialDecrypted) => Promise<CredentialVaultDb>;
  updateCredential: (credential: CredentialDecrypted) => Promise<CredentialVaultDb>;
  deleteCredential: (id: string) => Promise<void>;
  getCredentialsByDomain: (domain: string) => Promise<CredentialVaultDb[]>;
}

export abstract class BaseCredentialsService implements CredentialsService {
  abstract getAllCredentials(): Promise<CredentialVaultDb[]>;
  abstract createCredential(credential: CredentialDecrypted): Promise<CredentialVaultDb>;
  abstract updateCredential(credential: CredentialDecrypted): Promise<CredentialVaultDb>;
  abstract deleteCredential(id: string): Promise<void>;
  abstract getCredentialsByDomain(domain: string): Promise<CredentialVaultDb[]>;
}