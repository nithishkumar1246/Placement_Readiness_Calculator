from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, StudentProfile, StudentScores

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student') # 'student' or 'admin'
    name = data.get('name')
    department = data.get('department')
    year = data.get('year')
    cgpa = data.get('cgpa')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 400

    # Ensure role is valid
    if role not in ['student', 'admin']:
        role = 'student'

    # If role is student, profile fields are required
    if role == 'student' and (not name or not department or not year or cgpa is None):
        return jsonify({'message': 'Student profile fields (name, department, year, CGPA) are required'}), 400

    try:
        # Create User
        password_hash = generate_password_hash(password)
        user = User(email=email, password_hash=password_hash, role=role)
        db.session.add(user)
        db.session.commit() # Commit first to generate user.id

        if role == 'student':
            # Create Student Profile
            profile = StudentProfile(
                user_id=user.id,
                name=name,
                department=department,
                year=year,
                cgpa=float(cgpa)
            )
            db.session.add(profile)
            
            # Create Initial Default Student Scores
            scores = StudentScores(
                user_id=user.id,
                quantitative=0,
                logical=0,
                verbal=0,
                python=0,
                java=0,
                sql=0,
                dsa=0,
                speaking=0,
                presentation=0,
                gd=0,
                projects_count=0,
                certifications_count=0
            )
            db.session.add(scores)
            db.session.commit()

        return jsonify({'message': 'User registered successfully'}), 210
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=str(user.id))
    
    # Return user details, profile, etc.
    user_info = {
        'id': user.id,
        'email': user.email,
        'role': user.role
    }

    if user.role == 'student':
        profile = StudentProfile.query.filter_by(user_id=user.id).first()
        if profile:
            user_info['name'] = profile.name
            user_info['department'] = profile.department
            user_info['year'] = profile.year
            user_info['cgpa'] = profile.cgpa

    return jsonify({
        'token': access_token,
        'user': user_info
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user_info = {
        'id': user.id,
        'email': user.email,
        'role': user.role
    }

    if user.role == 'student':
        profile = StudentProfile.query.filter_by(user_id=user.id).first()
        if profile:
            user_info['name'] = profile.name
            user_info['department'] = profile.department
            user_info['year'] = profile.year
            user_info['cgpa'] = profile.cgpa

    return jsonify({'user': user_info}), 200
