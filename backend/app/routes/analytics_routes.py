from flask import Blueprint

from ..controllers.analytics_controller import (
    track_event,
    get_sessions_list,
    get_session_timeline,
    get_heatmap_data,
)

analytics_bp = Blueprint('analytics', __name__)

analytics_bp.add_url_rule('/events', view_func=track_event, methods=['POST'])
analytics_bp.add_url_rule('/sessions', view_func=get_sessions_list, methods=['GET'])
analytics_bp.add_url_rule(
    '/sessions/<session_id>/events',
    view_func=get_session_timeline,
    methods=['GET'],
)
analytics_bp.add_url_rule('/heatmap', view_func=get_heatmap_data, methods=['GET'])