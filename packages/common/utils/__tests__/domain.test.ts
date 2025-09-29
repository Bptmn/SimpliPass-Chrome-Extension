/**
 * Tests for domain utility functions
 */

import { getRootDomain, getRegisteredDomain, matchesCredentialDomainOrTitle } from '../domain';

describe('getRootDomain', () => {
  it('should return the same domain for simple domains', () => {
    expect(getRootDomain('example.com')).toBe('example.com');
    expect(getRootDomain('test.org')).toBe('test.org');
  });

  it('should remove www prefix', () => {
    expect(getRootDomain('www.example.com')).toBe('example.com');
    expect(getRootDomain('www.test.org')).toBe('test.org');
  });

  it('should handle subdomains correctly', () => {
    expect(getRootDomain('sub.example.com')).toBe('example.com');
    expect(getRootDomain('api.sub.example.com')).toBe('example.com');
    expect(getRootDomain('deep.nested.sub.example.com')).toBe('example.com');
  });

  it('should handle complex domains with multiple parts', () => {
    expect(getRootDomain('www.example.co.uk')).toBe('co.uk');
    expect(getRootDomain('api.example.co.uk')).toBe('co.uk');
    expect(getRootDomain('sub.api.example.co.uk')).toBe('co.uk');
  });

  it('should handle edge cases', () => {
    expect(getRootDomain('')).toBe('');
    expect(getRootDomain('localhost')).toBe('localhost');
    expect(getRootDomain('127.0.0.1')).toBe('0.1');
  });
});

describe('getRegisteredDomain', () => {
  it('should return the same domain for simple domains', () => {
    expect(getRegisteredDomain('example.com')).toBe('example.com');
    expect(getRegisteredDomain('test.org')).toBe('test.org');
  });

  it('should remove www prefix', () => {
    expect(getRegisteredDomain('www.example.com')).toBe('example.com');
    expect(getRegisteredDomain('www.test.org')).toBe('test.org');
  });

  it('should handle subdomains correctly', () => {
    expect(getRegisteredDomain('sub.example.com')).toBe('example.com');
    expect(getRegisteredDomain('api.sub.example.com')).toBe('example.com');
    expect(getRegisteredDomain('deep.nested.sub.example.com')).toBe('example.com');
  });

  it('should handle complex domains with multiple parts', () => {
    expect(getRegisteredDomain('www.example.co.uk')).toBe('co.uk');
    expect(getRegisteredDomain('api.example.co.uk')).toBe('co.uk');
    expect(getRegisteredDomain('sub.api.example.co.uk')).toBe('co.uk');
  });
});

describe('matchesCredentialDomainOrTitle', () => {
  describe('URL matching', () => {
    it('should match exact domain', () => {
      const credential = { url: 'https://example.com', title: 'Example' };
      expect(matchesCredentialDomainOrTitle(credential, 'example.com')).toBe(true);
    });

    it('should match with www prefix', () => {
      const credential = { url: 'https://www.example.com', title: 'Example' };
      expect(matchesCredentialDomainOrTitle(credential, 'example.com')).toBe(true);
    });

    it('should match subdomain to parent domain', () => {
      const credential = { url: 'https://api.example.com', title: 'API' };
      expect(matchesCredentialDomainOrTitle(credential, 'example.com')).toBe(true);
    });

    it('should match parent domain to subdomain', () => {
      const credential = { url: 'https://example.com', title: 'Example' };
      expect(matchesCredentialDomainOrTitle(credential, 'api.example.com')).toBe(true);
    });

    it('should handle URLs without protocol', () => {
      const credential = { url: 'example.com', title: 'Example' };
      expect(matchesCredentialDomainOrTitle(credential, 'example.com')).toBe(true);
    });

    it('should handle invalid URLs by falling back to string matching', () => {
      const credential = { url: 'invalid-url', title: 'Example' };
      expect(matchesCredentialDomainOrTitle(credential, 'invalid-url')).toBe(true);
    });

    it('should return false for non-matching domains', () => {
      const credential = { url: 'https://example.com', title: 'Example' };
      expect(matchesCredentialDomainOrTitle(credential, 'different.com')).toBe(false);
    });
  });

  describe('title matching', () => {
    it('should match by title when URL is empty', () => {
      const credential = { url: '', title: 'Example Site' };
      expect(matchesCredentialDomainOrTitle(credential, 'example')).toBe(true);
    });

    it('should match by title when URL is not provided', () => {
      const credential = { title: 'Example Site' };
      expect(matchesCredentialDomainOrTitle(credential, 'example')).toBe(true);
    });

    it('should match by title when URL does not match', () => {
      const credential = { url: 'https://different.com', title: 'Example Site' };
      expect(matchesCredentialDomainOrTitle(credential, 'example')).toBe(true);
    });

    it('should be case insensitive', () => {
      const credential = { title: 'EXAMPLE SITE' };
      expect(matchesCredentialDomainOrTitle(credential, 'example')).toBe(true);
    });

    it('should match partial strings', () => {
      const credential = { title: 'My Example Site' };
      expect(matchesCredentialDomainOrTitle(credential, 'example')).toBe(true);
    });

    it('should match reverse partial strings', () => {
      const credential = { title: 'Example' };
      expect(matchesCredentialDomainOrTitle(credential, 'my-example-site')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return false for empty credential', () => {
      const credential = {};
      expect(matchesCredentialDomainOrTitle(credential, 'example.com')).toBe(false);
    });

    it('should return false for credential with no url or title', () => {
      const credential = { url: '', title: '' };
      expect(matchesCredentialDomainOrTitle(credential, 'example.com')).toBe(false);
    });

    it('should handle whitespace in URLs', () => {
      const credential = { url: '  ', title: 'Example' };
      expect(matchesCredentialDomainOrTitle(credential, 'example')).toBe(true);
    });

    it('should handle whitespace in titles', () => {
      const credential = { url: 'https://example.com', title: '  ' };
      expect(matchesCredentialDomainOrTitle(credential, 'example.com')).toBe(true);
    });
  });
});
