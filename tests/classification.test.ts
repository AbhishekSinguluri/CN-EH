import { describe, it, expect } from 'vitest';
import {
  getBaseDomain,
  isThirdPartyRequest,
} from '../src/tracker/tracker-detector';

describe('First-Party vs Third-Party Classification', () => {
  it('correctly extracts eTLD+1 base domain', () => {
    expect(getBaseDomain('sub.example.com')).toBe('example.com');
    expect(getBaseDomain('a.b.c.example.com')).toBe('example.com');
    expect(getBaseDomain('example.com')).toBe('example.com');
  });

  it('handles multi-part country code top-level domains', () => {
    expect(getBaseDomain('news.bbc.co.uk')).toBe('bbc.co.uk');
    expect(getBaseDomain('shop.brand.com.au')).toBe('brand.com.au');
    expect(getBaseDomain('service.gov.in')).toBe('gov.in');
  });

  it('classifies same base-domain requests as first-party', () => {
    // sub.example.com -> api.example.com
    expect(isThirdPartyRequest('sub.example.com', 'api.example.com')).toBe(false);
    // www.bbc.co.uk -> static.bbc.co.uk
    expect(isThirdPartyRequest('www.bbc.co.uk', 'static.bbc.co.uk')).toBe(false);
  });

  it('classifies cross-domain requests as third-party', () => {
    // news.com -> doubleclick.net
    expect(isThirdPartyRequest('news.com', 'ad.doubleclick.net')).toBe(true);
    // store.example.com -> analytics.google.com
    expect(isThirdPartyRequest('store.example.com', 'analytics.google.com')).toBe(true);
  });

  it('handles missing or empty initiators safely', () => {
    expect(isThirdPartyRequest('', 'doubleclick.net')).toBe(true);
  });
});
