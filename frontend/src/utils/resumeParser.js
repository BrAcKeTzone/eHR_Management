// Resume parsing utility functions
import * as pdfjsLib from "pdfjs-dist/webpack";

// Configure PDF.js worker - using webpack version for better compatibility
if (typeof window !== "undefined") {
  // Try multiple CDN sources for better reliability
  const workerSources = [
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`,
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
  ];

  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[0];

  // Log worker configuration for debugging
  console.log(
    "PDF.js worker configured:",
    pdfjsLib.GlobalWorkerOptions.workerSrc
  );
}

// Common patterns for extracting information
const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone:
    /(?:\+63|0)(?:9\d{9}|\d{2}-\d{3}-\d{4}|\d{3}-\d{3}-\d{4}|\(\d{3}\)\s?\d{3}-\d{4})/g,
  phoneGeneral: /[\+]?[\d\s\-\(\)]{10,}/g,
  name: /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/m,
  education:
    /(?:Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|M\.?A\.?|Ph\.?D\.?|Degree|Graduate|University|College)/gi,
  experience:
    /(?:experience|worked|teaching|instructor|professor|tutor|years?|months?)/gi,
  skills: /(?:skills?|proficient|expert|knowledge|familiar|experienced)/gi,
};

// Education keywords
const EDUCATION_KEYWORDS = [
  "Bachelor",
  "Master",
  "PhD",
  "Doctorate",
  "B.S.",
  "M.S.",
  "M.A.",
  "Ph.D.",
  "University",
  "College",
  "Institute",
  "School",
  "Education",
  "Degree",
  "Graduate",
  "Undergraduate",
  "Magna Cum Laude",
  "Summa Cum Laude",
  "Dean's List",
];

// Teaching-related keywords
const TEACHING_KEYWORDS = [
  "teacher",
  "teaching",
  "instructor",
  "professor",
  "tutor",
  "educator",
  "classroom",
  "student",
  "curriculum",
  "lesson",
  "pedagogy",
  "education",
  "school",
  "academy",
  "learning",
  "training",
];

// Subject specializations
const SUBJECT_SPECIALIZATIONS = {
  Mathematics: [
    "math",
    "mathematics",
    "algebra",
    "geometry",
    "calculus",
    "statistics",
    "arithmetic",
  ],
  Science: [
    "science",
    "biology",
    "chemistry",
    "physics",
    "laboratory",
    "experiment",
  ],
  English: [
    "english",
    "literature",
    "writing",
    "grammar",
    "composition",
    "reading",
  ],
  Filipino: ["filipino", "tagalog", "literature", "wika", "panitikan"],
  "Social Studies": [
    "history",
    "social studies",
    "geography",
    "civics",
    "government",
  ],
  "Physical Education": [
    "physical education",
    "PE",
    "sports",
    "fitness",
    "athletics",
    "health",
  ],
  Music: ["music", "musical", "piano", "guitar", "choir", "band", "singing"],
  Art: ["art", "drawing", "painting", "visual arts", "creative", "design"],
  "Special Education": [
    "special education",
    "special needs",
    "learning disabilities",
    "autism",
    "inclusive",
  ],
};

/**
 * Simplified PDF text extraction (fallback method)
 */
export const extractTextFromPDFSimple = async (file) => {
  try {
    console.log("Trying simplified PDF extraction...");
    // This is a very basic approach - just try to read the file as text
    const text = await file.text();
    return text;
  } catch (error) {
    console.error("Simplified extraction failed:", error);
    throw new Error(
      "Unable to extract text from this PDF file. Please try converting it to a text file."
    );
  }
};

/**
 * Extract text from PDF file
 */
export const extractTextFromPDF = async (file) => {
  try {
    console.log(
      "Starting PDF extraction for file:",
      file.name,
      "Size:",
      file.size
    );

    const arrayBuffer = await file.arrayBuffer();
    console.log("ArrayBuffer created, size:", arrayBuffer.byteLength);

    // Set a timeout for PDF loading
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0, // Reduce verbosity to minimize console output
    });

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("PDF loading timeout after 10 seconds")),
        10000
      );
    });

    const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
    console.log("PDF loaded successfully, pages:", pdf.numPages);

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${pdf.numPages}`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    console.log("PDF text extraction completed. Text length:", fullText.length);
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);

    // Provide more specific error messages
    if (error.message.includes("timeout")) {
      throw new Error(
        "PDF processing is taking too long. Please try a different file or format."
      );
    } else if (error.message.includes("Invalid PDF")) {
      throw new Error(
        "Invalid PDF file. Please ensure the file is not corrupted."
      );
    } else if (error.message.includes("worker")) {
      throw new Error(
        "PDF processing service unavailable. Please try again or use a text file."
      );
    } else {
      throw new Error(
        "Failed to extract text from PDF. Please try a different file format."
      );
    }
  }
};

/**
 * Extract text from text file
 */
export const extractTextFromTextFile = async (file) => {
  try {
    return await file.text();
  } catch (error) {
    console.error("Error reading text file:", error);
    throw new Error("Failed to read text file");
  }
};

/**
 * Extract name from resume text
 */
export const extractName = (text) => {
  // Try to find name in the first few lines
  const lines = text.split("\n").filter((line) => line.trim().length > 0);

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();

    // Skip common headers
    if (
      line.toLowerCase().includes("resume") ||
      line.toLowerCase().includes("curriculum vitae") ||
      line.toLowerCase().includes("cv")
    ) {
      continue;
    }

    // Look for name pattern (2-4 words, starting with capitals)
    const nameMatch = line.match(
      /^([A-Z][a-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+){1,2})$/
    );
    if (nameMatch) {
      const fullName = nameMatch[1];
      const nameParts = fullName.split(" ");

      if (nameParts.length >= 2) {
        return {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" "),
        };
      }
    }
  }

  return { firstName: "", lastName: "" };
};

/**
 * Extract email from resume text
 */
export const extractEmail = (text) => {
  const emailMatch = text.match(PATTERNS.email);
  return emailMatch ? emailMatch[0] : "";
};

/**
 * Extract phone number from resume text
 */
export const extractPhone = (text) => {
  // First try Philippine phone patterns
  const phoneMatch = text.match(PATTERNS.phone);
  if (phoneMatch) {
    return phoneMatch[0];
  }

  // Fallback to general phone patterns
  const generalPhoneMatch = text.match(PATTERNS.phoneGeneral);
  if (generalPhoneMatch) {
    // Clean up the phone number
    const cleaned = generalPhoneMatch[0].replace(/[\s\-\(\)]/g, "");
    if (cleaned.length >= 10) {
      return generalPhoneMatch[0];
    }
  }

  return "";
};

/**
 * Extract address from resume text
 */
export const extractAddress = (text) => {
  const lines = text.split("\n");

  // Look for address patterns (contains city/location keywords)
  const addressKeywords = [
    "city",
    "street",
    "avenue",
    "road",
    "district",
    "quezon",
    "manila",
    "makati",
    "pasig",
    "taguig",
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (
      addressKeywords.some((keyword) => lowerLine.includes(keyword)) &&
      line.length > 10 &&
      line.length < 100
    ) {
      return line.trim();
    }
  }

  return "";
};

/**
 * Extract educational background from resume text
 */
export const extractEducation = (text) => {
  const lines = text.split("\n");
  let educationSection = "";
  let inEducationSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if we're entering education section
    if (lowerLine.includes("education") || lowerLine.includes("academic")) {
      inEducationSection = true;
      continue;
    }

    // Check if we're leaving education section
    if (
      inEducationSection &&
      (lowerLine.includes("experience") ||
        lowerLine.includes("work") ||
        lowerLine.includes("employment"))
    ) {
      break;
    }

    // Collect education-related lines
    if (
      inEducationSection ||
      EDUCATION_KEYWORDS.some((keyword) =>
        lowerLine.includes(keyword.toLowerCase())
      )
    ) {
      if (line.trim().length > 0) {
        educationSection += line.trim() + ". ";
      }
    }
  }

  return educationSection.trim();
};

/**
 * Extract teaching experience from resume text
 */
export const extractTeachingExperience = (text) => {
  const lines = text.split("\n");
  let experienceSection = "";
  let inExperienceSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if we're entering experience section
    if (
      lowerLine.includes("experience") ||
      lowerLine.includes("work") ||
      lowerLine.includes("employment")
    ) {
      inExperienceSection = true;
      continue;
    }

    // Check if we're leaving experience section
    if (
      inExperienceSection &&
      (lowerLine.includes("education") ||
        lowerLine.includes("skills") ||
        lowerLine.includes("certification"))
    ) {
      break;
    }

    // Collect teaching-related experience
    if (
      inExperienceSection ||
      TEACHING_KEYWORDS.some((keyword) => lowerLine.includes(keyword))
    ) {
      if (line.trim().length > 0) {
        experienceSection += line.trim() + ". ";
      }
    }
  }

  return experienceSection.trim();
};

/**
 * Detect subject specialization from resume text
 */
export const detectSubjectSpecialization = (text) => {
  const lowerText = text.toLowerCase();

  for (const [subject, keywords] of Object.entries(SUBJECT_SPECIALIZATIONS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return subject;
      }
    }
  }

  return "";
};

/**
 * Detect program based on education and specialization
 */
export const detectProgram = (educationText, specialization) => {
  const lowerEducation = educationText.toLowerCase();

  // Elementary Education
  if (
    lowerEducation.includes("elementary") ||
    lowerEducation.includes("early childhood")
  ) {
    return "Elementary Education";
  }

  // Secondary Education with subject
  if (
    lowerEducation.includes("secondary") ||
    lowerEducation.includes("high school")
  ) {
    if (specialization) {
      return `Secondary Education - ${specialization}`;
    }
    return "Secondary Education - Mathematics"; // Default
  }

  // Subject-specific programs
  if (specialization === "Special Education") {
    return "Special Education";
  }

  if (specialization === "Physical Education") {
    return "Physical Education";
  }

  if (specialization === "Music") {
    return "Music Education";
  }

  if (specialization === "Art") {
    return "Art Education";
  }

  // Default based on specialization
  if (specialization) {
    return `Secondary Education - ${specialization}`;
  }

  return "Elementary Education"; // Ultimate fallback
};

/**
 * Main function to parse resume and extract all information
 */
export const parseResume = async (file) => {
  const startTime = Date.now();
  console.log("Starting resume parsing for:", file.name);

  try {
    let text = "";

    // Add overall timeout for the entire parsing process
    const parseTimeout = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Resume parsing timeout after 15 seconds")),
        15000
      );
    });

    const parseProcess = async () => {
      // Extract text based on file type
      if (file.type === "application/pdf") {
        console.log("Processing as PDF file");
        try {
          text = await extractTextFromPDF(file);
        } catch (pdfError) {
          console.warn(
            "Standard PDF extraction failed, trying fallback method:",
            pdfError.message
          );
          try {
            text = await extractTextFromPDFSimple(file);
            console.log("Fallback PDF extraction succeeded");
          } catch (fallbackError) {
            console.error("Both PDF extraction methods failed");
            throw new Error(
              "Unable to extract text from PDF. Please try converting to a text file or use a different PDF."
            );
          }
        }
      } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        console.log("Processing as text file");
        text = await extractTextFromTextFile(file);
      } else if (
        file.type.includes("text/") ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx")
      ) {
        console.log("Processing as text document");
        // For other text formats, try to read as text
        text = await extractTextFromTextFile(file);
      } else {
        throw new Error(
          "Unsupported file type. Please upload PDF or text files."
        );
      }

      if (!text || text.trim().length === 0) {
        throw new Error("No text content found in the uploaded file.");
      }

      console.log("Text extracted successfully, length:", text.length);
      console.log("Starting information extraction...");

      // Extract information
      const { firstName, lastName } = extractName(text);
      const email = extractEmail(text);
      const phone = extractPhone(text);
      const address = extractAddress(text);
      const education = extractEducation(text);
      const experience = extractTeachingExperience(text);
      const specialization = detectSubjectSpecialization(text);
      const program = detectProgram(education, specialization);

      return {
        firstName,
        lastName,
        email,
        phone,
        address,
        education,
        experience,
        specialization,
        program,
      };
    };

    const extractedData = await Promise.race([parseProcess(), parseTimeout]);
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      education,
      experience,
      specialization,
      program,
    } = extractedData;

    // Determine position based on program
    let position = "";
    if (program.includes("Elementary")) {
      position = "Elementary Teacher";
    } else if (program.includes("Mathematics")) {
      position = "Mathematics Teacher";
    } else if (program.includes("Science")) {
      position = "Science Teacher";
    } else if (program.includes("English")) {
      position = "English Teacher";
    } else if (program.includes("Filipino")) {
      position = "Filipino Teacher";
    } else if (program.includes("Social Studies")) {
      position = "Social Studies Teacher";
    } else if (program.includes("Physical Education")) {
      position = "Physical Education Teacher";
    } else if (program.includes("Music")) {
      position = "Music Teacher";
    } else if (program.includes("Art")) {
      position = "Art Teacher";
    } else if (program.includes("Special Education")) {
      position = "Special Education Teacher";
    } else {
      position = "Elementary Teacher"; // Default
    }

    return {
      success: true,
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        program,
        position,
        subjectSpecialization: specialization,
        educationalBackground: education,
        teachingExperience: experience,
      },
      message: "Resume parsed successfully!",
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    return {
      success: false,
      data: null,
      message:
        error.message ||
        "Failed to parse resume. Please fill in the form manually.",
    };
  }
};
