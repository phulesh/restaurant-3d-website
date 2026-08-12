/**
 * Real Google Sheets synchronization.
 * "synced" is set only after the Google Sheets API confirms the write.
 */

import crypto from 'crypto';
import {
  canonicalizeService,
  canonicalizeSource,
  canonicalizeStatus,
  todayISODate,
} from '../utils/leadIdentity.js';

export const SHEET_HEADERS = [
  'Lead ID',
  'Date',
  'Name',
  'Phone',
  'Email',
  'Service',
  'Budget',
  'Source',
  'Status',
  'Requirement',
  'Unique Lead Key',
  'Last Contacted',
];

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export function extractSpreadsheetId(input) {
  if (!input) return null;
  const value = String(input).trim();
  const urlMatch = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch) return urlMatch[1];
  return value || null;
}

export function parseIntegrationConfig(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function redactSheetsConfig(config) {
  if (!config || typeof config !== 'object') return {};
  const safe = { ...config };
  const secretKeys = [
    'service_account_json', 'private_key', 'access_token', 'refresh_token',
    'client_secret', 'credentials_json', 'token',
  ];
  let hasCredentials = false;
  for (const key of secretKeys) {
    if (safe[key]) {
      hasCredentials = true;
      delete safe[key];
    }
  }
  if (safe.service_account && typeof safe.service_account === 'object') {
    hasCredentials = true;
    safe.service_account = { client_email: safe.service_account.client_email || '[redacted]' };
  }
  return { ...safe, has_credentials: hasCredentials };
}

export function leadToSheetRow(lead) {
  const service = canonicalizeService(lead.service).display || lead.service || '';
  return [
    lead.lead_code || '',
    (lead.created_at || todayISODate()).slice(0, 10),
    lead.name || '',
    lead.phone || '',
    lead.email || '',
    service,
    lead.budget || '',
    canonicalizeSource(lead.source, lead.source || ''),
    canonicalizeStatus(lead.status),
    lead.requirement || '',
    lead.unique_lead_key || '',
    (lead.last_contacted || todayISODate()).slice(0, 10),
  ];
}

function encodeBase64Url(input) {
  return Buffer.from(input).toString('base64url');
}

function signServiceAccountJwt(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: SHEETS_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const encoded = `${encodeBase64Url(JSON.stringify(header))}.${encodeBase64Url(JSON.stringify(payload))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(encoded);
  const signature = signer.sign(credentials.private_key, 'base64url');
  return `${encoded}.${signature}`;
}

function loadServiceAccount(config) {
  const raw = config.service_account_json || config.credentials_json || config.service_account
    || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function createGoogleSheetsClient({ config = {}, fetchImpl = globalThis.fetch } = {}) {
  const parsed = parseIntegrationConfig(config);
  const spreadsheetId = extractSpreadsheetId(parsed.spreadsheet_id || parsed.spreadsheetUrl || parsed.spreadsheet_url);
  const worksheet = (parsed.worksheet || parsed.sheet_name || 'Sheet1').trim() || 'Sheet1';
  const rangeA1 = `${worksheet}!A:L`;

  let cachedToken = parsed.access_token || null;
  let cachedTokenExp = parsed.access_token_expires_at ? Date.parse(parsed.access_token_expires_at) : 0;

  const hasAnyCredential = Boolean(
    cachedToken
    || parsed.refresh_token
    || loadServiceAccount(parsed)
    || process.env.GOOGLE_REFRESH_TOKEN
  );

  async function request(url, options = {}) {
    if (typeof fetchImpl !== 'function') {
      throw new Error('No HTTP transport available for Google Sheets API');
    }
    const res = await fetchImpl(url, options);
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
    return { ok: res.ok, status: res.status, body };
  }

  async function getAccessToken() {
    if (cachedToken && cachedTokenExp && Date.now() < cachedTokenExp - 30_000) {
      return cachedToken;
    }
    if (cachedToken && !parsed.refresh_token && !loadServiceAccount(parsed) && !process.env.GOOGLE_REFRESH_TOKEN) {
      return cachedToken;
    }

    const serviceAccount = loadServiceAccount(parsed);
    if (serviceAccount?.client_email && serviceAccount?.private_key) {
      const assertion = signServiceAccountJwt(serviceAccount);
      const res = await request(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion,
        }).toString(),
      });
      if (!res.ok || !res.body?.access_token) {
        throw new Error(res.body?.error_description || res.body?.error || 'Failed to obtain Google access token');
      }
      cachedToken = res.body.access_token;
      cachedTokenExp = Date.now() + (Number(res.body.expires_in || 3600) * 1000);
      return cachedToken;
    }

    const refreshToken = parsed.refresh_token || process.env.GOOGLE_REFRESH_TOKEN;
    const clientId = parsed.client_id || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = parsed.client_secret || process.env.GOOGLE_CLIENT_SECRET;
    if (refreshToken && clientId && clientSecret) {
      const res = await request(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      });
      if (!res.ok || !res.body?.access_token) {
        throw new Error(res.body?.error_description || res.body?.error || 'Failed to refresh Google access token');
      }
      cachedToken = res.body.access_token;
      cachedTokenExp = Date.now() + (Number(res.body.expires_in || 3600) * 1000);
      return cachedToken;
    }

    if (cachedToken) return cachedToken;
    throw new Error('Google Sheets credentials are missing');
  }

  async function authorizedRequest(url, options = {}) {
    const token = await getAccessToken();
    return request(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  }

  function encodeRange(range) {
    return encodeURIComponent(range);
  }

  async function getValues() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(rangeA1)}`;
    const res = await authorizedRequest(url);
    if (!res.ok) {
      throw new Error(res.body?.error?.message || `Google Sheets read failed (${res.status})`);
    }
    return res.body.values || [];
  }

  async function ensureHeaders() {
    const values = await getValues();
    if (!values.length) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(`${worksheet}!A1:L1`)}?valueInputOption=USER_ENTERED`;
      const res = await authorizedRequest(url, {
        method: 'PUT',
        body: JSON.stringify({ range: `${worksheet}!A1:L1`, majorDimension: 'ROWS', values: [SHEET_HEADERS] }),
      });
      if (!res.ok) {
        throw new Error(res.body?.error?.message || `Failed to write Google Sheets headers (${res.status})`);
      }
      return { created: true, values: [SHEET_HEADERS] };
    }
    return { created: false, values };
  }

  function findRowIndex(values, { leadCode, uniqueLeadKey }) {
    for (let i = 1; i < values.length; i += 1) {
      const row = values[i] || [];
      const rowLeadId = String(row[0] || '').trim();
      const rowKey = String(row[10] || '').trim();
      if (uniqueLeadKey && rowKey && rowKey === uniqueLeadKey) return i + 1;
      if (leadCode && rowLeadId && rowLeadId === leadCode) return i + 1;
    }
    return null;
  }

  function confirmedWrite(body) {
    const updates = body?.updates || body;
    const updatedRows = Number(updates?.updatedRows || 0);
    const updatedCells = Number(updates?.updatedCells || 0);
    const updatedRange = updates?.updatedRange || body?.updatedRange;
    return Boolean(updatedRange || updatedRows > 0 || updatedCells > 0);
  }

  return {
    spreadsheetId,
    worksheet,
    isConfigured: Boolean(spreadsheetId && hasAnyCredential),

    async verifyConnection() {
      if (!spreadsheetId) throw new Error('Spreadsheet ID is required');
      if (!hasAnyCredential) throw new Error('Google Sheets credentials are required');
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title`;
      const res = await authorizedRequest(url);
      if (!res.ok) {
        throw new Error(res.body?.error?.message || `Google Sheets connection failed (${res.status})`);
      }
      return { ok: true, spreadsheetId: res.body.spreadsheetId || spreadsheetId, title: res.body.properties?.title };
    },

    async findRow({ leadCode, uniqueLeadKey }) {
      const { values } = await ensureHeaders();
      return findRowIndex(values, { leadCode, uniqueLeadKey });
    },

    async appendRow(rowValues) {
      await ensureHeaders();
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(`${worksheet}!A:L`)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
      const res = await authorizedRequest(url, {
        method: 'POST',
        body: JSON.stringify({ values: [rowValues], majorDimension: 'ROWS' }),
      });
      if (!res.ok) {
        throw new Error(res.body?.error?.message || `Google Sheets append failed (${res.status})`);
      }
      if (!confirmedWrite(res.body)) {
        throw new Error('Google Sheets API did not confirm the append');
      }
      const updatedRange = res.body.updates?.updatedRange || '';
      const rowMatch = updatedRange.match(/![A-Z]+(\d+)/);
      return {
        confirmed: true,
        operation: 'append',
        updatedRange,
        updatedRows: Number(res.body.updates?.updatedRows || 1),
        rowNumber: rowMatch ? parseInt(rowMatch[1], 10) : null,
      };
    },

    async updateRow(rowNumber, rowValues) {
      if (!rowNumber) throw new Error('Cannot update Google Sheets row without a row number');
      const range = `${worksheet}!A${rowNumber}:L${rowNumber}`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(range)}?valueInputOption=USER_ENTERED`;
      const res = await authorizedRequest(url, {
        method: 'PUT',
        body: JSON.stringify({ range, majorDimension: 'ROWS', values: [rowValues] }),
      });
      if (!res.ok) {
        throw new Error(res.body?.error?.message || `Google Sheets update failed (${res.status})`);
      }
      if (!confirmedWrite(res.body) && !res.body.updatedRange) {
        throw new Error('Google Sheets API did not confirm the update');
      }
      return {
        confirmed: true,
        operation: 'update',
        updatedRange: res.body.updatedRange || res.body.updates?.updatedRange || range,
        updatedRows: Number(res.body.updatedRows || res.body.updates?.updatedRows || 1),
        rowNumber,
      };
    },

    async syncLead(lead, { allowAppend = true } = {}) {
      if (!this.isConfigured) {
        return { status: 'not_connected', error: 'Google Sheets is not connected', operation: null };
      }
      const row = leadToSheetRow(lead);
      const existingRow = await this.findRow({
        leadCode: lead.lead_code,
        uniqueLeadKey: lead.unique_lead_key,
      });
      if (existingRow) {
        const result = await this.updateRow(existingRow, row);
        return { status: 'synced', operation: 'update', error: null, ...result };
      }
      if (!allowAppend) {
        return { status: 'failed', error: 'Existing Google Sheets row was not found', operation: null };
      }
      const result = await this.appendRow(row);
      return { status: 'synced', operation: 'append', error: null, ...result };
    },
  };
}

export async function getUserSheetsClient(db, userId, { fetchImpl } = {}) {
  const integration = db.prepare(
    "SELECT * FROM integrations WHERE user_id = ? AND type = 'google_sheets' LIMIT 1"
  ).get(userId);

  if (!integration || integration.status !== 'connected') {
    return { connected: false, client: null, integration: integration || null };
  }

  const client = createGoogleSheetsClient({
    config: parseIntegrationConfig(integration.config),
    fetchImpl,
  });
  if (!client.isConfigured) {
    return { connected: false, client: null, integration };
  }
  return { connected: true, client, integration };
}
