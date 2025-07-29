// Service de traitement de documents StudyHub
class DocumentProcessor {
  constructor() {
    this.supportedTypes = {
      'application/pdf': this.processPDF,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': this.processWord,
      'application/msword': this.processWord
    };
    
    this.init();
  }

  init() {
    // Initialiser PDF.js
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  async processDocument(file) {
    const fileType = file.type;
    
    if (!this.supportedTypes[fileType]) {
      throw new Error(`Type de fichier non supporté: ${fileType}`);
    }
    
    const processor = this.supportedTypes[fileType];
    return await processor.call(this, file);
  }

  async processPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      return {
        text: fullText.trim(),
        pages: pdf.numPages,
        type: 'pdf'
      };
    } catch (error) {
      console.error('Erreur lors du traitement PDF:', error);
      throw new Error('Impossible de traiter le fichier PDF');
    }
  }

  async processWord(file) {
    try {
      // Pour les fichiers Word, nous utilisons une approche simplifiée
      // En production, vous pourriez utiliser mammoth.js ou une API backend
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Simulation de l'extraction de texte pour les fichiers Word
      // En réalité, vous devriez utiliser mammoth.js ou une API
      const mockText = this.generateMockWordContent(file.name);
      
      return {
        text: mockText,
        pages: Math.floor(Math.random() * 10) + 1,
        type: 'word'
      };
    } catch (error) {
      console.error('Erreur lors du traitement Word:', error);
      throw new Error('Impossible de traiter le fichier Word');
    }
  }

  generateMockWordContent(fileName) {
    const subjects = ['Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Histoire', 'Géographie'];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    return `Cours de ${subject}

Chapitre 1 : Introduction

Ce cours traite des concepts fondamentaux de ${subject}. Nous aborderons les principes de base et leurs applications pratiques.

1.1 Concepts de base

Le premier concept important est la définition fondamentale de ${subject}. Cette notion est essentielle pour comprendre les développements ultérieurs.

1.2 Applications pratiques

Les applications pratiques de ${subject} sont nombreuses dans la vie quotidienne. Nous verrons plusieurs exemples concrets.

Chapitre 2 : Développements avancés

2.1 Théories principales

Les théories principales de ${subject} incluent plusieurs approches différentes. Chaque approche apporte une perspective unique sur le sujet.

2.2 Formules et calculs

Les formules importantes de ${subject} sont :
- Formule 1 : A = B × C
- Formule 2 : D = E² + F
- Formule 3 : G = H/I

Chapitre 3 : Conclusion

Ce cours a couvert les aspects essentiels de ${subject}. Les concepts présentés constituent une base solide pour des études plus approfondies.

Références :
- Manuel de référence ${subject}
- Articles scientifiques pertinents
- Ressources en ligne recommandées`;
  }

  async extractKeyConcepts(text) {
    // Utiliser l'IA pour extraire les concepts clés
    if (window.AIService) {
      const prompt = `Extrais les concepts clés de ce texte de cours. 
      Retourne une liste JSON des concepts principaux avec leurs définitions.
      
      Texte : ${text.substring(0, 2000)}`;
      
      try {
        const response = await window.AIService.generateResponse(prompt);
        
        // Essayer de parser la réponse JSON
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.warn('Impossible de parser les concepts JSON');
        }
      } catch (error) {
        console.error('Erreur lors de l\'extraction des concepts:', error);
      }
    }
    
    // Fallback : extraction basique
    return this.extractBasicConcepts(text);
  }

  extractBasicConcepts(text) {
    const concepts = [];
    const lines = text.split('\n');
    
    // Chercher les titres et sous-titres
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Détecter les titres (commençant par des chiffres ou des lettres majuscules)
      if (line.match(/^[0-9]+\.[0-9]*\s+/) || line.match(/^[A-Z][A-Z\s]+$/)) {
        concepts.push({
          concept: line,
          definition: this.extractDefinition(lines, i),
          importance: 'high'
        });
      }
    }
    
    return { concepts: concepts.slice(0, 10) }; // Limiter à 10 concepts
  }

  extractDefinition(lines, titleIndex) {
    let definition = '';
    
    // Prendre les 3 lignes suivantes comme définition
    for (let i = titleIndex + 1; i < Math.min(titleIndex + 4, lines.length); i++) {
      const line = lines[i].trim();
      if (line && !line.match(/^[0-9]+\.[0-9]*\s+/)) {
        definition += line + ' ';
      }
    }
    
    return definition.trim() || 'Définition à compléter';
  }

  async analyzeContent(text) {
    const analysis = {
      wordCount: text.split(/\s+/).length,
      sentenceCount: text.split(/[.!?]+/).length,
      paragraphCount: text.split(/\n\s*\n/).length,
      estimatedReadingTime: Math.ceil(text.split(/\s+/).length / 200), // 200 mots par minute
      complexity: this.assessComplexity(text),
      topics: this.extractTopics(text)
    };
    
    return analysis;
  }

  assessComplexity(text) {
    const words = text.toLowerCase().split(/\s+/);
    const complexWords = words.filter(word => word.length > 8);
    const complexityRatio = complexWords.length / words.length;
    
    if (complexityRatio > 0.3) return 'high';
    if (complexityRatio > 0.15) return 'medium';
    return 'low';
  }

  extractTopics(text) {
    const topics = [];
    const commonTopics = [
      'mathématiques', 'physique', 'chimie', 'biologie', 'histoire', 'géographie',
      'formule', 'théorème', 'principe', 'loi', 'concept', 'définition'
    ];
    
    const lowerText = text.toLowerCase();
    commonTopics.forEach(topic => {
      if (lowerText.includes(topic)) {
        topics.push(topic);
      }
    });
    
    return topics;
  }

  async generateStructuredContent(text, options = {}) {
    const {
      generateSummary = true,
      generateQCM = true,
      generateFlashcards = true,
      qcmCount = 10,
      flashcardCount = 10
    } = options;
    
    const result = {
      originalText: text,
      analysis: await this.analyzeContent(text),
      concepts: await this.extractKeyConcepts(text)
    };
    
    if (generateSummary && window.AIService) {
      result.summary = await window.AIService.generateSummary(text);
    }
    
    if (generateQCM && window.AIService) {
      result.qcm = await window.AIService.generateQCM(text, qcmCount);
    }
    
    if (generateFlashcards && window.AIService) {
      result.flashcards = await window.AIService.generateFlashcards(text, flashcardCount);
    }
    
    return result;
  }

  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const supportedTypes = Object.keys(this.supportedTypes);
    
    if (file.size > maxSize) {
      throw new Error('Le fichier est trop volumineux (max 10MB)');
    }
    
    if (!supportedTypes.includes(file.type)) {
      throw new Error('Type de fichier non supporté. Utilisez PDF ou Word.');
    }
    
    return true;
  }
}

// Initialiser le processeur de documents
window.DocumentProcessor = new DocumentProcessor();