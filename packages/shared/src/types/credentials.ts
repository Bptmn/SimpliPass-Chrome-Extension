export interface CredentialDecrypted {
  id: string;
  createdDateTime: Date;
  lastUseDateTime: Date;
  title: string;
  username: string;
  password: string;
  note: string;
  url: string;
  itemKey: string;
}

export interface CredentialEncrypted {
  id: string;
  content_encrypted: string;
  item_key_encrypted: string;
  created_at: Date;
  last_used_at: Date;
}

export interface CredentialVaultDb {
  id: string;
  url: string;
  title: string;
  username: string;
  itemKeyCipher: string;
  passwordCipher: string;
  note?: string;
}

export interface PasswordGeneratorOptions {
  hasNumbers: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialCharacters: boolean;
  length: number;
}

export type PasswordStrength = 'weak' | 'average' | 'strong' | 'perfect';