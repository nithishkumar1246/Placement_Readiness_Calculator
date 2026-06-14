from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='student', nullable=False) # 'student' or 'admin'
    
    # Relationships
    profile = db.relationship('StudentProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    scores = db.relationship('StudentScores', backref='user', uselist=False, cascade="all, delete-orphan")
    applications = db.relationship('JobApplication', backref='user', cascade="all, delete-orphan")
    resumes = db.relationship('ResumeScan', backref='user', cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role
        }

class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    year = db.Column(db.String(20), nullable=False) # '1st Year', '2nd Year', '3rd Year', '4th Year'
    cgpa = db.Column(db.Float, nullable=False)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'department': self.department,
            'year': self.year,
            'cgpa': self.cgpa
        }

class StudentScores(db.Model):
    __tablename__ = 'student_scores'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    
    # Aptitude Scores (0-100)
    quantitative = db.Column(db.Integer, default=0, nullable=False)
    logical = db.Column(db.Integer, default=0, nullable=False)
    verbal = db.Column(db.Integer, default=0, nullable=False)
    
    # Coding Scores (0-100)
    python = db.Column(db.Integer, default=0, nullable=False)
    java = db.Column(db.Integer, default=0, nullable=False)
    sql = db.Column(db.Integer, default=0, nullable=False)
    dsa = db.Column(db.Integer, default=0, nullable=False)
    
    # Communication Scores (0-100)
    speaking = db.Column(db.Integer, default=0, nullable=False)
    presentation = db.Column(db.Integer, default=0, nullable=False)
    gd = db.Column(db.Integer, default=0, nullable=False)
    
    # Profile counts
    projects_count = db.Column(db.Integer, default=0, nullable=False)
    certifications_count = db.Column(db.Integer, default=0, nullable=False)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'quantitative': self.quantitative,
            'logical': self.logical,
            'verbal': self.verbal,
            'python': self.python,
            'java': self.java,
            'sql': self.sql,
            'dsa': self.dsa,
            'speaking': self.speaking,
            'presentation': self.presentation,
            'gd': self.gd,
            'projects_count': self.projects_count,
            'certifications_count': self.certifications_count
        }

class Company(db.Model):
    __tablename__ = 'companies'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    min_cgpa = db.Column(db.Float, default=6.0, nullable=False)
    min_readiness_score = db.Column(db.Float, default=55.0, nullable=False)
    package_lpa = db.Column(db.Float, nullable=False)
    role = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'min_cgpa': self.min_cgpa,
            'min_readiness_score': self.min_readiness_score,
            'package_lpa': self.package_lpa,
            'role': self.role,
            'details': self.details
        }

class JobApplication(db.Model):
    __tablename__ = 'job_applications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    company_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    package_lpa = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Applied', nullable=False) # 'Applied', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Selected'
    date_applied = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'company_name': self.company_name,
            'role': self.role,
            'package_lpa': self.package_lpa,
            'status': self.status,
            'date_applied': self.date_applied.strftime('%Y-%m-%d')
        }

class ResumeScan(db.Model):
    __tablename__ = 'resume_scans'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    file_name = db.Column(db.String(256), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    extracted_skills = db.Column(db.Text, nullable=False) # JSON or list as text
    skill_gap = db.Column(db.Text, nullable=False) # JSON or list as text
    feedback = db.Column(db.Text, nullable=False) # Detailed text
    scanned_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'file_name': self.file_name,
            'score': self.score,
            'extracted_skills': self.extracted_skills,
            'skill_gap': self.skill_gap,
            'feedback': self.feedback,
            'scanned_at': self.scanned_at.strftime('%Y-%m-%d %H:%M:%S')
        }
