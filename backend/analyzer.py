import re
import os
import json
from pypdf import PdfReader

# Core skills categories for check
TECHNICAL_SKILLS = {
    'programming': ['python', 'java', 'cpp', 'c++', 'javascript', 'typescript', 'c#', 'ruby', 'golang', 'rust'],
    'web_dev': ['react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'spring boot', 'html', 'css', 'tailwind'],
    'databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'sqlite', 'oracle', 'redis'],
    'dsa_concepts': ['data structures', 'algorithms', 'dsa', 'sorting', 'searching', 'graphs', 'trees', 'recursion'],
    'tools_devops': ['git', 'github', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'jenkins', 'linux']
}

CORE_PLACEMENT_SKILLS = ['python', 'java', 'sql', 'data structures', 'algorithms', 'git', 'react', 'javascript']

def extract_text_from_pdf(file_path):
    """
    Extracts text contents from a PDF file using pypdf.
    """
    text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")
    return text

def analyze_resume_text(text, filename="Resume"):
    """
    Parses resume text to calculate score, match keywords, find gaps, and generate feedback.
    """
    text_lower = text.lower()
    
    # 1. Section Checks (Aesthetics & Format Checklist)
    sections = {
        'Education': re.compile(r'\beducation|academic|qualification\b'),
        'Projects': re.compile(r'\bprojects|academic projects|key projects\b'),
        'Experience': re.compile(r'\bexperience|internship|work experience|employment\b'),
        'Skills': re.compile(r'\bskills|technical skills|expertise|competencies\b'),
        'Contact / Links': re.compile(r'\bemail|phone|contact|linkedin|github\b')
    }
    
    found_sections = []
    section_score = 0
    for section_name, pattern in sections.items():
        if pattern.search(text_lower):
            found_sections.append(section_name)
            section_score += 20  # Max 100 for all sections

    # 2. Skill Extraction
    extracted_skills = []
    for category, skills in TECHNICAL_SKILLS.items():
        for skill in skills:
            # Match whole words or variations (e.g. c++ can have special characters)
            escaped_skill = re.escape(skill)
            if skill in ['c++', 'cpp']:
                # Custom check for c++
                if 'c++' in text_lower or 'cpp' in text_lower:
                    if 'C++' not in extracted_skills:
                        extracted_skills.append('C++')
            else:
                pattern = rf'\b{escaped_skill}\b'
                if re.search(pattern, text_lower):
                    formatted_name = skill.upper() if len(skill) <= 3 else skill.title()
                    if formatted_name not in extracted_skills:
                        extracted_skills.append(formatted_name)

    # 3. Gap Analysis against core placement skills
    missing_core = []
    for skill in CORE_PLACEMENT_SKILLS:
        if not any(skill in s.lower() for s in extracted_skills):
            missing_core.append(skill.upper() if len(skill) <= 3 else skill.title())

    # 4. Contact details checking for professional links
    has_github = 'github.com' in text_lower or 'github' in text_lower
    has_linkedin = 'linkedin.com' in text_lower or 'linkedin' in text_lower
    has_email = '@' in text_lower

    # 5. Scoring Math
    # Section Score (30%)
    # Skills Count Score (40%): Capped at 12 skills for 100 points
    skills_score = min(len(extracted_skills) * 8.5, 100.0)
    
    # Core Skills Match Score (20%): Match out of core placement skills
    core_matches = [s for s in CORE_PLACEMENT_SKILLS if any(s in es.lower() for es in extracted_skills)]
    core_score = (len(core_matches) / len(CORE_PLACEMENT_SKILLS)) * 100.0 if CORE_PLACEMENT_SKILLS else 100.0

    # Links Presence Score (10%): github (4%), linkedin (4%), email (2%)
    links_score = (4 if has_github else 0) + (4 if has_linkedin else 0) + (2 if has_email else 0)
    links_score = links_score * 10.0 # scale to 100

    overall_score = round((section_score * 0.3) + (skills_score * 0.4) + (core_score * 0.2) + (links_score * 0.1), 0)
    overall_score = int(min(max(overall_score, 10), 100))

    # 6. Structured Feedback Comments
    feedback_points = []
    if section_score < 100:
        missing_sections = [sec for sec, pattern in sections.items() if sec not in found_sections]
        feedback_points.append(f"Structure: Missing standard resume sections: {', '.join(missing_sections)}. Add these clearly.")
    else:
        feedback_points.append("Structure: Excellent! Your resume contains all standard sections (Education, Skills, Experience, Projects, Contact).")

    if missing_core:
        feedback_points.append(f"Skill Gap: Missing core placement skills: {', '.join(missing_core)}. Add these to your projects and skills table.")
    else:
        feedback_points.append("Skill Match: Great coverage of core programming, database, and algorithmic foundations.")

    if not has_github:
        feedback_points.append("Contact Details: Missing GitHub profile link. Technical recruiters inspect projects repositories.")
    if not has_linkedin:
        feedback_points.append("Contact Details: Missing LinkedIn link. A clean professional network presence increases selection rates.")
    if not has_email:
        feedback_points.append("Contact Details: Ensure a clear email address is placed at the top header.")

    # Verb count check for impact statement check (action words: built, designed, optimized, led, created)
    action_verbs = ['built', 'designed', 'optimized', 'implemented', 'led', 'created', 'developed', 'achieved', 'managed', 'engineered']
    verb_matches = [v for v in action_verbs if v in text_lower]
    if len(verb_matches) < 3:
        feedback_points.append("Aesthetic Tone: Resume description is too passive. Use strong action verbs (e.g., 'Optimized query latency by 30%', 'Designed responsive UI') instead of 'Responsible for...'.")
    else:
        feedback_points.append("Aesthetic Tone: Good use of action-driven language inside projects and experiences descriptions.")

    return {
        'score': overall_score,
        'extracted_skills': extracted_skills,
        'skill_gap': missing_core,
        'feedback': feedback_points
    }
