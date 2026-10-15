package com.hireai.ai.service;

import com.hireai.ai.dto.AiDtos;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${hireai.ai.provider:mock}")
    private String aiProvider;

    private static final List<String> COMMON_TECH_SKILLS = List.of(
            "Java", "Spring Boot", "Spring Security", "Hibernate", "JPA", "PostgreSQL",
            "MySQL", "Redis", "Kafka", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
            "React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Next.js",
            "Node.js", "Express", "Python", "FastAPI", "Go", "C++", "C#", ".NET",
            "GraphQL", "REST API", "Microservices", "CI/CD", "Git", "GitHub", "Linux",
            "Elasticsearch", "pgvector", "OpenAI", "Prompt Engineering", "Machine Learning"
    );

    public AiDtos.MatchResultResponse matchResumeToJob(String resumeText, String jobTitle, String jobDescription) {
        String safeResume = resumeText != null ? resumeText.toLowerCase() : "";
        String safeJob = ((jobTitle != null ? jobTitle : "") + " " + (jobDescription != null ? jobDescription : "")).toLowerCase();

        Set<String> matched = new LinkedHashSet<>();
        Set<String> missing = new LinkedHashSet<>();

        for (String skill : COMMON_TECH_SKILLS) {
            String lowerSkill = skill.toLowerCase();
            boolean inJob = safeJob.contains(lowerSkill);
            boolean inResume = safeResume.contains(lowerSkill);

            if (inJob && inResume) {
                matched.add(skill);
            } else if (inJob && !inResume) {
                missing.add(skill);
            }
        }

        // If job description doesn't explicitly mention enough skills, infer default relevant skills from title
        if (matched.isEmpty() && missing.isEmpty()) {
            if (safeJob.contains("java") || safeJob.contains("backend") || safeJob.contains("engineer")) {
                if (safeResume.contains("java")) matched.add("Java");
                if (safeResume.contains("spring")) matched.add("Spring Boot");
                if (safeResume.contains("sql") || safeResume.contains("postgres")) matched.add("PostgreSQL");
                if (safeResume.contains("docker")) matched.add("Docker");
                if (!safeResume.contains("kubernetes")) missing.add("Kubernetes");
                if (!safeResume.contains("redis")) missing.add("Redis");
            }
        }

        int totalRequired = matched.size() + missing.size();
        double skillScore = totalRequired > 0 ? ((double) matched.size() / totalRequired) * 100.0 : 75.0;
        // Keep skill score in a realistic band (e.g. 50% - 95%)
        skillScore = Math.max(35.0, Math.min(95.0, skillScore));

        // Experience score estimation
        double expScore = 80.0;
        if (safeResume.contains("senior") || safeResume.contains("lead") || safeResume.contains("architect")) {
            expScore = 90.0;
        } else if (safeResume.contains("junior") || safeResume.contains("intern")) {
            expScore = 70.0;
        }

        double overallScore = (skillScore * 0.6) + (expScore * 0.4);

        BigDecimal bdOverall = BigDecimal.valueOf(overallScore).setScale(1, RoundingMode.HALF_UP);
        BigDecimal bdSkill = BigDecimal.valueOf(skillScore).setScale(1, RoundingMode.HALF_UP);
        BigDecimal bdExp = BigDecimal.valueOf(expScore).setScale(1, RoundingMode.HALF_UP);

        List<String> strengths = new ArrayList<>();
        if (!matched.isEmpty()) {
            strengths.add("Strong alignment in foundational stack: " + String.join(", ", matched.stream().limit(4).toList()));
        }
        strengths.add("Demonstrated project experience relevant to role requirements");
        strengths.add("Clear documentation of architectural and backend design patterns");

        List<String> recommendations = new ArrayList<>();
        if (!missing.isEmpty()) {
            recommendations.add("Highlight any hands-on exposure to: " + String.join(", ", missing.stream().limit(3).toList()));
        }
        recommendations.add("Quantify impact in bullet points (e.g., latency reduction, throughput improvements)");
        recommendations.add("Include direct links to live demos or GitHub code repositories");

        String fitSummary = String.format(
                "Candidate demonstrates an estimated %.1f%% overall compatibility for the %s position. Core strengths include %s. Addressing gaps in %s will further strengthen the application.",
                overallScore,
                jobTitle != null && !jobTitle.isBlank() ? jobTitle : "target",
                matched.isEmpty() ? "core software engineering fundamentals" : String.join(", ", matched.stream().limit(3).toList()),
                missing.isEmpty() ? "domain-specific cloud tooling" : String.join(", ", missing.stream().limit(2).toList())
        );

        return new AiDtos.MatchResultResponse(
                bdOverall,
                bdSkill,
                bdExp,
                new ArrayList<>(matched),
                new ArrayList<>(missing),
                strengths,
                recommendations,
                fitSummary
        );
    }

    public AiDtos.InterviewPrepResponse generateInterviewPrep(String resumeText, String jobTitle, String jobDescription) {
        String title = jobTitle != null && !jobTitle.isBlank() ? jobTitle : "Software Engineer";
        List<AiDtos.InterviewQuestion> questions = new ArrayList<>();

        questions.add(new AiDtos.InterviewQuestion(
                "Technical Architecture",
                "How would you design a scalable, low-latency API in Spring Boot handling thousands of concurrent requests?",
                "Assesses microservice design, connection pooling (HikariCP), database indexing, and caching layers (Redis).",
                "Mention connection pool tuning, stateless JWT security, Redis read-through caching, and asynchronous task execution using @Async."
        ));

        questions.add(new AiDtos.InterviewQuestion(
                "Database & Concurrency",
                "How do you handle optimistic locking and avoid race conditions in PostgreSQL when multiple transactions update the same entity?",
                "Crucial for high-concurrency systems like job portals where counters and application states change rapidly.",
                "Discuss JPA @Version, SELECT ... FOR UPDATE, and database isolation levels (READ COMMITTED vs REPEATABLE READ)."
        ));

        questions.add(new AiDtos.InterviewQuestion(
                "AI & Vector Search",
                "Explain how vector embeddings and pgvector work for semantic similarity search compared to traditional full-text search.",
                "Directly targets the AI component of the HireAI platform.",
                "Explain embedding high-dimensional vectors, cosine similarity distance (<=> operator in pgvector), HNSW vs IVFFLAT indexing, and hybrid search."
        ));

        questions.add(new AiDtos.InterviewQuestion(
                "System Resiliency",
                "What strategies do you implement to ensure fault tolerance when third-party services (like OpenAI or S3) become unavailable?",
                "Evaluates production-readiness and defensive programming.",
                "Detail circuit breakers (Resilience4j), retries with exponential backoff, local filesystem fallbacks, and user-friendly degraded modes."
        ));

        questions.add(new AiDtos.InterviewQuestion(
                "Behavioral & Problem Solving",
                "Tell me about a time you had to diagnose and resolve a severe production bug or performance bottleneck under tight deadlines.",
                "Tests communication, analytical debugging, and composure under pressure.",
                "Use the STAR method (Situation, Task, Action, Result). Focus on log correlation with Request IDs, APM profiling, and root-cause fix."
        ));

        List<String> checklist = List.of(
                "Review core Java 21 features: Virtual Threads, Pattern Matching, Records, and Sealed Classes",
                "Be ready to explain your Spring Security filter chain and stateless JWT authentication design",
                "Practice explaining the tradeoff between pgvector HNSW indexing speed vs memory consumption",
                "Prepare 2-3 technical questions to ask the interviewer regarding their cloud infrastructure and release cycles"
        );

        return new AiDtos.InterviewPrepResponse(title, questions, checklist);
    }

    public AiDtos.ParseResumeResponse parseResume(String resumeText) {
        if (resumeText == null || resumeText.isBlank()) {
            return new AiDtos.ParseResumeResponse(
                    "Candidate", "", "", "Software Engineer",
                    List.of("Java", "Spring Boot", "SQL"),
                    BigDecimal.valueOf(2.0),
                    List.of("Resume text was empty or could not be parsed.")
            );
        }

        // Email extraction
        String email = "";
        Matcher emailMatcher = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}").matcher(resumeText);
        if (emailMatcher.find()) {
            email = emailMatcher.group();
        }

        // Phone extraction
        String phone = "";
        Matcher phoneMatcher = Pattern.compile("(\\+?\\d{1,3}[- .]?)?\\(?\\d{3}\\)?[- .]?\\d{3}[- .]?\\d{4}").matcher(resumeText);
        if (phoneMatcher.find()) {
            phone = phoneMatcher.group();
        }

        // Detect skills
        List<String> detected = new ArrayList<>();
        String lower = resumeText.toLowerCase();
        for (String skill : COMMON_TECH_SKILLS) {
            if (lower.contains(skill.toLowerCase())) {
                detected.add(skill);
            }
        }

        // Guess experience
        BigDecimal exp = BigDecimal.valueOf(3.0);
        if (lower.contains("10+ years") || lower.contains("senior architect")) {
            exp = BigDecimal.valueOf(10.0);
        } else if (lower.contains("5+ years") || lower.contains("lead")) {
            exp = BigDecimal.valueOf(6.0);
        } else if (lower.contains("student") || lower.contains("graduate") || lower.contains("intern")) {
            exp = BigDecimal.valueOf(1.0);
        }

        List<String> summary = List.of(
                "Extracted " + detected.size() + " technical competencies from resume text.",
                "Contact information recognized and indexed.",
                "Profile ready for automated match scoring against open job postings."
        );

        return new AiDtos.ParseResumeResponse(
                "Applicant", email, phone, "Full-Stack Software Engineer",
                detected, exp, summary
        );
    }
}
