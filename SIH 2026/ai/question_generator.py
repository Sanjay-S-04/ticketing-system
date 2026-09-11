import random

class AIQuestionGenerator:
    """AI Engine for generating statistical assessment questions from learning materials."""

    SAMPLE_QUESTION_BANK = [
        {
            "question_text": "Which sampling technique gives every member of a target population an equal non-zero probability of selection?",
            "option_a": "Convenience Sampling",
            "option_b": "Simple Random Sampling",
            "option_c": "Quota Sampling",
            "option_d": "Judgment Sampling",
            "correct_option": "B",
            "difficulty": "Medium",
            "topic": "Sampling Methods",
            "explanation": "Simple Random Sampling guarantees every individual in the sampling frame has an equal probability of being chosen."
        },
        {
            "question_text": "In Python pandas, which function is primarily used to aggregate data by categories before applying statistical summary metrics?",
            "option_a": "df.pivot_table()",
            "option_b": "df.groupby()",
            "option_c": "df.filter()",
            "option_d": "df.transform()",
            "correct_option": "B",
            "difficulty": "Easy",
            "topic": "Python Data Handling",
            "explanation": "df.groupby() splits data into groups based on key columns for split-apply-combine operations."
        },
        {
            "question_text": "What type of chart is most suitable for representing the distribution of a single continuous statistical variable?",
            "option_a": "Bar Chart",
            "option_b": "Pie Chart",
            "option_c": "Histogram",
            "option_d": "Scatter Plot",
            "correct_option": "C",
            "difficulty": "Easy",
            "topic": "Data Visualization",
            "explanation": "Histograms group continuous numerical data into bins to display frequency distributions."
        },
        {
            "question_text": "When assessing multicollinearity in linear regression models for national account indicators, which metric is commonly evaluated?",
            "option_a": "Variance Inflation Factor (VIF)",
            "option_b": "Durbin-Watson Statistic",
            "option_c": "Akaike Information Criterion (AIC)",
            "option_d": "Root Mean Squared Error (RMSE)",
            "correct_option": "A",
            "difficulty": "Hard",
            "topic": "Statistical Modeling",
            "explanation": "VIF measures how much the variance of an estimated regression coefficient is inflated due to collinearity among predictors."
        },
        {
            "question_text": "Which measure of central tendency is least sensitive to extreme values or outliers in economic survey datasets?",
            "option_a": "Arithmetic Mean",
            "option_b": "Median",
            "option_c": "Geometric Mean",
            "option_d": "Weighted Mean",
            "correct_option": "B",
            "difficulty": "Easy",
            "topic": "Descriptive Statistics",
            "explanation": "The median is a resistant measure of location because extreme values in the tail do not pull the middle rank value."
        },
        {
            "question_text": "In survey methodology for India's National Sample Survey (NSS), what is the main purpose of Stratification?",
            "option_a": "To reduce overall sample size without affecting costs",
            "option_b": "To ensure representation across heterogeneous sub-populations and improve precision",
            "option_c": "To replace probability sampling with judgment selection",
            "option_d": "To eliminate non-response bias completely",
            "correct_option": "B",
            "difficulty": "Medium",
            "topic": "Survey Methodology",
            "explanation": "Stratification divides the population into homogeneous subgroups (strata) to lower sampling variance."
        },
        {
            "question_text": "In Matplotlib/Seaborn, which parameter is used to map a categorical variable to distinct colors in a scatter plot?",
            "option_a": "color_by",
            "option_b": "hue",
            "option_c": "legend",
            "option_d": "palette_map",
            "correct_option": "B",
            "difficulty": "Medium",
            "topic": "Data Visualization",
            "explanation": "The 'hue' parameter in Seaborn maps categorical or numerical variables to visual color encodings."
        },
        {
            "question_text": "Under the Consumer Price Index (CPI) estimation methodology, which formula is traditionally used for index weighting?",
            "option_a": "Laspeyres Index Formula",
            "option_b": "Paasche Index Formula",
            "option_c": "Fisher Ideal Index Formula",
            "option_d": "Marshall-Edgeworth Index",
            "correct_option": "A",
            "difficulty": "Hard",
            "topic": "Official Statistics",
            "explanation": "Laspeyres index uses base-period quantity weights, widely employed in price index series compilation."
        },
        {
            "question_text": "Which Python library is specifically optimized for high-performance multidimensional array computations in statistical modeling?",
            "option_a": "Requests",
            "option_b": "NumPy",
            "option_c": "BeautifulSoup",
            "option_d": "Flask",
            "correct_option": "B",
            "difficulty": "Easy",
            "topic": "Python for Statistics",
            "explanation": "NumPy provides vectorised N-dimensional array objects and mathematical operations optimized in C."
        },
        {
            "question_text": "What does a P-value less than 0.05 signify in a standard hypothesis test for statistical significance?",
            "option_a": "The null hypothesis is 100% true",
            "option_b": "Strong evidence against the null hypothesis, rejecting it at the 5% level",
            "option_c": "The alternative hypothesis is false",
            "option_d": "The sample size was inadequate",
            "correct_option": "B",
            "difficulty": "Medium",
            "topic": "Hypothesis Testing",
            "explanation": "A p-value < 0.05 indicates the observed sample data is unlikely under the null hypothesis, leading to rejection of H0."
        }
    ]

    @classmethod
    def generate_quiz(cls, text_content: str, num_questions: int = 5, difficulty: str = "Medium", competency: str = "Statistical Programming") -> list[dict]:
        """Generate MCQs based on document text and parameters."""
        selected_questions = []
        
        # Filter matching difficulty if requested
        pool = [q for q in cls.SAMPLE_QUESTION_BANK if difficulty == "Mixed" or q["difficulty"] == difficulty]
        if len(pool) < num_questions:
            pool = cls.SAMPLE_QUESTION_BANK

        random.seed(len(text_content) + num_questions)
        sampled = random.sample(pool, min(num_questions, len(pool)))
        
        # If user wants more questions than sample bank, duplicate with slight variation
        while len(sampled) < num_questions:
            base = cls.SAMPLE_QUESTION_BANK[len(sampled) % len(cls.SAMPLE_QUESTION_BANK)].copy()
            base["question_text"] = f"[Variant {len(sampled)+1}] " + base["question_text"]
            sampled.append(base)

        for idx, q in enumerate(sampled, start=1):
            selected_questions.append({
                "id": idx,
                "question_text": q["question_text"],
                "option_a": q["option_a"],
                "option_b": q["option_b"],
                "option_c": q["option_c"],
                "option_d": q["option_d"],
                "correct_option": q["correct_option"],
                "difficulty": q["difficulty"],
                "topic": q["topic"],
                "explanation": q.get("explanation", ""),
                "source_topic": f"Extracted from document ({competency})"
            })
            
        return selected_questions
