import os

from dotenv import load_dotenv

# Init environment configurations
load_dotenv()

from app import create_app  # noqa: E402  (must load .env first)

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f'[Server] Technical backend container active on port: {port}')
    app.run(host='0.0.0.0', port=port)