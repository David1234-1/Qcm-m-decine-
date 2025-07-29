// Service IA pour StudyHub
class AIService {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://api.openai.com/v1';
    this.model = 'gpt-3.5-turbo';
    this.maxTokens = 1000;
    
    this.init();
  }

  init() {
    // Essayer de récupérer la clé API depuis la configuration, localStorage ou les variables d'environnement
    this.apiKey = window.StudyHubConfig?.ai?.openaiApiKey || 
                  localStorage.getItem('openai_api_key') || 
                  process.env.OPENAI_API_KEY;
    
    // Utiliser la configuration pour les paramètres IA
    if (window.StudyHubConfig?.ai) {
      this.model = window.StudyHubConfig.ai.model || this.model;
      this.maxTokens = window.StudyHubConfig.ai.maxTokens || this.maxTokens;
    }
    
    if (!this.apiKey) {
      console.warn('Clé API OpenAI non trouvée. L\'IA fonctionnera en mode simulation.');
    }
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  async generateResponse(prompt, context = null) {
    if (!this.apiKey) {
      return this.generateMockResponse(prompt, context);
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: this.buildMessages(prompt, context),
          max_tokens: this.maxTokens,
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur API: ${response.status} - ${errorData.error?.message || 'Erreur inconnue'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erreur lors de la génération de réponse IA:', error);
      return this.generateMockResponse(prompt, context);
    }
  }

  buildMessages(prompt, context) {
    const messages = [
      {
        role: 'system',
        content: `Tu es StudyHub, un assistant pédagogique intelligent spécialisé dans l'aide aux étudiants français.

MISSION : Aider les étudiants à mieux comprendre et réviser leurs cours.

RÈGLES IMPORTANTES :
1. Réponds TOUJOURS en français
2. Sois pédagogique, clair et précis
3. Adapte tes réponses au niveau de l'étudiant
4. Utilise des exemples concrets quand c'est possible
5. Structure tes réponses de manière logique
6. Si tu génères du JSON, respecte strictement le format demandé
7. Sois encourageant et motivant

CONTEXTE : Tu as accès aux documents de cours de l'étudiant pour donner des réponses personnalisées.`
      }
    ];

    if (context) {
      messages.push({
        role: 'system',
        content: `CONTEXTE DU COURS ACTUEL :
${typeof context === 'string' ? context : JSON.stringify(context, null, 2)}

Utilise ce contexte pour donner des réponses précises et pertinentes.`
      });
    }

    messages.push({
      role: 'user',
      content: prompt
    });

    return messages;
  }

  generateMockResponse(prompt, context) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Réponses contextuelles basées sur le contenu
    if (context && context.subject) {
      if (lowerPrompt.includes('concept') || lowerPrompt.includes('princip')) {
        return `Voici les **concepts principaux** de ${context.subject.name} :

• **Concept 1** : Définition et explication détaillée
• **Concept 2** : Autre notion importante à maîtriser
• **Concept 3** : Point clé pour la compréhension

Ces concepts sont essentiels pour bien comprendre la matière. Je recommande de les revoir régulièrement !`;
      }
      
      if (lowerPrompt.includes('formule') || lowerPrompt.includes('calcul')) {
        return `Voici les **formules importantes** à retenir pour ${context.subject.name} :

• **Formule 1** : A = B × C (explication de son utilisation)
• **Formule 2** : D = E² + F (quand l'utiliser)
• **Formule 3** : G = H/I (cas d'application)

N'oubliez pas de bien comprendre quand et comment utiliser chaque formule !`;
      }
      
      if (lowerPrompt.includes('exemple') || lowerPrompt.includes('pratique')) {
        return `Voici quelques **exemples pratiques** pour ${context.subject.name} :

• **Exemple 1** : Application concrète du concept principal dans une situation réelle
• **Exemple 2** : Cas d'usage typique dans la pratique professionnelle
• **Exemple 3** : Situation où ces connaissances sont particulièrement utiles

Ces exemples vous aideront à mieux comprendre l'application pratique des concepts théoriques.`;
      }
    }

    // Réponses générales
    if (lowerPrompt.includes('aide') || lowerPrompt.includes('comment')) {
      return `Je suis là pour vous aider dans vos études ! Voici quelques conseils :

• **Révisez régulièrement** : La répétition espacée est plus efficace
• **Posez des questions** : N'hésitez pas à demander des clarifications
• **Pratiquez** : Faites des exercices et des QCM pour tester vos connaissances
• **Organisez-vous** : Utilisez les flashcards et résumés pour structurer vos révisions

Que souhaitez-vous approfondir ?`;
    }

    if (lowerPrompt.includes('difficile') || lowerPrompt.includes('compliqué')) {
      return `Je comprends que certains points peuvent sembler difficiles. Voici mes conseils :

• **Décomposez** : Divisez les concepts complexes en parties plus simples
• **Cherchez des exemples** : Les cas concrets aident à la compréhension
• **Pratiquez** : L'entraînement rend tout plus facile
• **Demandez de l'aide** : N'hésitez pas à poser des questions spécifiques

Sur quel point particulier avez-vous des difficultés ?`;
    }

    // Réponse par défaut
    return `Merci pour votre question ! Je suis votre assistant pédagogique et je suis là pour vous aider dans vos études.

Pour vous donner une réponse plus précise et personnalisée, pourriez-vous :
• Me donner plus de détails sur votre question ?
• Me préciser le contexte de votre cours ?
• Me dire sur quelle matière vous travaillez ?

Je peux vous aider avec les concepts, les formules, les exemples pratiques, et bien plus encore !`;
  }

  async generateQCM(content, count = 10) {
    const prompt = `Génère ${count} questions de QCM de qualité basées sur ce contenu de cours.

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
${content.substring(0, 4000)}

IMPORTANT : Respecte exactement le format JSON demandé.`;

    try {
      const response = await this.generateResponse(prompt);
      
      // Essayer de parser la réponse JSON
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const qcm = JSON.parse(jsonMatch[0]);
          // Valider que chaque question a la structure attendue
          if (qcm.questions && Array.isArray(qcm.questions)) {
            const validQuestions = qcm.questions.filter(q => 
              q.question && 
              q.answers && 
              q.answers.length === 4 && 
              typeof q.correctAnswer === 'number' &&
              q.correctAnswer >= 0 && 
              q.correctAnswer < 4
            );
            return validQuestions.slice(0, count);
          }
        }
      } catch (e) {
        console.warn('Impossible de parser la réponse JSON, génération de QCM mock:', e);
      }
      
      // Fallback vers des QCM générés automatiquement
      return this.generateMockQCM(content, count);
    } catch (error) {
      console.error('Erreur lors de la génération de QCM:', error);
      return this.generateMockQCM(content, count);
    }
  }

  generateMockQCM(content, count) {
    const questions = [];
    const subjects = ['Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Histoire', 'Géographie'];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    for (let i = 0; i < count; i++) {
      questions.push({
        question: `Question ${i + 1} sur ${subject} : ${this.generateQuestionText(subject)}`,
        answers: [
          `Réponse A - Option ${i + 1}`,
          `Réponse B - Option ${i + 1}`,
          `Réponse C - Option ${i + 1}`,
          `Réponse D - Option ${i + 1}`
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `Explication de la réponse pour la question ${i + 1}`
      });
    }
    
    return { questions };
  }

  generateQuestionText(subject) {
    const questions = {
      'Mathématiques': 'Quelle est la valeur de x dans l\'équation ?',
      'Physique': 'Quel est le principe fondamental ?',
      'Chimie': 'Quelle est la formule moléculaire ?',
      'Biologie': 'Quel est le processus cellulaire ?',
      'Histoire': 'Quel événement historique ?',
      'Géographie': 'Quelle caractéristique géographique ?'
    };
    
    return questions[subject] || 'Question sur le sujet étudié';
  }

  async generateSummary(content) {
    const prompt = `Génère un résumé clair et structuré de ce contenu de cours.

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
${content.substring(0, 4000)}

IMPORTANT : Sois précis, pédagogique et structuré.`;

    try {
      const response = await this.generateResponse(prompt);
      return response;
    } catch (error) {
      console.error('Erreur lors de la génération du résumé:', error);
      return this.generateMockSummary(content);
    }
  }

  generateMockSummary(content) {
    return `Résumé automatique du contenu de cours :

**Points clés :**
• Concept principal 1 : Explication concise
• Concept principal 2 : Définition importante
• Concept principal 3 : Notion fondamentale

**Concepts importants :**
Ce cours couvre les aspects essentiels de la matière étudiée, avec un focus sur la compréhension pratique et théorique des concepts présentés.

**Structure :**
Le contenu est organisé de manière logique pour faciliter l'apprentissage et la révision.`;
  }

  async generateFlashcards(content, count = 10) {
    const prompt = `Génère ${count} flashcards de qualité basées sur ce contenu de cours.

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
${content.substring(0, 4000)}

IMPORTANT : Respecte exactement le format JSON demandé.`;

    try {
      const response = await this.generateResponse(prompt);
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const flashcards = JSON.parse(jsonMatch[0]);
          // Valider que chaque flashcard a la structure attendue
          if (flashcards.flashcards && Array.isArray(flashcards.flashcards)) {
            const validFlashcards = flashcards.flashcards.filter(f => 
              f.question && 
              f.answer && 
              f.question.trim().length > 0 && 
              f.answer.trim().length > 0
            );
            return validFlashcards.slice(0, count);
          }
        }
      } catch (e) {
        console.warn('Impossible de parser les flashcards JSON:', e);
      }
      
      return this.generateMockFlashcards(content, count);
    } catch (error) {
      console.error('Erreur lors de la génération de flashcards:', error);
      return this.generateMockFlashcards(content, count);
    }
  }

  generateMockFlashcards(content, count) {
    const flashcards = [];
    const concepts = ['Définition', 'Principe', 'Formule', 'Théorème', 'Loi', 'Processus'];
    
    for (let i = 0; i < count; i++) {
      const concept = concepts[i % concepts.length];
      flashcards.push({
        front: `${concept} ${i + 1} : ${this.generateFlashcardQuestion(concept)}`,
        back: `Réponse détaillée pour ${concept} ${i + 1} : Explication complète du concept avec des exemples et des applications pratiques.`
      });
    }
    
    return { flashcards };
  }

  generateFlashcardQuestion(concept) {
    const questions = {
      'Définition': 'Qu\'est-ce que ce concept ?',
      'Principe': 'Quel est le principe fondamental ?',
      'Formule': 'Quelle est la formule associée ?',
      'Théorème': 'Que dit ce théorème ?',
      'Loi': 'Quelle est cette loi ?',
      'Processus': 'Comment fonctionne ce processus ?'
    };
    
    return questions[concept] || 'Question sur le concept';
  }

  async analyzeContent(content) {
    const prompt = `Analyse ce contenu de cours et fournis une analyse détaillée.

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
${content.substring(0, 3000)}

IMPORTANT : Respecte exactement le format JSON demandé.`;

    try {
      const response = await this.generateResponse(prompt);
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('Impossible de parser l\'analyse JSON:', e);
      }
      
      return this.generateMockAnalysis(content);
    } catch (error) {
      console.error('Erreur lors de l\'analyse du contenu:', error);
      return this.generateMockAnalysis(content);
    }
  }

  generateMockAnalysis(content) {
    return {
      subject: "Matière générale",
      mainConcepts: ["Concept principal 1", "Concept principal 2", "Concept principal 3"],
      difficulty: "intermediate",
      keywords: ["mot-clé 1", "mot-clé 2", "mot-clé 3"],
      structure: "Structure standard du cours",
      estimatedTime: "30"
    };
  }

  async generateStudyPlan(content, studyTime = 60) {
    const prompt = `Génère un plan d'étude personnalisé basé sur ce contenu.

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
  "totalTime": 60,
  "recommendations": ["Recommandation 1", "Recommandation 2"]
}

CONTENU :
${content.substring(0, 3000)}

TEMPS DISPONIBLE : ${studyTime} minutes

IMPORTANT : Respecte exactement le format JSON demandé.`;

    try {
      const response = await this.generateResponse(prompt);
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('Impossible de parser le plan d\'étude JSON:', e);
      }
      
      return this.generateMockStudyPlan(studyTime);
    } catch (error) {
      console.error('Erreur lors de la génération du plan d\'étude:', error);
      return this.generateMockStudyPlan(studyTime);
    }
  }

  generateMockStudyPlan(studyTime) {
    const sessions = Math.ceil(studyTime / 20);
    const plan = [];
    
    for (let i = 1; i <= sessions; i++) {
      plan.push({
        session: i,
        title: `Session ${i} - Révision`,
        objectives: [`Objectif ${i}.1`, `Objectif ${i}.2`],
        methods: ["Flashcards", "QCM"],
        duration: Math.min(20, studyTime - (i - 1) * 20),
        focus: `Focus sur les concepts de la session ${i}`
      });
    }
    
    return {
      plan: plan,
      totalTime: studyTime,
      recommendations: [
        "Révisez régulièrement",
        "Faites des pauses entre les sessions",
        "Testez vos connaissances avec les QCM"
      ]
    };
  }
}

// Initialiser le service IA
window.AIService = new AIService();