import os


class Config:
    PORT = int(os.getenv('PORT', 5000))
    MONGODB_URI = os.getenv(
        'MONGODB_URI',
        'mongodb://127.0.0.1:27017/causalfunnel_analytics',
    )