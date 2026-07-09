import sys
from datetime import datetime, timezone

from flask import Flask, jsonify
from flask_cors import CORS
from mongoengine import connect

from .config import Config
from .routes.analytics_routes import analytics_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Standard middleware stack configurations
    CORS(app)

    _connect_db(app)

    # Application routing entrypoint namespaces
    app.register_blueprint(analytics_bp, url_prefix='/api')

    # Catch-all health-check interface fallback
    @app.route('/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }), 200

    return app


def _connect_db(app):
    uri = app.config['MONGODB_URI']
    print('[Database] Connecting to MongoDB...')
    try:
        connection = connect(host=uri)
        # Force a round trip so failures surface immediately, like mongoose.connect()
        connection.admin.command('ping')
        host_info = connection.address[0] if connection.address else 'unknown'
        print(f'[Database] MongoDB connected successfully: {host_info}')
    except Exception as error:
        print(f'[Database Error] Connection failed: {error}')
        sys.exit(1)