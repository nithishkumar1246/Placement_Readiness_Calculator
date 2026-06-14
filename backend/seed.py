from app import app
from models import db, User, StudentProfile, StudentScores, Company, JobApplication
from werkzeug.security import generate_password_hash

def seed_database():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()

        print("Seeding database...")

        # 1. Create Admin Account
        admin_pass = generate_password_hash("adminpassword")
        admin = User(email="admin@placement.com", password_hash=admin_pass, role="admin")
        db.session.add(admin)

        # 2. Create Demo Student Account
        student_pass = generate_password_hash("studentpassword")
        student = User(email="student@placement.com", password_hash=student_pass, role="student")
        db.session.add(student)
        db.session.commit() # Save users to get IDs

        # 3. Create Student Profile & Scores
        profile = StudentProfile(
            user_id=student.id,
            name="John Doe",
            department="Computer Science & Engineering",
            year="4th Year",
            cgpa=8.2
        )
        db.session.add(profile)

        scores = StudentScores(
            user_id=student.id,
            quantitative=75,
            logical=80,
            verbal=65,
            python=85,
            java=55, # Weak area
            sql=80,
            dsa=72,
            speaking=75,
            presentation=80,
            gd=85,
            projects_count=3,
            certifications_count=2
        )
        db.session.add(scores)

        # 4. Create Companies
        companies_list = [
            Company(name="TCS", min_cgpa=6.0, min_readiness_score=55.0, package_lpa=3.6, role="System Engineer", details="Covers Quantitative Aptitude, Logical Reasoning, and basic Coding questions."),
            Company(name="Infosys", min_cgpa=6.0, min_readiness_score=55.0, package_lpa=3.6, role="Systems Engineer Specialist", details="Emphasis on object-oriented programming concepts and relational databases."),
            Company(name="Wipro", min_cgpa=6.0, min_readiness_score=50.0, package_lpa=3.5, role="Project Engineer", details="Covers logical reasoning, verbal competency, and programming fundamentals."),
            Company(name="Accenture", min_cgpa=6.5, min_readiness_score=60.0, package_lpa=4.5, role="Associate Software Engineer", details="Assesses cognitive ability, technical knowledge, and behavioral attributes."),
            Company(name="Cognizant", min_cgpa=6.0, min_readiness_score=58.0, package_lpa=4.0, role="Programmer Analyst Trainee", details="Tests debugging skills, general quantitative skills, and communication."),
            Company(name="Capgemini", min_cgpa=6.0, min_readiness_score=58.0, package_lpa=4.0, role="Analyst", details="Covers pseudo-code solving, verbal proficiency, and HR fit."),
            Company(name="HCL", min_cgpa=6.0, min_readiness_score=50.0, package_lpa=3.5, role="Graduate Engineer Trainee", details="Focuses on networking foundation, scripting basics, and general aptitude."),
            Company(name="Zoho", min_cgpa=7.0, min_readiness_score=65.0, package_lpa=6.5, role="Software Developer", details="Heavy focus on advanced DSA coding, building data structures from scratch, and database design."),
            Company(name="Standard Chartered", min_cgpa=7.5, min_readiness_score=75.0, package_lpa=8.5, role="Core Software Developer", details="Assesses deep multithreading understanding, data structures, and database query optimization."),
            Company(name="Amazon", min_cgpa=8.0, min_readiness_score=85.0, package_lpa=32.0, role="Software Development Engineer I", details="Rigorous testing of Data Structures and Algorithms (Trees, Graphs, DP), System Design and Leadership principles.")
        ]
        
        for c in companies_list:
            db.session.add(c)
        
        db.session.commit()

        # 5. Create Job Applications for Demo Student
        applications = [
            JobApplication(user_id=student.id, company_name="Accenture", role="Associate Software Engineer", package_lpa=4.5, status="Applied"),
            JobApplication(user_id=student.id, company_name="Zoho", role="Software Developer", package_lpa=6.5, status="Shortlisted"),
            JobApplication(user_id=student.id, company_name="TCS", role="System Engineer", package_lpa=3.6, status="Interview Scheduled")
        ]

        for app_obj in applications:
            db.session.add(app_obj)

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
