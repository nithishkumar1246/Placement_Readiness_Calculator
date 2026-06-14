import random

def calculate_readiness(scores, cgpa):
    """
    Computes a weighted Placement Readiness Score based on:
    - Aptitude: 25% (Quant: 10%, Logical: 10%, Verbal: 5%)
    - Coding: 35% (Python: 5%, Java: 5%, SQL: 10%, DSA: 15%)
    - Communication: 20% (Speaking: 5%, Presentation: 10%, GD: 5%)
    - Profile strength: 20% (CGPA: 10%, Projects: 5%, Certifications: 5%)
    """
    # 1. Aptitude weighted score (max 25)
    quant_score = (scores.quantitative / 100.0) * 10
    logical_score = (scores.logical / 100.0) * 10
    verbal_score = (scores.verbal / 100.0) * 5
    aptitude_total = quant_score + logical_score + verbal_score

    # 2. Coding weighted score (max 35)
    py_score = (scores.python / 100.0) * 5
    jav_score = (scores.java / 100.0) * 5
    sql_score = (scores.sql / 100.0) * 10
    dsa_score = (scores.dsa / 100.0) * 15
    coding_total = py_score + jav_score + sql_score + dsa_score

    # 3. Communication weighted score (max 20)
    speak_score = (scores.speaking / 100.0) * 5
    pres_score = (scores.presentation / 100.0) * 10
    gd_score = (scores.gd / 100.0) * 5
    comm_total = speak_score + pres_score + gd_score

    # 4. Profile weighted score (max 20)
    cgpa_norm = (cgpa / 10.0) * 10  # max 10
    
    # Projects score (capped at 5 projects for max points)
    proj_points = min(scores.projects_count, 5) * 1.0  # max 5
    
    # Certifications score (capped at 5 certifications for max points)
    cert_points = min(scores.certifications_count, 5) * 1.0  # max 5
    
    profile_total = cgpa_norm + proj_points + cert_points

    # Grand Total
    readiness_score = aptitude_total + coding_total + comm_total + profile_total
    readiness_score = round(min(max(readiness_score, 0.0), 100.0), 2)

    # Classifications
    if readiness_score < 50:
        classification = "Not Ready"
        color = "#EF4444" # red
    elif readiness_score < 70:
        classification = "Need Improvement"
        color = "#F59E0B" # orange
    elif readiness_score < 85:
        classification = "Placement Ready"
        color = "#3B82F6" # blue
    else:
        classification = "Highly Placement Ready"
        color = "#10B981" # green

    # Detect Weak Areas (score < 60)
    weak_areas = []
    if scores.quantitative < 60: weak_areas.append("Quantitative Aptitude")
    if scores.logical < 60: weak_areas.append("Logical Reasoning")
    if scores.verbal < 60: weak_areas.append("Verbal Ability")
    if scores.python < 60: weak_areas.append("Python Programming")
    if scores.java < 60: weak_areas.append("Java Programming")
    if scores.sql < 60: weak_areas.append("SQL Databases")
    if scores.dsa < 60: weak_areas.append("Data Structures & Algorithms (DSA)")
    if scores.speaking < 60: weak_areas.append("Speaking & Spoken English")
    if scores.presentation < 60: weak_areas.append("Presentation Skills")
    if scores.gd < 60: weak_areas.append("Group Discussions")
    if cgpa < 6.5: weak_areas.append("Academic GPA (CGPA)")
    if scores.projects_count < 2: weak_areas.append("Practical Projects")
    if scores.certifications_count < 1: weak_areas.append("Professional Certifications")

    # Generate Recommendations based on weak areas
    recommendations = []
    if "Quantitative Aptitude" in weak_areas or "Logical Reasoning" in weak_areas:
        recommendations.append("Practice daily quantitative and logical puzzles on platforms like Indiabix or GeeksforGeeks.")
    if "Verbal Ability" in weak_areas or "Speaking & Spoken English" in weak_areas:
        recommendations.append("Read editorial columns, practice speaking in front of a mirror, and record mock presentations.")
    if "Python Programming" in weak_areas or "Java Programming" in weak_areas or "SQL Databases" in weak_areas:
        recommendations.append("Solve coding exercises on HackerRank, LeetCode, or SQLZoo to build solid syntax foundation.")
    if "Data Structures & Algorithms (DSA)" in weak_areas:
        recommendations.append("Study core DSA topics: Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting & Searching, and solve Easy/Medium LeetCode problems.")
    if "Presentation Skills" in weak_areas or "Group Discussions" in weak_areas:
        recommendations.append("Participate in mock group discussions or toastmasters. Focus on structured delivery and active listening.")
    if "Academic GPA (CGPA)" in weak_areas:
        recommendations.append("Engage in remedial classes or studies to pull your CGPA above 6.5 or 7.0, as many premium companies enforce this threshold.")
    if "Practical Projects" in weak_areas:
        recommendations.append("Develop at least 2 full-stack projects in React + Node/Python and host them on GitHub with clean README documentation.")
    if "Professional Certifications" in weak_areas:
        recommendations.append("Earn certifications from AWS, Microsoft, Oracle, or Google on Coursera/Udemy to validate your technical claims.")

    # General recommendations if no specific weak areas
    if not recommendations:
        recommendations.append("Maintain your current pace! Solve 1-2 medium coding problems daily and review system design concepts.")
        recommendations.append("Participate in mock interviews to build speed and refine your HR answers.")

    return {
        'readiness_score': readiness_score,
        'classification': classification,
        'color': color,
        'weak_areas': weak_areas,
        'recommendations': recommendations,
        'breakdown': {
            'aptitude': round(aptitude_total, 2),
            'coding': round(coding_total, 2),
            'communication': round(comm_total, 2),
            'profile': round(profile_total, 2)
        }
    }

# Mock database of questions for each topic
QUESTIONS_POOL = {
    "Python": [
        {
            "id": 1,
            "question": "What is the difference between list and tuple in Python? When would you use which?",
            "hint": "Think about mutability, memory allocation, and use cases.",
            "answer": "Lists are mutable, meaning their elements can be modified. They are defined with square brackets `[]` and have a larger memory overhead. Tuples are immutable (cannot be modified after creation), defined with parentheses `()`, and are faster and more memory-efficient. Use tuples for fixed data structures (e.g., coordinates, DB configurations) and lists for collections that change over time."
        },
        {
            "id": 2,
            "question": "Explain decorators in Python with an example.",
            "hint": "Decorators allow you to modify or extend the behavior of functions without modifying their source code.",
            "answer": "A decorator is a function that takes another function as an argument, extends its behavior, and returns a modified function. They are prefixed with `@decorator_name`. Example: a `@log_execution` decorator that prints the execution time of any decorated function."
        },
        {
            "id": 3,
            "question": "How is memory managed in Python? Explain garbage collection and reference counting.",
            "hint": "Python handles memory automatically via a private heap space.",
            "answer": "Python uses a private heap to manage program memory. Reference counting is the primary mechanism: objects are tracked, and when their reference count drops to zero, their memory is reclaimed. For cyclic references (which reference counting can't resolve), Python uses a generational garbage collector that sweeps memory periodically."
        },
        {
            "id": 4,
            "question": "What is the difference between `is` and `==` in Python?",
            "hint": "One checks identity, while the other checks equality.",
            "answer": "`==` compares the *values* of two objects (calls the `__eq__` method). `is` compares the *identity* or memory address of two objects (checks if they point to the exact same location in memory)."
        },
        {
            "id": 5,
            "question": "What are generators in Python, and how do they differ from normal functions?",
            "hint": "Generators use the 'yield' keyword instead of 'return'.",
            "answer": "Generators are functions that return an iterator using the `yield` keyword. Unlike normal functions that execute completely and return all results in a list, generators return values one-by-one lazily, preserving state between executions. This makes them highly memory efficient for processing large files or streams."
        }
    ],
    "Java": [
        {
            "id": 1,
            "question": "Explain the concept of OOPs in Java and list the four pillars.",
            "hint": "Abstraction, Encapsulation, Inheritance, Polymorphism.",
            "answer": "OOPs focuses on creating objects that combine state (fields) and behavior (methods). The pillars are:\n1. Encapsulation: Hiding data using private fields and public getters/setters.\n2. Inheritance: Code reuse using `extends` where a subclass acquires parent behavior.\n3. Polymorphism: Method overloading (compile-time) and method overriding (runtime).\n4. Abstraction: Hiding implementation details using interfaces or abstract classes."
        },
        {
            "id": 2,
            "question": "What is the difference between Abstract Class and Interface in Java 8 and beyond?",
            "hint": "Compare multiple inheritance support, variable declarations, and default methods.",
            "answer": "1. Inheritance: A class can implement multiple interfaces but extend only one abstract class.\n2. State: Abstract classes can have instance fields (state); interfaces cannot (variables are implicitly public static final).\n3. Default methods: Java 8+ interfaces can have `default` and `static` methods. Java 9 added `private` interface methods. Abstract classes can have constructor methods, while interfaces cannot."
        },
        {
            "id": 3,
            "question": "What is the difference between JVM, JRE, and JDK?",
            "hint": "JDK is the developer kit, JRE is the runtime environment, and JVM runs the bytecode.",
            "answer": "1. JVM (Java Virtual Machine): Executes Java bytecode on physical hardware.\n2. JRE (Java Runtime Environment): Contains the JVM and the standard libraries needed to run Java applications.\n3. JDK (Java Development Kit): Full suite for developers containing JRE, compiler (javac), debugger, and utilities."
        },
        {
            "id": 4,
            "question": "Why is the String class immutable in Java?",
            "hint": "Think about String Pool, security, thread-safety, and hashing performance.",
            "answer": "String is immutable in Java for multiple reasons:\n1. String Pool: Allows multiple string references to point to one object, saving memory.\n2. Security: Strings are used for database credentials, network connections, etc. If mutable, a change could create security vulnerabilities.\n3. Thread Safety: Safe to share across threads without synchronization.\n4. Hashcode caching: String hashcodes are cached, making hash operations fast (key in HashMaps)."
        },
        {
            "id": 5,
            "question": "Explain exception handling in Java. What is the difference between Checked and Unchecked exceptions?",
            "hint": "Checked exceptions are verified at compile-time, unchecked are at runtime.",
            "answer": "Exceptions are handled using `try-catch-finally` blocks. Checked exceptions (e.g., `IOException`) inherit from `Exception` and must be either caught or declared in the method signature (`throws`). Unchecked exceptions (e.g., `NullPointerException`) inherit from `RuntimeException` and are not forced to be handled at compile-time."
        }
    ],
    "SQL": [
        {
            "id": 1,
            "question": "What are the different types of SQL Joins? Explain with examples.",
            "hint": "INNER, LEFT, RIGHT, FULL outer joins.",
            "answer": "1. INNER JOIN: Returns matching rows in both tables.\n2. LEFT JOIN: Returns all rows from the left table, and matched rows from the right (NULL if no match).\n3. RIGHT JOIN: Returns all rows from the right table, and matched rows from the left.\n4. FULL JOIN: Returns rows when there is a match in either table."
        },
        {
            "id": 2,
            "question": "What is the difference between GROUP BY and HAVING clauses in SQL?",
            "hint": "One filters rows before grouping, the other filters groups.",
            "answer": "`WHERE` filters individual rows *before* any grouping occurs. `GROUP BY` aggregates rows into groups. `HAVING` filters those aggregated groups *after* the GROUP BY clause based on aggregate functions (e.g., `HAVING COUNT(id) > 5`)."
        },
        {
            "id": 3,
            "question": "What are indexes in databases, and how do they speed up queries? What are the drawbacks?",
            "hint": "Think of it like an index at the back of a textbook.",
            "answer": "An index is a database data structure (typically B-Tree) that provides rapid lookup paths for rows in a table based on column values. Drawback: indexes slow down write operations (INSERT, UPDATE, DELETE) because the index tree must be updated, and they consume extra storage space."
        },
        {
            "id": 4,
            "question": "Explain database normalization. What are 1NF, 2NF, and 3NF?",
            "hint": "Reducing redundancy and dependency in table design.",
            "answer": "Normalization organizes data to avoid redundancy and dependency anomalies:\n- 1NF (First Normal Form): Atomic values only, unique column names, no repeating groups.\n- 2NF (Second Normal Form): In 1NF and all non-key attributes are fully dependent on the primary key (no partial dependency).\n- 3NF (Third Normal Form): In 2NF and no transitive dependencies (non-key columns do not depend on other non-key columns)."
        },
        {
            "id": 5,
            "question": "What are transactions in SQL? Explain the ACID properties.",
            "hint": "Atomicity, Consistency, Isolation, Durability.",
            "answer": "A transaction is a unit of work consisting of multiple queries executed as a single block. ACID properties ensure data integrity:\n- Atomicity: All queries succeed, or all fail (rollback).\n- Consistency: Database moves from one valid state to another.\n- Isolation: Concurrent transactions do not interfere with each other.\n- Durability: Once committed, the changes are permanent, even during system crashes."
        }
    ],
    "DSA": [
        {
            "id": 1,
            "question": "What is the difference between Arrays and Linked Lists? What are their time complexities for insertion and deletion?",
            "hint": "Think about contiguous memory allocation and dynamic resizing.",
            "answer": "Arrays use contiguous memory, offering O(1) lookup via indices but insertion/deletion in the middle takes O(N) due to shifting elements. Linked Lists consist of nodes connected by pointers; lookups take O(N) as we must traverse the list, but insertion/deletion at a known node takes O(1) since we only update pointers."
        },
        {
            "id": 2,
            "question": "Explain the working of Quick Sort. What is its worst-case and average-case time complexity, and how do you avoid the worst case?",
            "hint": "Divide and conquer, pivoting.",
            "answer": "Quick Sort is a divide-and-conquer algorithm. It selects a 'pivot' element, partitions the array into elements smaller and larger than the pivot, and recursively sorts the sub-arrays. Average case: O(N log N). Worst case: O(N^2) (occurs when arrays are already sorted and we pick the first/last element). Avoid worst case by choosing a random pivot or using the 'Median-of-Three' method."
        },
        {
            "id": 3,
            "question": "What is the difference between BFS and DFS in graphs? Which data structures are used to implement them?",
            "hint": "Breadth-first (level-by-level) vs Depth-first (deep path). Queue vs Stack.",
            "answer": "BFS (Breadth-First Search) explores neighbors of a node level-by-level. It uses a Queue (FIFO) and is ideal for finding the shortest path on unweighted graphs. DFS (Depth-First Search) goes as deep as possible down a path before backtracking. It uses a Stack (LIFO, or recursion) and is ideal for cycle detection and topological sorting."
        },
        {
            "id": 4,
            "question": "What is a Binary Search Tree (BST)? What is the time complexity of searching in a BST, and when does it degrade?",
            "hint": "Left child is smaller, right child is larger. Degradation occurs on skewed trees.",
            "answer": "A BST is a binary tree where each node's left child has a value smaller than the node, and the right child has a value greater. Searching, insertion, and deletion take O(log N) on average in a balanced tree. If the tree becomes skewed (e.g. inserting sorted numbers: 1, 2, 3...), it degrades to a linked list with O(N) operations. We use self-balancing BSTs like AVL trees or Red-Black trees to prevent this."
        },
        {
            "id": 5,
            "question": "Explain dynamic programming. How does it differ from recursion or divide-and-conquer?",
            "hint": "Memoization, tabulation, overlapping subproblems.",
            "answer": "Dynamic Programming (DP) solves complex problems by breaking them down into simpler overlapping subproblems. It solves each subproblem once and stores the result (memoization for top-down, tabulation for bottom-up) to avoid redundant calculations. Unlike simple recursion or divide-and-conquer (where subproblems are distinct), DP requires the problem to have overlapping subproblems and optimal substructure."
        }
    ],
    "Aptitude": [
        {
            "id": 1,
            "question": "A train covers a distance of 360 km at a uniform speed. If the speed had been 5 km/hr more, it would have taken 1 hour less for the same journey. What is the original speed of the train?",
            "hint": "Use the formula: Distance = Speed * Time. Create a quadratic equation.",
            "answer": "Let the original speed be x km/hr. Time taken = 360/x.\nNew speed = x + 5, time taken = 360/(x+5).\nGiven: 360/x - 360/(x+5) = 1.\n360(x+5) - 360x = x(x+5)\n1800 = x^2 + 5x\nx^2 + 5x - 1800 = 0\n(x + 45)(x - 40) = 0\nSince speed cannot be negative, x = 40 km/hr."
        },
        {
            "id": 2,
            "question": "A, B, and C can do a piece of work in 20, 30, and 60 days respectively. In how many days can A do the work if he is assisted by B and C on every third day?",
            "hint": "Find the work done by A, B, and C in parts. Compute work in a 3-day cycle.",
            "answer": "A's 1-day work = 1/20\nB's 1-day work = 1/30\nC's 1-day work = 1/60\nDay 1: A works alone = 1/20\nDay 2: A works alone = 1/20\nDay 3: A, B, C work together = 1/20 + 1/30 + 1/60 = (3+2+1)/60 = 6/60 = 1/10\nWork done in 3 days = 1/20 + 1/20 + 1/10 = 2/20 + 1/10 = 1/10 + 1/10 = 2/10 = 1/5 of total work.\nSo, 1/5 of the work is completed in 3 days. Complete work will be done in 3 * 5 = 15 days."
        },
        {
            "id": 3,
            "question": "Point A is 10m West of Point B. Point C is 6m North of Point B. Point D is 5m East of Point C. What is the shortest distance between Point A and Point D?",
            "hint": "Draw the directions on a coordinate grid and use the Pythagorean theorem.",
            "answer": "Let B be at origin (0,0).\nA is 10m West -> A is at (-10, 0).\nC is 6m North of B -> C is at (0, 6).\nD is 5m East of C -> D is at (5, 6).\nWe need distance between A(-10, 0) and D(5, 6).\nHorizontal distance (Delta x) = 5 - (-10) = 15m.\nVertical distance (Delta y) = 6 - 0 = 6m.\nShortest distance = sqrt(15^2 + 6^2) = sqrt(225 + 36) = sqrt(261) = 16.16m."
        },
        {
            "id": 4,
            "question": "A man buys an article for 25% less than its value and sells it for 10% more than its value. What is his profit percentage?",
            "hint": "Assume the actual value is 100. Calculate Cost Price (CP) and Selling Price (SP).",
            "answer": "Let the value of the article be $100.\nCost Price (CP) = 25% less than value = $75.\nSelling Price (SP) = 10% more than value = $110.\nProfit = SP - CP = $110 - $75 = $35.\nProfit % = (Profit / CP) * 100 = (35/75) * 100 = (7/15) * 100 = 46.67%."
        },
        {
            "id": 5,
            "question": "In a group of 6 people, what is the probability that at least two people share the same birth month?",
            "hint": "Use the complement rule: P(at least 2 share) = 1 - P(none share).",
            "answer": "Total number of months = 12.\nProbability that all 6 people have different birth months is:\nP(all different) = (12/12) * (11/12) * (10/12) * (9/12) * (8/12) * (7/12) = (12 * 11 * 10 * 9 * 8 * 7) / (12^6) = 0.2228.\nProbability of at least 2 sharing a month = 1 - 0.2228 = 0.7772 or 77.72%."
        }
    ],
    "HR": [
        {
            "id": 1,
            "question": "Tell me about yourself.",
            "hint": "Use the Present-Past-Future formula. Talk about your current studies, past technical projects, and future career goals.",
            "answer": "Start with a brief summary of your current academics (department, year, CGPA), followed by 1 or 2 key accomplishments (e.g., a software project or hackathon win), and conclude with why you are excited about this specific company and how it aligns with your career path. Keep it between 90-120 seconds."
        },
        {
            "id": 2,
            "question": "What are your greatest strengths and weaknesses?",
            "hint": "For strengths, provide evidence. For weaknesses, state a real minor weakness and how you are working to overcome it.",
            "answer": "Strength example: Quick learning and adaptability, backed by how you picked up React in 2 weeks for a project. Weakness example: Trouble delegating tasks because you want things done perfectly. Overcoming it: You've started using Trello to track responsibilities and explicitly delegate tasks in team projects, which has improved output."
        },
        {
            "id": 3,
            "question": "Where do you see yourself in 5 years?",
            "hint": "Show commitment to growth within the company rather than launching a startup or going back to school.",
            "answer": "Focus on horizontal and vertical skill development: 'In five years, I see myself as a senior technical lead or solution architect in this company. I want to build deep technical expertise in systems design and cloud computing, while also taking on mentorship responsibilities for new hires.'"
        },
        {
            "id": 4,
            "question": "Tell me about a time you had a conflict in a team project and how you resolved it.",
            "hint": "Use the STAR method: Situation, Task, Action, Result. Avoid blaming others.",
            "answer": "Describe a project where a team member fell behind on deadlines. Instead of escalating, you scheduled a one-on-one call, discovered they were struggling with a database config, helped them resolve it, and adjusted the schedule. Result: Project delivered on time and team harmony preserved."
        },
        {
            "id": 5,
            "question": "Why should we hire you over other candidates?",
            "hint": "Connect your unique blend of coding skills, projects, and positive attitude to the job requirements.",
            "answer": "Highlight that you don't just write code, but also understand deployment, system architecture, and collaborate effectively. Mention your Placement Readiness rating and analytical metrics showing consistent preparation, proving that you will require minimal hand-holding and deliver value from day one."
        }
    ]
}

def generate_interview_questions(topic):
    """
    Returns the set of mock interview questions for the selected category.
    """
    category = topic if topic in QUESTIONS_POOL else "Python"
    # Shuffle a copy of the list to ensure variety
    questions = list(QUESTIONS_POOL[category])
    random.shuffle(questions)
    return questions[:5]

def generate_study_plan(weak_areas, duration):
    """
    Generates a structured calendar study schedule focusing on weak areas.
    """
    is_30_day = (duration == '30-day')
    days_count = 30 if is_30_day else 7

    # If student has no weak areas, assign a balanced master schedule
    skills_to_focus = list(weak_areas)
    if not skills_to_focus:
        skills_to_focus = ["DSA", "System Design", "Aptitude", "HR Mock Rounds"]

    plan = []
    
    # Simple day-by-day rotation of weak areas
    for i in range(1, days_count + 1):
        # Determine the current topic for this day
        focus_topic = skills_to_focus[(i - 1) % len(skills_to_focus)]
        
        # Select daily tasks based on the topic
        if "Aptitude" in focus_topic or "Quantitative" in focus_topic or "Logical" in focus_topic or "Verbal" in focus_topic:
            tasks = [
                f"Solve 20 practice questions on {focus_topic}.",
                "Review time-saving formulas and shortcut techniques.",
                "Take a 15-minute timed mock test on IndiaBix."
            ]
            resources = "IndiaBix, RS Aggarwal Books, GeeksforGeeks Aptitude Section"
        elif "DSA" in focus_topic or "Structures" in focus_topic:
            dsa_topics = ["Arrays & String Hashing", "Linked Lists & Trees", "Recursion & Backtracking", "Stacks & Queues", "Greedy & DP", "Graph BFS/DFS"]
            sub_topic = dsa_topics[(i // 2) % len(dsa_topics)]
            tasks = [
                f"Study theoretical concepts of {sub_topic}.",
                f"Solve 1 Easy and 1 Medium problem on {sub_topic} on LeetCode/HackerRank.",
                "Draw execution stack trace for your solution to verify space complexity."
            ]
            resources = "LeetCode, NeetCode.io, Striver's A2Z Sheet"
        elif "SQL" in focus_topic or "Database" in focus_topic:
            tasks = [
                "Practice complex JOINs and Subqueries.",
                "Study Indexes, Transactions (ACID), and database optimization.",
                "Solve 3 database query exercises on LeetCode SQL."
            ]
            resources = "SQLZoo, HackerRank SQL track, w3schools"
        elif "Python" in focus_topic or "Java" in focus_topic or "Coding" in focus_topic:
            tasks = [
                f"Practice language-specific core topics (Generators, Decorators for Python; OOPs, JVM, Collections for Java).",
                "Build a micro mini-console app to demonstrate these concepts.",
                "Solve 2 implementation challenges."
            ]
            resources = "Official documentation, GeeksforGeeks, w3schools"
        elif "Communication" in focus_topic or "GD" in focus_topic or "Speaking" in focus_topic or "Presentation" in focus_topic:
            tasks = [
                "Practice speaking on a random technical topic for 3 minutes (record yourself).",
                "Watch mock Group Discussion videos to learn transitions and body language.",
                "Write down core answers for HR questions: Tell me about yourself, strengths, and goals."
            ]
            resources = "YouTube Mock GD videos, Toastmasters, STAR technique guidelines"
        elif "Projects" in focus_topic or "Practical" in focus_topic:
            tasks = [
                "Commit code updates to GitHub for your primary project.",
                "Write a comprehensive README.md describing stack, configuration, and API routes.",
                "Add error-handling and API validations to your projects."
            ]
            resources = "GitHub repositories, markdown guides, free hosting like Vercel/Render"
        elif "Certifications" in focus_topic:
            tasks = [
                "Complete 2 modules of your ongoing course.",
                "Take practice quizzes and make summaries of core learnings.",
                "Add your current progress status or target completion to your LinkedIn."
            ]
            resources = "Udemy, Coursera, FreeCodeCamp"
        else:
            tasks = [
                f"Review {focus_topic} core handbook.",
                f"Solve 10 practice items on {focus_topic}.",
                "Do a 10-minute self-test."
            ]
            resources = "Standard academic textbooks and online reference blogs"

        plan.append({
            "day": i,
            "topic": focus_topic,
            "tasks": tasks,
            "resources": resources,
            "completed": False
        })

    return plan
