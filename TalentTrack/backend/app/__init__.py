from flask import Flask
from flask_cors import CORS
from .config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app)

    # Initialize MongoDB
    from .db import init_db
    init_db(app)

    # Register blueprints
    from .routes.auth_routes import bp as auth_bp
    from .routes.task_routes import bp as task_bp
    from .routes.user_routes import bp as user_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(task_bp, url_prefix='/api/tasks')
    app.register_blueprint(user_bp, url_prefix='/api/users')

    @app.route('/health')
    def health_check():
        return {'status': 'ok'}

    return app
