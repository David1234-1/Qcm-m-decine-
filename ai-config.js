// Configuration IA pour StudyHub
window.AIConfig = {
  // Configuration OpenAI
  openai: {
    // Clé API OpenAI (à remplacer par votre clé)
    apiKey: null, // localStorage.getItem('openai_api_key') || process.env.OPENAI_API_KEY
    
    // Modèle à utiliser
    model: 'gpt-3.5-turbo',
    
    // Paramètres de génération
    maxTokens: 1500,
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
    
    // URL de l'API
    baseURL: 'https://api.openai.com/v1'
  },
  
  // Configuration des prompts
  prompts: {
    // Prompt système pour l'assistant
    systemPrompt: `Tu es StudyHub, un assistant pédagogique intelligent spécialisé dans l'aide aux étudiants français.

MISSION : Aider les étudiants à mieux comprendre et réviser leurs cours.

RÈGLES IMPORTANTES :
1. Réponds TOUJOURS en français
2. Sois pédagogique, clair et précis
3. Adapte tes réponses au niveau de l'étudiant
4. Utilise des exemples concrets quand c'est possible
5. Structure tes réponses de manière logique
6. Si tu génères du JSON, respecte strictement le format demandé
7. Sois encourageant et motivant

CONTEXTE : Tu as accès aux documents de cours de l'étudiant pour donner des réponses personnalisées.`,
    
    // Prompts pour la génération de contenu
    qcmPrompt: `Génère {count} questions de QCM de qualité basées sur ce contenu de cours.

REQUIS :
- Questions variées : définitions, applications pratiques, calculs, concepts théoriques
- 4 réponses possibles par question (A, B, C, D)
- Une seule réponse correcte
- Explication détaillée de la réponse correcte
- Niveau de difficulté (easy, medium, hard)

FORMAT JSON STRICT :
{
  "questions": [
    {
      "question": "Question claire et précise",
      "answers": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
      "correctAnswer": 0,
      "explanation": "Explication pédagogique détaillée",
      "difficulty": "easy"
    }
  ]
}

CONTENU DU COURS :
{content}

IMPORTANT : Respecte exactement le format JSON demandé.`,
    
    flashcardPrompt: `Génère {count} flashcards de qualité basées sur ce contenu de cours.

REQUIS :
- Couvrir les concepts clés, définitions importantes, formules, théorèmes
- Questions claires et précises
- Réponses détaillées et pédagogiques
- Catégorisation (definition, formula, concept, application)

FORMAT JSON STRICT :
{
  "flashcards": [
    {
      "question": "Question claire et précise",
      "answer": "Réponse détaillée et pédagogique avec exemples si possible",
      "category": "definition"
    }
  ]
}

CONTENU DU COURS :
{content}

IMPORTANT : Respecte exactement le format JSON demandé.`,
    
    summaryPrompt: `Génère un résumé clair et structuré de ce contenu de cours.

REQUIS :
- Points clés principaux mis en évidence
- Concepts importants expliqués
- Structure logique et organisée
- Maximum 400 mots
- Style pédagogique et accessible

STRUCTURE SUGGÉRÉE :
1. Introduction générale
2. Points clés principaux
3. Concepts importants
4. Applications pratiques
5. Conclusion

CONTENU DU COURS :
{content}

IMPORTANT : Sois précis, pédagogique et structuré.`,
    
    analysisPrompt: `Analyse ce contenu de cours et fournis une analyse détaillée.

REQUIS :
- Sujet principal identifié
- Concepts clés extraits
- Niveau de difficulté estimé
- Mots-clés importants
- Structure du contenu

FORMAT JSON STRICT :
{
  "subject": "Sujet principal",
  "mainConcepts": ["Concept 1", "Concept 2", "Concept 3"],
  "difficulty": "beginner|intermediate|advanced",
  "keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3"],
  "structure": "Description de la structure",
  "estimatedTime": "Temps estimé de révision en minutes"
}

CONTENU :
{content}

IMPORTANT : Respecte exactement le format JSON demandé.`,
    
    studyPlanPrompt: `Génère un plan d'étude personnalisé basé sur ce contenu.

REQUIS :
- Plan structuré par sessions
- Objectifs d'apprentissage clairs
- Méthodes de révision recommandées
- Durée estimée par session

FORMAT JSON STRICT :
{
  "plan": [
    {
      "session": 1,
      "title": "Titre de la session",
      "objectives": ["Objectif 1", "Objectif 2"],
      "methods": ["Méthode 1", "Méthode 2"],
      "duration": 15,
      "focus": "Description du focus"
    }
  ],
  "totalTime": {studyTime},
  "recommendations": ["Recommandation 1", "Recommandation 2"]
}

CONTENU :
{content}

TEMPS DISPONIBLE : {studyTime} minutes

IMPORTANT : Respecte exactement le format JSON demandé.`
  },
  
  // Configuration des limites
  limits: {
    maxContentLength: 4000, // Longueur maximale du contenu à analyser
    maxQCMQuestions: 50,
    maxFlashcards: 100,
    maxSummaryLength: 400,
    maxStudyTime: 120 // minutes
  },
  
  // Configuration des fallbacks
  fallbacks: {
    enableMockContent: true,
    mockQuality: 'high', // 'low', 'medium', 'high'
    useLocalProcessing: true
  },
  
  // Configuration des erreurs
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000, // ms
    showUserErrors: true,
    logErrors: true
  }
};

// Méthodes utilitaires pour la configuration IA
window.AIUtils = {
  // Remplacer les placeholders dans les prompts
  formatPrompt(template, variables) {
    let prompt = template;
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return prompt;
  },
  
  // Valider une réponse JSON
  validateJSON(response, expectedStructure) {
    try {
      const json = JSON.parse(response);
      return this.validateStructure(json, expectedStructure);
    } catch (error) {
      console.warn('Réponse JSON invalide:', error);
      return false;
    }
  },
  
  // Valider la structure d'un objet
  validateStructure(obj, structure) {
    for (const [key, type] of Object.entries(structure)) {
      if (!(key in obj)) return false;
      if (type === 'array' && !Array.isArray(obj[key])) return false;
      if (type === 'string' && typeof obj[key] !== 'string') return false;
      if (type === 'number' && typeof obj[key] !== 'number') return false;
    }
    return true;
  },
  
  // Extraire JSON d'une réponse
  extractJSON(response) {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.warn('Impossible de parser le JSON extrait:', error);
      }
    }
    return null;
  },
  
  // Gérer les erreurs IA
  handleAIError(error, context = '') {
    console.error(`Erreur IA ${context}:`, error);
    
    if (window.AIConfig.errorHandling.logErrors) {
      // Log l'erreur pour analyse
      const errorLog = {
        timestamp: new Date().toISOString(),
        context: context,
        error: error.message,
        stack: error.stack
      };
      
      const errorLogs = JSON.parse(localStorage.getItem('ai_error_logs') || '[]');
      errorLogs.push(errorLog);
      localStorage.setItem('ai_error_logs', JSON.stringify(errorLogs.slice(-50))); // Garder les 50 dernières erreurs
    }
    
    if (window.AIConfig.errorHandling.showUserErrors) {
      NotificationManager.show(`Erreur IA: ${error.message}`, 'error');
    }
  }
};