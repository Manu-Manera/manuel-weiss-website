import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Heading,
  Progress,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Container,
  Flex,
  Spacer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Checkbox,
  Tooltip,
  useClipboard,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';

// Echte CoverLetterGPT Integration basierend auf dem Original
class CoverLetterGPTReal {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://api.openai.com/v1';
    this.workflowData = {
      company: '',
      position: '',
      jobDescription: '',
      analysis: null,
      userSkills: '',
      matchingScore: 0,
      coverLetter: '',
      cvContent: '',
      interviewQuestions: [],
      salaryStrategy: ''
    };
    this.init();
  }
  
  async init() {
    console.log('🚀 CoverLetterGPT Real Integration initialisiert');
    this.apiKey = await this.loadAPIKey();
  }
  
  async loadAPIKey() {
    const sources = [
      () => localStorage.getItem('openai_api_key'),
      () => sessionStorage.getItem('openai_api_key'),
      () => window.OPENAI_API_KEY,
      () => this.getAPIKeyFromAdminPanel()
    ];
    
    for (const source of sources) {
      try {
        const key = await source();
        if (key && key.startsWith('sk-')) {
          console.log('✅ OpenAI API Key gefunden');
          return key;
        }
      } catch (e) {
        // Ignoriere Fehler
      }
    }
    
    console.warn('⚠️ OpenAI API Key nicht gefunden');
    return null;
  }
  
  async getAPIKeyFromAdminPanel() {
    try {
      const response = await fetch('/api/admin/openai-key', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.apiKey && data.apiKey.startsWith('sk-')) {
          localStorage.setItem('openai_api_key', data.apiKey);
          return data.apiKey;
        }
      }
    } catch (error) {
      console.warn('Admin Panel API Key nicht verfügbar:', error);
    }
    return null;
  }
  
  async analyzeJob(company, position, description) {
    if (!this.apiKey) {
      throw new Error('OpenAI API Key nicht konfiguriert');
    }
    
    const prompt = `
      Analysiere die folgende Stellenausschreibung und extrahiere strukturierte Informationen:
      
      Stelle: ${position}
      Unternehmen: ${company}
      Beschreibung: ${description}
      
      Extrahiere folgende Informationen:
      1. Hauptanforderungen (mindestens 5 konkrete Anforderungen)
      2. Schlüsselwörter (mindestens 10 relevante Keywords)
      3. Gewünschte Soft Skills (Kommunikation, Teamarbeit, etc.)
      4. Technische Anforderungen (Programmiersprachen, Tools, etc.)
      5. Erfahrungslevel (Junior, Mid-Level, Senior, etc.)
      6. Branche/Typ (IT, Marketing, Finance, etc.)
      
      Antworte im JSON-Format mit detaillierter Analyse.
    `;
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Bewerbungen und Karriereberatung. Analysiere Stellenausschreibungen präzise und strukturiert.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API Fehler: ${response.status}`);
    }
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
  
  async calculateMatching(userSkills, jobRequirements) {
    if (!this.apiKey) {
      return this.calculateBasicMatching(userSkills, jobRequirements);
    }
    
    const prompt = `
      Berechne einen Matching-Score zwischen den Benutzer-Skills und den Job-Anforderungen:
      
      Benutzer-Skills: ${userSkills}
      Job-Anforderungen: ${JSON.stringify(jobRequirements)}
      
      Berechne einen Score von 0-100% und gib eine detaillierte Analyse zurück.
      
      Antworte im JSON-Format:
      {
        "score": 85,
        "matchedSkills": ["Skill 1", "Skill 2"],
        "missingSkills": ["Fehlender Skill 1", "Fehlender Skill 2"],
        "recommendations": ["Empfehlung 1", "Empfehlung 2"],
        "analysis": "Detaillierte Analyse des Matchings"
      }
    `;
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Bewerbungen und Karriereberatung.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API Fehler: ${response.status}`);
    }
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
  
  async generateCoverLetter(company, position, jobDescription, userSkills, analysis) {
    if (!this.apiKey) {
      return this.generateBasicCoverLetter(company, position);
    }
    
    const prompt = `
      Erstelle ein professionelles, personalisiertes Anschreiben für:
      
      Unternehmen: ${company}
      Position: ${position}
      Stellenausschreibung: ${jobDescription}
      Benutzer-Skills: ${userSkills}
      Job-Analyse: ${JSON.stringify(analysis)}
      
      Das Anschreiben soll:
      - Professionell und überzeugend sein
      - Spezifisch auf die Stelle eingehen
      - Die relevanten Skills des Bewerbers hervorheben
      - Eine klare Struktur haben (Anrede, Einleitung, Hauptteil, Schluss)
      - Maximal 300 Wörter lang sein
      - Auf Deutsch verfasst sein
      
      Erstelle ein vollständiges Anschreiben:
    `;
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Bewerbungen und Karriereberatung. Erstelle professionelle, überzeugende Bewerbungsunterlagen.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API Fehler: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async optimizeCV(cvContent, jobRequirements) {
    if (!this.apiKey) {
      return cvContent;
    }
    
    const prompt = `
      Optimiere den folgenden Lebenslauf für die Stellenanforderungen:
      
      Lebenslauf:
      ${cvContent}
      
      Job-Anforderungen:
      ${JSON.stringify(jobRequirements)}
      
      Optimiere:
      1. Schlüsselwörter für ATS-Systeme
      2. Struktur und Formatierung
      3. Relevante Erfahrungen hervorheben
      4. Fehlende wichtige Punkte ergänzen
      
      Gib den optimierten Lebenslauf zurück:
    `;
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Bewerbungen und Karriereberatung.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API Fehler: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async generateInterviewQuestions(position, company, jobDescription) {
    if (!this.apiKey) {
      return [
        "Erzählen Sie mir von sich selbst.",
        "Warum interessieren Sie sich für diese Position?",
        "Was sind Ihre größten Stärken?",
        "Wo sehen Sie sich in 5 Jahren?",
        "Haben Sie Fragen an uns?"
      ];
    }
    
    const prompt = `
      Generiere 5 typische Interviewfragen für die Position "${position}" bei der Firma "${company}" basierend auf der Jobbeschreibung: ${jobDescription}.
    `;
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Bewerbungen und Karriereberatung.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API Fehler: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.split('\n').filter(q => q.trim());
  }
  
  calculateBasicMatching(userSkills, jobRequirements) {
    const userSkillsArray = userSkills.toLowerCase().split(',').map(s => s.trim());
    const requirementsArray = jobRequirements.requirements || [];
    
    let matches = 0;
    const matchedSkills = [];
    
    requirementsArray.forEach(req => {
      const reqLower = req.toLowerCase();
      userSkillsArray.forEach(skill => {
        if (reqLower.includes(skill) || skill.includes(reqLower)) {
          matches++;
          matchedSkills.push(skill);
        }
      });
    });
    
    const score = Math.min(100, Math.round((matches / requirementsArray.length) * 100));
    
    return {
      score: score,
      matchedSkills: matchedSkills,
      missingSkills: requirementsArray.filter(req => 
        !userSkillsArray.some(skill => 
          req.toLowerCase().includes(skill) || skill.includes(req.toLowerCase())
        )
      ),
      recommendations: ['Weitere relevante Skills erwerben', 'Erfahrung in fehlenden Bereichen sammeln'],
      analysis: `Grundlegende Matching-Analyse: ${score}% Übereinstimmung`
    };
  }
  
  generateBasicCoverLetter(company, position) {
    return `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenausschreibung für die Position "${position}" bei ${company} gelesen. Als erfahrener [Ihr Beruf] bin ich überzeugt, dass ich eine wertvolle Bereicherung für Ihr Team darstellen kann.

Meine Expertise in [relevanten Bereichen] und meine Leidenschaft für [relevantes Thema] machen mich zum idealen Kandidaten für diese Position. In meiner bisherigen Laufbahn konnte ich bereits [konkrete Erfolge] erzielen und bin bestrebt, diese Erfahrungen bei ${company} weiter auszubauen.

Ich freue mich auf die Möglichkeit, in einem persönlichen Gespräch mehr über die Position und Ihre Erwartungen zu erfahren.

Mit freundlichen Grüßen
[Ihr Name]`;
  }
}

// React Component für CoverLetterGPT
const CoverLetterGPTComponent = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowData, setWorkflowData] = useState({
    company: '',
    position: '',
    jobDescription: '',
    analysis: null,
    userSkills: '',
    matchingScore: 0,
    coverLetter: '',
    cvContent: '',
    interviewQuestions: [],
    salaryStrategy: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coverLetterGPT, setCoverLetterGPT] = useState(null);
  const { hasCopied, onCopy } = useClipboard(workflowData.coverLetter);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const steps = [
    "Job Description Input",
    "AI Analysis & Skill Matching", 
    "Cover Letter Generation",
    "CV Optimization & Interview Prep",
    "Review & Export"
  ];

  useEffect(() => {
    // Initialize CoverLetterGPT
    const gpt = new CoverLetterGPTReal();
    setCoverLetterGPT(gpt);
  }, []);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorkflowData((prev) => ({ ...prev, [name]: value }));
  };

  const analyzeJob = async () => {
    if (!coverLetterGPT) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const analysis = await coverLetterGPT.analyzeJob(
        workflowData.company,
        workflowData.position,
        workflowData.jobDescription
      );
      
      setWorkflowData((prev) => ({ ...prev, analysis }));
      toast({
        title: "Job Analysis Complete",
        description: "AI has analyzed the job description successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      nextStep();
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMatching = async () => {
    if (!coverLetterGPT) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const matching = await coverLetterGPT.calculateMatching(
        workflowData.userSkills,
        workflowData.analysis
      );
      
      setWorkflowData((prev) => ({ ...prev, matchingScore: matching.score }));
      toast({
        title: "Matching Complete",
        description: `Matching score: ${matching.score}%`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCoverLetter = async () => {
    if (!coverLetterGPT) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const coverLetter = await coverLetterGPT.generateCoverLetter(
        workflowData.company,
        workflowData.position,
        workflowData.jobDescription,
        workflowData.userSkills,
        workflowData.analysis
      );
      
      setWorkflowData((prev) => ({ ...prev, coverLetter }));
      toast({
        title: "Cover Letter Generated",
        description: "AI has generated your personalized cover letter.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      nextStep();
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeCV = async () => {
    if (!coverLetterGPT) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const optimizedCV = await coverLetterGPT.optimizeCV(
        workflowData.cvContent,
        workflowData.analysis
      );
      
      setWorkflowData((prev) => ({ ...prev, cvContent: optimizedCV }));
      toast({
        title: "CV Optimized",
        description: "Your CV has been optimized for ATS systems.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateInterviewQuestions = async () => {
    if (!coverLetterGPT) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const questions = await coverLetterGPT.generateInterviewQuestions(
        workflowData.position,
        workflowData.company,
        workflowData.jobDescription
      );
      
      setWorkflowData((prev) => ({ ...prev, interviewQuestions: questions }));
      toast({
        title: "Interview Questions Generated",
        description: "AI has generated interview questions for you.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <VStack spacing={4}>
            <Heading size="md">Job Description Input</Heading>
            <Input
              placeholder="Company Name"
              name="company"
              value={workflowData.company}
              onChange={handleInputChange}
            />
            <Input
              placeholder="Position"
              name="position"
              value={workflowData.position}
              onChange={handleInputChange}
            />
            <Textarea
              placeholder="Paste Job Description here..."
              name="jobDescription"
              value={workflowData.jobDescription}
              onChange={handleInputChange}
              size="lg"
              height="200px"
            />
            <Button colorScheme="purple" onClick={analyzeJob} isLoading={isLoading}>
              Analyze Job Description
            </Button>
          </VStack>
        );
      case 1:
        return (
          <VStack spacing={4}>
            <Heading size="md">AI Analysis & Skill Matching</Heading>
            {workflowData.analysis ? (
              <Box p={4} borderWidth="1px" borderRadius="lg" width="100%">
                <Text fontWeight="bold">AI Analysis:</Text>
                <pre>{JSON.stringify(workflowData.analysis, null, 2)}</pre>
                <Text fontWeight="bold" mt={4}>Matching Score: {workflowData.matchingScore}%</Text>
              </Box>
            ) : (
              <Text>No AI analysis performed yet.</Text>
            )}
            <Input
              placeholder="Your Skills (comma-separated)"
              name="userSkills"
              value={workflowData.userSkills}
              onChange={handleInputChange}
            />
            <Button colorScheme="purple" onClick={calculateMatching} isLoading={isLoading}>
              Calculate Matching
            </Button>
            <Button colorScheme="purple" onClick={generateCoverLetter} isLoading={isLoading}>
              Generate Cover Letter
            </Button>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={4}>
            <Heading size="md">Cover Letter Generation</Heading>
            <Textarea
              placeholder="Generated Cover Letter"
              name="coverLetter"
              value={workflowData.coverLetter}
              onChange={handleInputChange}
              size="lg"
              height="300px"
            />
            <HStack>
              <Button colorScheme="green" onClick={onCopy}>
                {hasCopied ? "Copied!" : "Copy to Clipboard"}
              </Button>
              <Button colorScheme="purple" onClick={nextStep}>
                Next: Optimize CV & Interview Prep
              </Button>
            </HStack>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={4}>
            <Heading size="md">CV Optimization & Interview Prep</Heading>
            <Textarea
              placeholder="Paste your CV content here for optimization..."
              name="cvContent"
              value={workflowData.cvContent}
              onChange={handleInputChange}
              size="lg"
              height="200px"
            />
            <HStack>
              <Button colorScheme="purple" onClick={optimizeCV} isLoading={isLoading}>
                Optimize CV
              </Button>
              <Button colorScheme="purple" onClick={generateInterviewQuestions} isLoading={isLoading}>
                Generate Interview Questions
              </Button>
            </HStack>
            {workflowData.interviewQuestions.length > 0 && (
              <Box p={4} borderWidth="1px" borderRadius="lg" width="100%">
                <Text fontWeight="bold">Generated Interview Questions:</Text>
                <VStack align="start">
                  {workflowData.interviewQuestions.map((q, i) => (
                    <Text key={i}>- {q}</Text>
                  ))}
                </VStack>
              </Box>
            )}
            <Button colorScheme="purple" onClick={nextStep}>
              Next: Review & Export
            </Button>
          </VStack>
        );
      case 4:
        return (
          <VStack spacing={4}>
            <Heading size="md">Review & Export</Heading>
            <Text>Review your generated documents and prepare for export.</Text>
            <HStack>
              <Button colorScheme="green">Export PDF</Button>
              <Button colorScheme="green">Export DOCX</Button>
            </HStack>
            <Button colorScheme="blue" onClick={() => alert('Workflow Completed!')}>
              Complete Workflow
            </Button>
          </VStack>
        );
      default:
        return <Text>Unknown Step</Text>;
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg" bg="white">
        <Heading as="h2" size="xl" mb={6} textAlign="center" color="purple.600">
          CoverLetterGPT Workflow
        </Heading>
        <Progress value={(currentStep / (steps.length - 1)) * 100} mb={6} colorScheme="purple" />
        <Text fontSize="lg" mb={6} textAlign="center">
          Step {currentStep + 1}: {steps[currentStep]}
        </Text>

        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {renderStepContent()}

        <Flex mt={8}>
          <Button onClick={prevStep} isDisabled={currentStep === 0} colorScheme="gray">
            Previous
          </Button>
          <Spacer />
          {currentStep < steps.length - 1 && currentStep !== 0 && (
            <Button onClick={nextStep} colorScheme="purple" isDisabled={isLoading}>
              Next
            </Button>
          )}
        </Flex>
      </Box>
    </Container>
  );
};

export default CoverLetterGPTComponent;
