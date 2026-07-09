import datetime

from mongoengine import Document, StringField, FloatField, DateTimeField
from mongoengine.errors import ValidationError


class Event(Document):
    session_id = StringField(required=True)
    event_type = StringField(required=True, choices=('page_view', 'click'))
    page_url = StringField(required=True)
    timestamp = DateTimeField(required=True, default=datetime.datetime.utcnow)
    x = FloatField()
    y = FloatField()
    viewport_width = FloatField(required=True)
    viewport_height = FloatField(required=True)

    meta = {
        'collection': 'events',
        'indexes': [
            {'fields': ['session_id', 'timestamp']},
            {'fields': ['page_url', 'event_type']},
        ],
    }

    def clean(self):
        if self.event_type == 'click' and (self.x is None or self.y is None):
            raise ValidationError(
                'Click events require numeric x and y coordinates.'
            )

    def to_response(self):
        """Serialize to the same shape the original Mongoose model returned."""
        data = {
            '_id': str(self.id),
            'sessionId': self.session_id,
            'eventType': self.event_type,
            'pageUrl': self.page_url,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'viewportWidth': self.viewport_width,
            'viewportHeight': self.viewport_height,
        }
        if self.event_type == 'click':
            data['x'] = self.x
            data['y'] = self.y
        return data