import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from models import db, User, StudentProfile, StudentScores, Company, JobApplication, ResumeScan
from auth import auth_bp
from ai_helpers import calculate_readiness, generate_interview_questions, generate_study_plan
from analyzer import analyze_resume_text, extract_text_from_pdf

app = Flask(__name__)

# Configurations
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'database.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'placement-readiness-secret-key-12345' # Standard secret
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'uploads')

# Create uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize Plugins
CORS(app)
db.init_app(app)
jwt = JWTManager(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Helper to check if user is admin
def is_admin(user_id):
    user = User.query.get(user_id)
    return user and user.role == 'admin'

# --- API ROUTES ---

# 1. Get student profile, scores, and readiness calculations
@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    scores = StudentScores.query.filter_by(user_id=user_id).first()
    
    if not profile:
        return jsonify({'message': 'Profile not found'}), 404
        
    # Standard default scores if not found
    if not scores:
        scores = StudentScores(user_id=user_id)
        db.session.add(scores)
        db.session.commit()

    readiness = calculate_readiness(scores, profile.cgpa)
    
    return jsonify({
        'profile': profile.to_dict(),
        'scores': scores.to_dict(),
        'readiness': readiness
    }), 200

# 2. Update profile and scores
@app.route('/api/profile', methods=['POST'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    scores = StudentScores.query.filter_by(user_id=user_id).first()
    
    if not profile:
        return jsonify({'message': 'Profile not found'}), 404
        
    try:
        # Update Profile Details
        if 'name' in data: profile.name = data['name']
        if 'department' in data: profile.department = data['department']
        if 'year' in data: profile.year = data['year']
        if 'cgpa' in data: profile.cgpa = float(data['cgpa'])
        
        # Update Scores
        if 'scores' in data:
            s_data = data['scores']
            if not scores:
                scores = StudentScores(user_id=user_id)
                db.session.add(scores)
            
            # Aptitude
            if 'quantitative' in s_data: scores.quantitative = int(s_data['quantitative'])
            if 'logical' in s_data: scores.logical = int(s_data['logical'])
            if 'verbal' in s_data: scores.verbal = int(s_data['verbal'])
            
            # Coding
            if 'python' in s_data: scores.python = int(s_data['python'])
            if 'java' in s_data: scores.java = int(s_data['java'])
            if 'sql' in s_data: scores.sql = int(s_data['sql'])
            if 'dsa' in s_data: scores.dsa = int(s_data['dsa'])
            
            # Comm
            if 'speaking' in s_data: scores.speaking = int(s_data['speaking'])
            if 'presentation' in s_data: scores.presentation = int(s_data['presentation'])
            if 'gd' in s_data: scores.gd = int(s_data['gd'])
            
            # Counts
            if 'projects_count' in s_data: scores.projects_count = int(s_data['projects_count'])
            if 'certifications_count' in s_data: scores.certifications_count = int(s_data['certifications_count'])
            
        db.session.commit()
        
        # Recalculate
        readiness = calculate_readiness(scores, profile.cgpa)
        
        return jsonify({
            'message': 'Profile and scores updated successfully',
            'profile': profile.to_dict(),
            'scores': scores.to_dict(),
            'readiness': readiness
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Update failed: {str(e)}'}), 500

# 3. Get Companies & Eligibility Check
@app.route('/api/companies', methods=['GET'])
@jwt_required()
def get_companies():
    user_id = int(get_jwt_identity())
    companies = Company.query.all()
    
    # Get student metrics to check eligibility
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    scores = StudentScores.query.filter_by(user_id=user_id).first()
    
    results = []
    
    student_cgpa = profile.cgpa if profile else 0.0
    student_readiness = 0.0
    
    if profile and scores:
        readiness_calc = calculate_readiness(scores, profile.cgpa)
        student_readiness = readiness_calc['readiness_score']
        
    for c in companies:
        eligible = (student_cgpa >= c.min_cgpa) and (student_readiness >= c.min_readiness_score)
        c_dict = c.to_dict()
        c_dict['eligible'] = eligible
        c_dict['reason'] = ""
        
        if not eligible:
            reasons = []
            if student_cgpa < c.min_cgpa:
                reasons.append(f"CGPA too low (Needs {c.min_cgpa}, you have {student_cgpa})")
            if student_readiness < c.min_readiness_score:
                reasons.append(f"Placement Readiness Score too low (Needs {c.min_readiness_score}%, you have {student_readiness}%)")
            c_dict['reason'] = " & ".join(reasons)
            
        results.append(c_dict)
        
    return jsonify(results), 200

# Admin add/edit company
@app.route('/api/companies', methods=['POST'])
@jwt_required()
def add_company():
    user_id = int(get_jwt_identity())
    if not is_admin(user_id):
        return jsonify({'message': 'Admin permission required'}), 403
        
    data = request.get_json() or {}
    name = data.get('name')
    min_cgpa = data.get('min_cgpa', 6.0)
    min_readiness_score = data.get('min_readiness_score', 55.0)
    package_lpa = data.get('package_lpa')
    role = data.get('role')
    details = data.get('details', '')
    
    if not name or package_lpa is None or not role:
        return jsonify({'message': 'Company name, role, and package package_lpa are required'}), 400
        
    try:
        company = Company.query.filter_by(name=name).first()
        if company:
            # Edit existing
            company.min_cgpa = float(min_cgpa)
            company.min_readiness_score = float(min_readiness_score)
            company.package_lpa = float(package_lpa)
            company.role = role
            company.details = details
            msg = "Company details updated successfully"
        else:
            # Add new
            company = Company(
                name=name,
                min_cgpa=float(min_cgpa),
                min_readiness_score=float(min_readiness_score),
                package_lpa=float(package_lpa),
                role=role,
                details=details
            )
            db.session.add(company)
            msg = "Company added successfully"
            
        db.session.commit()
        return jsonify({'message': msg, 'company': company.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to save company: {str(e)}'}), 500

@app.route('/api/companies/<int:cid>', methods=['DELETE'])
@jwt_required()
def delete_company(cid):
    user_id = int(get_jwt_identity())
    if not is_admin(user_id):
        return jsonify({'message': 'Admin permission required'}), 403
        
    company = Company.query.get(cid)
    if not company:
        return jsonify({'message': 'Company not found'}), 404
        
    try:
        db.session.delete(company)
        db.session.commit()
        return jsonify({'message': 'Company deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete company: {str(e)}'}), 500

# 4. Job Tracker Routes
@app.route('/api/tracker/applications', methods=['GET'])
@jwt_required()
def get_applications():
    user_id = int(get_jwt_identity())
    apps = JobApplication.query.filter_by(user_id=user_id).all()
    return jsonify([a.to_dict() for a in apps]), 200

@app.route('/api/tracker/applications', methods=['POST'])
@jwt_required()
def add_or_update_application():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    
    app_id = data.get('id')
    company_name = data.get('company_name')
    role = data.get('role')
    package_lpa = data.get('package_lpa')
    status = data.get('status', 'Applied')
    
    if app_id:
        # Update existing application
        app_obj = JobApplication.query.filter_by(id=app_id, user_id=user_id).first()
        if not app_obj:
            return jsonify({'message': 'Application not found'}), 404
        if status:
            app_obj.status = status
        if role:
            app_obj.role = role
        if package_lpa is not None:
            app_obj.package_lpa = float(package_lpa)
        msg = "Application status updated"
    else:
        # Create new application
        if not company_name or not role or package_lpa is None:
            return jsonify({'message': 'Company name, role, and package package_lpa are required'}), 400
        app_obj = JobApplication(
            user_id=user_id,
            company_name=company_name,
            role=role,
            package_lpa=float(package_lpa),
            status=status
        )
        db.session.add(app_obj)
        msg = "Application added successfully"
        
    try:
        db.session.commit()
        return jsonify({'message': msg, 'application': app_obj.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to save application: {str(e)}'}), 500

@app.route('/api/tracker/applications/<int:app_id>', methods=['DELETE'])
@jwt_required()
def delete_application(app_id):
    user_id = int(get_jwt_identity())
    app_obj = JobApplication.query.filter_by(id=app_id, user_id=user_id).first()
    if not app_obj:
        return jsonify({'message': 'Application not found'}), 404
    try:
        db.session.delete(app_obj)
        db.session.commit()
        return jsonify({'message': 'Application deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete: {str(e)}'}), 500

# 5. Resume Analyzer Route
@app.route('/api/resume/analyze', methods=['POST'])
@jwt_required()
def analyze_resume():
    user_id = int(get_jwt_identity())
    
    # Check if this is a file upload or a text submission
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'Empty file uploaded'}), 400
            
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{user_id}_{filename}")
        file.save(file_path)
        
        # Extract Text
        if filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_path)
        else:
            # Assume txt
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            except Exception as e:
                return jsonify({'message': f'Failed to read text file: {str(e)}'}), 500
                
        # Remove local file after reading to save space
        try:
            os.remove(file_path)
        except:
            pass
    elif request.json and 'text' in request.json:
        text = request.json['text']
        filename = "Text_Resume_Input.txt"
    else:
        return jsonify({'message': 'No resume file or text content provided'}), 400
        
    if not text.strip():
        return jsonify({'message': 'Could not extract any text from the provided resume'}), 400
        
    # Analyze text
    result = analyze_resume_text(text, filename)
    
    # Save scan to database
    scan = ResumeScan(
        user_id=user_id,
        file_name=filename,
        score=result['score'],
        extracted_skills=json.dumps(result['extracted_skills']),
        skill_gap=json.dumps(result['skill_gap']),
        feedback=json.dumps(result['feedback'])
    )
    
    try:
        db.session.add(scan)
        db.session.commit()
        
        return jsonify({
            'id': scan.id,
            'file_name': scan.file_name,
            'score': scan.score,
            'extracted_skills': result['extracted_skills'],
            'skill_gap': result['skill_gap'],
            'feedback': result['feedback'],
            'scanned_at': scan.scanned_at.strftime('%Y-%m-%d %H:%M:%S')
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database save failed: {str(e)}'}), 500

@app.route('/api/resume/history', methods=['GET'])
@jwt_required()
def get_resume_history():
    user_id = int(get_jwt_identity())
    scans = ResumeScan.query.filter_by(user_id=user_id).order_by(ResumeScan.scanned_at.desc()).all()
    
    results = []
    for s in scans:
        results.append({
            'id': s.id,
            'file_name': s.file_name,
            'score': s.score,
            'extracted_skills': json.loads(s.extracted_skills),
            'skill_gap': json.loads(s.skill_gap),
            'feedback': json.loads(s.feedback),
            'scanned_at': s.scanned_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(results), 200

# 6. AI Interview QA Route
@app.route('/api/ai/interview-questions', methods=['POST'])
@jwt_required()
def get_interview_prep():
    data = request.get_json() or {}
    topic = data.get('topic', 'Python')
    questions = generate_interview_questions(topic)
    return jsonify({'questions': questions}), 200

# 7. AI Study Planner Route
@app.route('/api/ai/study-plan', methods=['POST'])
@jwt_required()
def get_study_schedule():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    duration = data.get('duration', '7-day')
    
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    scores = StudentScores.query.filter_by(user_id=user_id).first()
    
    weak_areas = []
    if profile and scores:
        readiness_calc = calculate_readiness(scores, profile.cgpa)
        weak_areas = readiness_calc['weak_areas']
        
    plan = generate_study_plan(weak_areas, duration)
    return jsonify({'plan': plan}), 200

# 8. Admin Panel Routes
@app.route('/api/admin/dashboard', methods=['GET'])
@jwt_required()
def get_admin_dashboard():
    user_id = int(get_jwt_identity())
    if not is_admin(user_id):
        return jsonify({'message': 'Admin permission required'}), 403
        
    # Get general analytical aggregates
    students = StudentProfile.query.all()
    student_count = len(students)
    
    if student_count == 0:
        return jsonify({
            'student_count': 0,
            'avg_cgpa': 0,
            'avg_readiness': 0,
            'classifications': {},
            'students_list': []
        }), 200
        
    cgpa_sum = sum(s.cgpa for s in students)
    avg_cgpa = round(cgpa_sum / student_count, 2)
    
    # Collect profiles and scores mapping
    students_list = []
    readiness_sum = 0
    not_ready = 0
    need_imp = 0
    ready = 0
    highly_ready = 0
    
    for s in students:
        scores = StudentScores.query.filter_by(user_id=s.user_id).first()
        readiness_score = 0.0
        classification = "Not Ready"
        
        if scores:
            readiness_calc = calculate_readiness(scores, s.cgpa)
            readiness_score = readiness_calc['readiness_score']
            classification = readiness_calc['classification']
            
        readiness_sum += readiness_score
        
        if classification == "Not Ready": not_ready += 1
        elif classification == "Need Improvement": need_imp += 1
        elif classification == "Placement Ready": ready += 1
        elif classification == "Highly Placement Ready": highly_ready += 1
        
        students_list.append({
            'user_id': s.user_id,
            'name': s.name,
            'email': User.query.get(s.user_id).email,
            'department': s.department,
            'year': s.year,
            'cgpa': s.cgpa,
            'readiness_score': readiness_score,
            'classification': classification,
            'scores': scores.to_dict() if scores else None
        })
        
    avg_readiness = round(readiness_sum / student_count, 2)
    
    # Department breakdown
    departments = {}
    for s in students:
        departments[s.department] = departments.get(s.department, 0) + 1
        
    return jsonify({
        'student_count': student_count,
        'avg_cgpa': avg_cgpa,
        'avg_readiness': avg_readiness,
        'classifications': {
            'Not Ready': not_ready,
            'Need Improvement': need_imp,
            'Placement Ready': ready,
            'Highly Placement Ready': highly_ready
        },
        'departments': departments,
        'students_list': students_list
    }), 200

# Delete student account
@app.route('/api/admin/users/<int:sid>', methods=['DELETE'])
@jwt_required()
def delete_student(sid):
    user_id = int(get_jwt_identity())
    if not is_admin(user_id):
        return jsonify({'message': 'Admin permission required'}), 403
        
    user = User.query.get(sid)
    if not user:
        return jsonify({'message': 'Student not found'}), 404
        
    if user.role == 'admin':
        return jsonify({'message': 'Cannot delete an administrator account'}), 400
        
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Student account deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete user: {str(e)}'}), 500

# Admin get student full details
@app.route('/api/admin/users/<int:sid>/details', methods=['GET'])
@jwt_required()
def admin_get_student_details(sid):
    user_id = int(get_jwt_identity())
    if not is_admin(user_id):
        return jsonify({'message': 'Admin permission required'}), 403
        
    user = User.query.get(sid)
    if not user:
        return jsonify({'message': 'Student not found'}), 404
        
    profile = StudentProfile.query.filter_by(user_id=sid).first()
    scores = StudentScores.query.filter_by(user_id=sid).first()
    
    # Calculate readiness score and classification
    readiness_score = 0.0
    classification = "Not Ready"
    if scores and profile:
        readiness_calc = calculate_readiness(scores, profile.cgpa)
        readiness_score = readiness_calc['readiness_score']
        classification = readiness_calc['classification']
        
    # Get applications
    applications = [app.to_dict() for app in JobApplication.query.filter_by(user_id=sid).all()]
    
    # Get resumes
    resumes = [res.to_dict() for res in ResumeScan.query.filter_by(user_id=sid).all()]
    
    return jsonify({
        'user_id': sid,
        'email': user.email,
        'profile': profile.to_dict() if profile else None,
        'scores': scores.to_dict() if scores else None,
        'readiness_score': readiness_score,
        'classification': classification,
        'applications': applications,
        'resumes': resumes
    }), 200

# Admin edit student scores
@app.route('/api/admin/users/<int:sid>/scores', methods=['PUT'])
@jwt_required()
def admin_update_student_scores(sid):
    user_id = int(get_jwt_identity())
    if not is_admin(user_id):
        return jsonify({'message': 'Admin permission required'}), 403
        
    data = request.get_json() or {}
    scores = StudentScores.query.filter_by(user_id=sid).first()
    profile = StudentProfile.query.filter_by(user_id=sid).first()
    
    if not profile or not scores:
        return jsonify({'message': 'Student profile/scores not found'}), 404
        
    try:
        # Aptitude
        if 'quantitative' in data: scores.quantitative = int(data['quantitative'])
        if 'logical' in data: scores.logical = int(data['logical'])
        if 'verbal' in data: scores.verbal = int(data['verbal'])
        
        # Coding
        if 'python' in data: scores.python = int(data['python'])
        if 'java' in data: scores.java = int(data['java'])
        if 'sql' in data: scores.sql = int(data['sql'])
        if 'dsa' in data: scores.dsa = int(data['dsa'])
        
        # Comm
        if 'speaking' in data: scores.speaking = int(data['speaking'])
        if 'presentation' in data: scores.presentation = int(data['presentation'])
        if 'gd' in data: scores.gd = int(data['gd'])
        
        # Counts
        if 'projects_count' in data: scores.projects_count = int(data['projects_count'])
        if 'certifications_count' in data: scores.certifications_count = int(data['certifications_count'])
        
        # Admin can also override CGPA directly
        if 'cgpa' in data:
            profile.cgpa = float(data['cgpa'])
            
        db.session.commit()
        return jsonify({'message': 'Scores updated successfully', 'scores': scores.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update: {str(e)}'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
