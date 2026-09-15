const WEBXE_SECRET = 'replace-with-the-same-secret-as-render';
const SENDER_NAME = 'WebXe';

function doGet() {
  return jsonResponse({ ok: true, service: 'webxe-mail' });
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || '{}');
    if (payload.secret !== WEBXE_SECRET) {
      return jsonResponse({ ok: false, error: 'Unauthorized' });
    }
    if (!payload.to || !payload.subject || !payload.text || !payload.html) {
      return jsonResponse({ ok: false, error: 'Missing email fields' });
    }

    GmailApp.sendEmail(payload.to, payload.subject, payload.text, {
      htmlBody: payload.html,
      name: SENDER_NAME,
    });
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error.message || error) });
  }
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
