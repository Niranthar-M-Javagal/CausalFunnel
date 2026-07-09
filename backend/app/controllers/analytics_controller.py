from datetime import datetime

from flask import request, jsonify
from mongoengine.errors import ValidationError as MongoValidationError

from ..models.event import Event

VALID_EVENT_TYPES = ['page_view', 'click']


def _is_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _parse_timestamp(raw):
    if not raw:
        return datetime.utcnow()
    # Support trailing 'Z' (UTC) which datetime.fromisoformat rejects on
    # Python < 3.11.
    if isinstance(raw, str) and raw.endswith('Z'):
        raw = raw[:-1] + '+00:00'
    return datetime.fromisoformat(raw)


def track_event():
    """
    @desc    Receive and store an analytics event
    @route   POST /api/events
    @access  Public
    """
    try:
        body = request.get_json(silent=True) or {}

        session_id = body.get('sessionId')
        event_type = body.get('eventType')
        page_url = body.get('pageUrl')
        timestamp = body.get('timestamp')
        x = body.get('x')
        y = body.get('y')
        viewport_width = body.get('viewportWidth')
        viewport_height = body.get('viewportHeight')

        if not session_id or not event_type or not page_url:
            return jsonify({
                'success': False,
                'message': 'sessionId, eventType, and pageUrl are required.',
            }), 400

        if event_type not in VALID_EVENT_TYPES:
            return jsonify({
                'success': False,
                'message': 'Invalid eventType. Allowed values: page_view, click.',
            }), 400

        if not _is_number(viewport_width) or not _is_number(viewport_height):
            return jsonify({
                'success': False,
                'message': 'viewportWidth and viewportHeight must be numbers.',
            }), 400

        if event_type == 'click':
            if not _is_number(x) or not _is_number(y):
                return jsonify({
                    'success': False,
                    'message': 'Click events require numeric x and y coordinates.',
                }), 400

        new_event = Event(
            session_id=session_id,
            event_type=event_type,
            page_url=page_url,
            timestamp=_parse_timestamp(timestamp),
            x=x if event_type == 'click' else None,
            y=y if event_type == 'click' else None,
            viewport_width=viewport_width,
            viewport_height=viewport_height,
        )
        new_event.save()

        return jsonify({'success': True, 'data': new_event.to_response()}), 201
    except MongoValidationError as error:
        return jsonify({'success': False, 'message': str(error)}), 400
    except Exception as error:
        print(f'[Track Event Error] {error}')
        return jsonify({
            'success': False,
            'message': 'Failed to store analytics event.',
        }), 500


def get_sessions_list():
    """
    @desc    Fetch all sessions with event summary stats
    @route   GET /api/sessions
    @access  Public
    """
    try:
        pipeline = [
            {
                '$group': {
                    '_id': '$session_id',
                    'totalEvents': {'$sum': 1},
                    'pageViews': {
                        '$sum': {
                            '$cond': [{'$eq': ['$event_type', 'page_view']}, 1, 0]
                        }
                    },
                    'clicks': {
                        '$sum': {
                            '$cond': [{'$eq': ['$event_type', 'click']}, 1, 0]
                        }
                    },
                    'startedAt': {'$min': '$timestamp'},
                    'endedAt': {'$max': '$timestamp'},
                }
            },
            {
                '$project': {
                    '_id': 0,
                    'sessionId': '$_id',
                    'totalEvents': 1,
                    'pageViews': 1,
                    'clicks': 1,
                    'startedAt': 1,
                    'endedAt': 1,
                }
            },
            {'$sort': {'startedAt': -1}},
        ]

        summaries = list(Event._get_collection().aggregate(pipeline))
        for summary in summaries:
            if isinstance(summary.get('startedAt'), datetime):
                summary['startedAt'] = summary['startedAt'].isoformat()
            if isinstance(summary.get('endedAt'), datetime):
                summary['endedAt'] = summary['endedAt'].isoformat()

        return jsonify({'success': True, 'data': summaries}), 200
    except Exception as error:
        print(f'[Get Sessions Error] {error}')
        return jsonify({
            'success': False,
            'message': 'Failed to fetch sessions.',
        }), 500


def get_session_timeline(session_id):
    """
    @desc    Fetch ordered event timeline for a session
    @route   GET /api/sessions/<session_id>/events
    @access  Public
    """
    try:
        events = Event.objects(session_id=session_id).order_by('timestamp')
        data = [event.to_response() for event in events]
        return jsonify({'success': True, 'data': data}), 200
    except Exception as error:
        print(f'[Get Session Timeline Error] {error}')
        return jsonify({
            'success': False,
            'message': 'Failed to fetch session timeline.',
        }), 500


def get_heatmap_data():
    """
    @desc    Fetch click coordinates for a page
    @route   GET /api/heatmap?pageUrl=...
    @access  Public
    """
    try:
        page_url = request.args.get('pageUrl')

        if not page_url:
            return jsonify({
                'success': False,
                'message': 'pageUrl query parameter is required.',
            }), 400

        events = (
            Event.objects(page_url=page_url, event_type='click')
            .order_by('timestamp')
            .only('x', 'y', 'viewport_width', 'viewport_height', 'timestamp')
        )

        data = [
            {
                'x': event.x,
                'y': event.y,
                'viewportWidth': event.viewport_width,
                'viewportHeight': event.viewport_height,
                'timestamp': event.timestamp.isoformat() if event.timestamp else None,
            }
            for event in events
        ]

        return jsonify({'success': True, 'data': data}), 200
    except Exception as error:
        print(f'[Get Heatmap Error] {error}')
        return jsonify({
            'success': False,
            'message': 'Failed to fetch heatmap data.',
        }), 500