import React, { useState, useEffect } from 'react';

const DynamicVocabularyLearner = () => {
  const [currentView, setCurrentView] = useState('input');
  const [wordList, setWordList] = useState([]);
  const [currentGame, setCurrentGame] = useState('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gameProgress, setGameProgress] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [inputText, setInputText] = useState('');
  const [themes, setThemes] = useState({});

  // Parse word list from input
  const parseWordList = (text) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const words = [];
    
    lines.forEach(line => {
      const parts = line.split('|').map(part => part.trim());
      const word = {
        word: parts[0] || '',
        partOfSpeech: parts[1] || '',
        definition: parts[2] || '',
        pronunciation: parts[3] || '',
        example: parts[4] || '',
        theme: parts[5] || 'general'
      };
      
      if (word.word) {
        words.push(word);
      }
    });
    
    return words;
  };

  // Generate themes from word list
  const generateThemes = (words) => {
    const themeMap = {};
    words.forEach(word => {
      if (!themeMap[word.theme]) {
        themeMap[word.theme] = [];
      }
      themeMap[word.theme].push(word.word);
    });
    return themeMap;
  };

  // Generate spelling challenges
  const generateSpellingChallenges = (words) => {
    return words.map(word => ({
      word: word.word,
      scrambled: word.word.split('').sort(() => Math.random() - 0.5).join(''),
      hint: word.definition || `Think of a word that means: ${word.word}`,
      pronunciation: word.pronunciation || '',
      answer: word.word
    }));
  };

  // Generate meaning match challenges
  const generateMeaningChallenges = (words) => {
    return words.map(word => {
      const otherWords = words.filter(w => w.word !== word.word);
      const wrongOptions = otherWords.length >= 3 
        ? otherWords.slice(0, 3).map(w => w.definition || w.word)
        : ['Option A', 'Option B', 'Option C'];
      
      return {
        word: word.word,
        correctMeaning: word.definition || `A word related to ${word.word}`,
        options: [
          word.definition || `A word related to ${word.word}`,
          ...wrongOptions
        ].sort(() => Math.random() - 0.5)
      };
    });
  };

  // Generate grammar practice challenges
  const generateGrammarChallenges = (words) => {
    return words.map(word => {
      const forms = generateWordForms(word.word, word.partOfSpeech);
      return {
        sentence: `The _____ ${word.partOfSpeech === 'noun' ? 'is' : 'was'} very important.`,
        answer: word.word,
        options: [word.word, ...forms].sort(() => Math.random() - 0.5)
      };
    });
  };

  // Generate word forms
  const generateWordForms = (word, partOfSpeech) => {
    const forms = [];
    if (partOfSpeech === 'noun') {
      forms.push(word + 's', word + 'es');
    } else if (partOfSpeech === 'verb') {
      forms.push(word + 's', word + 'ed', word + 'ing');
    } else if (partOfSpeech === 'adjective') {
      forms.push(word + 'er', word + 'est', word + 'ly');
    }
    return forms.slice(0, 3);
  };

  // Generate story prompts
  const generateStoryPrompts = (words) => {
    const prompts = [];
    for (let i = 0; i < Math.ceil(words.length / 5); i++) {
      const wordGroup = words.slice(i * 5, (i + 1) * 5);
      prompts.push({
        prompt: `Write a short story using these words:`,
        words: wordGroup.map(w => w.word),
        theme: wordGroup[0]?.theme || 'general'
      });
    }
    return prompts;
  };

  // Generate quiz questions
  const generateQuizQuestions = (words) => {
    return words.map(word => ({
      question: `What does "${word.word}" mean?`,
      answer: word.definition || `A ${word.partOfSpeech || 'word'} related to ${word.word}`,
      options: [
        word.definition || `A ${word.partOfSpeech || 'word'} related to ${word.word}`,
        `The opposite of ${word.word}`,
        `A type of ${word.word}`,
        `Something similar to ${word.word}`
      ].sort(() => Math.random() - 0.5)
    }));
  };

  // Generate flashcards
  const generateFlashcards = (words) => {
    return words.map(word => ({
      front: word.word,
      back: {
        definition: word.definition || `A ${word.partOfSpeech || 'word'}`,
        pronunciation: word.pronunciation || '',
        example: word.example || `Example: ${word.word} is used in sentences.`,
        partOfSpeech: word.partOfSpeech || ''
      }
    }));
  };

  const generateQuestion = (gameType) => {
    if (wordList.length === 0) return null;

    switch (gameType) {
      case 'spelling':
        const spellingChallenges = generateSpellingChallenges(wordList);
        const spellingQ = spellingChallenges[Math.floor(Math.random() * spellingChallenges.length)];
        return {
          type: 'spelling',
          question: `Unscramble: "${spellingQ.scrambled}"`,
          hint: `Hint: ${spellingQ.hint}`,
          pronunciation: spellingQ.pronunciation,
          answer: spellingQ.answer,
          scrambled: spellingQ.scrambled
        };
      
      case 'meaning':
        const meaningChallenges = generateMeaningChallenges(wordList);
        const meaningQ = meaningChallenges[Math.floor(Math.random() * meaningChallenges.length)];
        return {
          type: 'meaning',
          question: `What does "${meaningQ.word}" mean?`,
          options: meaningQ.options,
          answer: meaningQ.correctMeaning,
          word: meaningQ.word
        };
      
      case 'grammar':
        const grammarChallenges = generateGrammarChallenges(wordList);
        const grammarQ = grammarChallenges[Math.floor(Math.random() * grammarChallenges.length)];
        return {
          type: 'grammar',
          question: grammarQ.sentence,
          options: grammarQ.options,
          answer: grammarQ.answer
        };
      
      case 'story':
        const storyPrompts = generateStoryPrompts(wordList);
        const storyQ = storyPrompts[Math.floor(Math.random() * storyPrompts.length)];
        return {
          type: 'story',
          prompt: storyQ.prompt,
          words: storyQ.words,
          theme: storyQ.theme
        };
      
      case 'themes':
        const themeNames = Object.keys(themes);
        const randomTheme = themeNames[Math.floor(Math.random() * themeNames.length)];
        const correctWords = themes[randomTheme] || [];
        const wrongWords = wordList.filter(w => !correctWords.includes(w.word)).slice(0, 2).map(w => w.word);
        const allWords = [...correctWords, ...wrongWords].sort(() => Math.random() - 0.5);
        
        return {
          type: 'themes',
          question: `Select all words related to: ${randomTheme}`,
          words: allWords,
          answer: correctWords,
          theme: randomTheme
        };
      
      case 'quiz':
        const quizQuestions = generateQuizQuestions(wordList);
        const quizQ = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
        return {
          type: 'quiz',
          question: quizQ.question,
          options: quizQ.options,
          answer: quizQ.answer
        };
      
      case 'flashcards':
        const flashcards = generateFlashcards(wordList);
        const flashcard = flashcards[Math.floor(Math.random() * flashcards.length)];
        return {
          type: 'flashcards',
          front: flashcard.front,
          back: flashcard.back
        };
      
      default:
        return null;
    }
  };

  const checkAnswer = (answer) => {
    let isCorrect = false;
    let points = 0;

    switch (currentQuestion.type) {
      case 'spelling':
        isCorrect = answer.toLowerCase() === currentQuestion.answer.toLowerCase();
        points = isCorrect ? 10 : 0;
        break;
      
      case 'meaning':
      case 'grammar':
      case 'quiz':
        isCorrect = answer === currentQuestion.answer;
        points = isCorrect ? 10 : 0;
        break;
      
      case 'story':
        points = Math.min(answer.length * 2, 50);
        isCorrect = true;
        break;
      
      case 'themes':
        const correctSelections = selectedAnswers.filter(word => currentQuestion.answer.includes(word));
        const incorrectSelections = selectedAnswers.filter(word => !currentQuestion.answer.includes(word));
        points = (correctSelections.length * 5) - (incorrectSelections.length * 2);
        isCorrect = correctSelections.length === currentQuestion.answer.length && incorrectSelections.length === 0;
        break;
      
      case 'flashcards':
        isCorrect = true;
        points = 5;
        break;
    }

    setScore(score + Math.max(points, 0));
    setFeedback(isCorrect ? 
      `🎉 Correct! +${points} points` : 
      `❌ Not quite. The answer was: ${currentQuestion.answer}`);
    
    setGameProgress(gameProgress + 1);
    
    if (gameProgress >= 4) {
      setLevel(level + 1);
      setGameProgress(0);
    }
  };

  const startGame = (gameType) => {
    if (wordList.length === 0) {
      setFeedback('Please add some words first!');
      return;
    }
    setCurrentGame(gameType);
    setCurrentQuestion(generateQuestion(gameType));
    setUserAnswer('');
    setFeedback('');
    setSelectedAnswers([]);
  };

  const nextQuestion = () => {
    setCurrentQuestion(generateQuestion(currentGame));
    setUserAnswer('');
    setFeedback('');
    setSelectedAnswers([]);
  };

  const toggleThemeAnswer = (word) => {
    if (selectedAnswers.includes(word)) {
      setSelectedAnswers(selectedAnswers.filter(w => w !== word));
    } else {
      setSelectedAnswers([...selectedAnswers, word]);
    }
  };

  const handleWordListSubmit = () => {
    const words = parseWordList(inputText);
    if (words.length === 0) {
      setFeedback('Please enter some words!');
      return;
    }
    setWordList(words);
    setThemes(generateThemes(words));
    setCurrentView('menu');
    setFeedback(`✅ Added ${words.length} words! Ready to play!`);
  };

  const [flashcardSide, setFlashcardSide] = useState('front');

  // Input Interface
  if (currentView === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">📚 Dynamic Vocabulary Learner</h1>
            <p className="text-gray-600 text-lg mb-2">Create your own vocabulary learning activities!</p>
            <p className="text-gray-500">Enter words and let the system generate interactive games</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Your Words</h2>
            <p className="text-gray-600 mb-4">
              Enter words in this format (one per line):<br/>
              <code className="bg-gray-100 px-2 py-1 rounded">word|part of speech|definition|pronunciation|example sentence|theme</code>
            </p>
            
            <div className="mb-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Example:
happy|adjective|feeling joy|/ˈhæpi/|I am happy today.|emotions
beautiful|adjective|pleasing to look at|/ˈbjuːtɪfʊl/|She is beautiful.|appearance
run|verb|move quickly on foot|/rʌn/|I run every morning.|movement"
                className="w-full p-4 border-2 rounded-lg h-48 text-sm font-mono"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleWordListSubmit}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Generate Learning Activities
              </button>
              
              <button
                onClick={() => setCurrentView('menu')}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Use Sample Words
              </button>
            </div>

            {feedback && (
              <div className="mt-4 p-4 bg-blue-100 text-blue-800 rounded-lg">
                {feedback}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Menu
  if (currentGame === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">📚 Dynamic Vocabulary Learner</h1>
            <p className="text-gray-600 text-lg mb-2">Level {level} | Score: {score}</p>
            <p className="text-gray-500">Words loaded: {wordList.length}</p>
            <button
              onClick={() => setCurrentView('input')}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add/Edit Words
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => startGame('spelling')}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <div className="text-4xl mb-2">🔤</div>
              <h3 className="text-xl font-bold mb-2">Spelling Challenge</h3>
              <p className="text-sm opacity-90">Unscramble the letters!</p>
            </button>

            <button
              onClick={() => startGame('meaning')}
              className="bg-gradient-to-r from-purple-400 to-pink-500 text-white p-6 rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-xl font-bold mb-2">Meaning Match</h3>
              <p className="text-sm opacity-90">Match words to definitions!</p>
            </button>

            <button
              onClick={() => startGame('grammar')}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <div className="text-4xl mb-2">📝</div>
              <h3 className="text-xl font-bold mb-2">Grammar Practice</h3>
              <p className="text-sm opacity-90">Choose the correct form!</p>
            </button>

            <button
              onClick={() => startGame('story')}
              className="bg-gradient-to-r from-red-400 to-purple-500 text-white p-6 rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <div className="text-4xl mb-2">📖</div>
              <h3 className="text-xl font-bold mb-2">Story Creator</h3>
              <p className="text-sm opacity-90">Write creative stories!</p>
            </button>

            <button
              onClick={() => startGame('themes')}
              className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white p-6 rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <div className="text-4xl mb-2">🗂️</div>
              <h3 className="text-xl font-bold mb-2">Theme Groups</h3>
              <p className="text-sm opacity-90">Group words by theme!</p>
            </button>

            <button
              onClick={() => startGame('quiz')}
              className="bg-gradient-to-r from-teal-400 to-green-500 text-white p-6 rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <div className="text-4xl mb-2">❓</div>
              <h3 className="text-xl font-bold mb-2">Quick Quiz</h3>
              <p className="text-sm opacity-90">Test your knowledge!</p>
            </button>

            <button
              onClick={() => startGame('flashcards')}
              className="bg-gradient-to-r from-pink-400 to-red-500 text-white p-6 rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <div className="text-4xl mb-2">🃏</div>
              <h3 className="text-xl font-bold mb-2">Flashcards</h3>
              <p className="text-sm opacity-90">Flip and learn!</p>
            </button>

            <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white p-6 rounded-2xl">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-xl font-bold mb-2">Progress</h3>
              <p className="text-sm opacity-90">Level {level}</p>
              <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(gameProgress / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentGame('menu')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back to Menu
            </button>
            <div className="text-right">
              <div className="text-lg font-semibold">Score: {score}</div>
              <div className="text-sm text-gray-600">Level {level}</div>
            </div>
          </div>
        </div>

        {currentQuestion && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {currentQuestion.question}
            </h2>

            {currentQuestion.type === 'spelling' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-lg text-gray-600 mb-2">{currentQuestion.hint}</div>
                  <div className="text-sm text-gray-500 mb-4">{currentQuestion.pronunciation}</div>
                  <div className="text-3xl font-mono bg-gray-100 p-4 rounded-lg mb-4">
                    {currentQuestion.scrambled}
                  </div>
                </div>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type the correct spelling..."
                  className="w-full p-4 border-2 rounded-lg text-lg text-center"
                  onKeyPress={(e) => e.key === 'Enter' && checkAnswer(userAnswer)}
                />
              </div>
            )}

            {(currentQuestion.type === 'meaning' || currentQuestion.type === 'grammar' || currentQuestion.type === 'quiz') && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => checkAnswer(option)}
                    className="w-full p-4 text-left border-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'story' && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Use these words:</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.words.map((word, index) => (
                      <span key={index} className="bg-blue-200 px-3 py-1 rounded-full text-sm">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Write your story here... (minimum 3 sentences)"
                  className="w-full p-4 border-2 rounded-lg h-32"
                />
              </div>
            )}

            {currentQuestion.type === 'themes' && (
              <div className="space-y-4">
                <div className="text-center text-lg text-gray-600 mb-4">
                  Select all words that belong to: <strong>{currentQuestion.theme}</strong>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.words.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => toggleThemeAnswer(word)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedAnswers.includes(word)
                          ? 'bg-blue-100 border-blue-500'
                          : 'bg-gray-50 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {word}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => checkAnswer(selectedAnswers)}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={selectedAnswers.length === 0}
                >
                  Submit Selection
                </button>
              </div>
            )}

            {currentQuestion.type === 'flashcards' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800 mb-4">
                    {flashcardSide === 'front' ? currentQuestion.front : 'Definition'}
                  </div>
                  {flashcardSide === 'back' && (
                    <div className="space-y-2 text-left">
                      <div><strong>Definition:</strong> {currentQuestion.back.definition}</div>
                      <div><strong>Pronunciation:</strong> {currentQuestion.back.pronunciation}</div>
                      <div><strong>Part of Speech:</strong> {currentQuestion.back.partOfSpeech}</div>
                      <div><strong>Example:</strong> {currentQuestion.back.example}</div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setFlashcardSide(flashcardSide === 'front' ? 'back' : 'front')}
                  className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  {flashcardSide === 'front' ? 'Flip to See Answer' : 'Flip Back'}
                </button>
                {flashcardSide === 'back' && (
                  <button
                    onClick={() => checkAnswer('correct')}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Got It Right!
                  </button>
                )}
              </div>
            )}

            {!feedback && currentQuestion.type !== 'themes' && currentQuestion.type !== 'story' && currentQuestion.type !== 'flashcards' && (
              <button
                onClick={() => checkAnswer(userAnswer)}
                className="w-full mt-6 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold"
                disabled={!userAnswer.trim()}
              >
                Submit Answer
              </button>
            )}

            {currentQuestion.type === 'story' && (
              <button
                onClick={() => checkAnswer(userAnswer)}
                className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
                disabled={userAnswer.length < 20}
              >
                Submit Story
              </button>
            )}

            {feedback && (
              <div className="mt-6 text-center">
                <div className={`text-lg font-semibold p-4 rounded-xl mb-4 ${
                  feedback.includes('🎉') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {feedback}
                </div>
                <button
                  onClick={nextQuestion}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Next Question →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicVocabularyLearner; 