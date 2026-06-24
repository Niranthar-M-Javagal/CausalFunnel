const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/events`;

class AnalyticsTracker {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  getOrCreateSessionId() {
    let sid = localStorage.getItem('cf_session_id');

    if (!sid) {
      sid = `session_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      localStorage.setItem('cf_session_id', sid);
    }

    return sid;
  }

  async sendEvent(eventType, pageUrl, additionalData = {}) {
    const payload = {
      sessionId: this.sessionId,
      eventType,
      pageUrl,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('[Analytics] Failed to send event:', error);
    }
  }

  trackPageView(pageUrl) {
    this.sendEvent('page_view', pageUrl);
  }

  trackClick(pageUrl, event) {
    this.sendEvent('click', pageUrl, {
      x: event.clientX,
      y: event.clientY,
    });
  }
}

export const tracker = new AnalyticsTracker();