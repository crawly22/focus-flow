/**
 * AI Service - Claude API Integration
 * Automatically breaks down tasks into ADHD-friendly steps
 */

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

// Detect environment
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const CLAUDE_API_URL = isLocal
    ? 'http://localhost:3001/api/claude' // Local proxy
    : '/api/claude'; // Production (Vercel function)

/**
 * Break down a task into smaller, executable steps using Claude AI
 * @param {string} taskTitle - The task to break down
 * @param {number} estimatedMinutes - Optional estimated time
 * @returns {Promise<Array>} Array of step objects
 */
export async function breakdownTaskWithAI(taskTitle, estimatedMinutes = null, moodScore = 3) {
    if (!CLAUDE_API_KEY || CLAUDE_API_KEY === 'your_claude_api_key_here') {
        console.warn('Claude API key not configured');
        return null;
    }

    try {
        const prompt = createBreakdownPrompt(taskTitle, estimatedMinutes, moodScore);

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Claude API error:', error);
            return null;
        }

        const data = await response.json();
        const content = data.content[0].text;

        // Parse the response into steps
        const steps = parseAIResponse(content);
        return steps;

    } catch (error) {
        console.error('Error calling Claude API:', error);
        return null;
    }
}

/**
 * Create a prompt for Claude to break down the task
 */
function createBreakdownPrompt(taskTitle, estimatedMinutes, moodScore) {
    let styleInstruction = '';

    if (moodScore >= 4) {
        // High energy: Detailed, productivity-focused
        styleInstruction = `
- 사용자의 컨디션이 매우 좋습니다 (점수: ${moodScore}/5).
- 생산성을 극대화할 수 있도록 촘촘하고 구체적인 단계로 나누세요.
- 도전적인 부분도 포함해도 좋습니다.
- 10-20분 단위의 효율적인 작업을 제안하세요.`;
    } else if (moodScore <= 2) {
        // Low energy: Gentle, easy start
        styleInstruction = `
- 사용자의 컨디션이 저조합니다 (점수: ${moodScore}/5).
- 압도감을 느끼지 않도록 **매우 쉽고 간단한** 단계로 나누세요.
- 첫 단계는 "책상에 앉기"나 "물 한잔 마시기"처럼 진입장벽이 없는 것이어야 합니다.
- 5-10분 단위의 짧고 부담 없는 작업을 제안하세요.
- 격려하는 톤을 유지하세요.`;
    } else {
        // Neutral energy
        styleInstruction = `
- 사용자의 컨디션이 보통입니다 (점수: ${moodScore}/5).
- 균형 잡힌 난이도로 단계를 나누세요.
- 5-15분 단위의 실행 가능한 작업을 제안하세요.`;
    }

    return `당신은 ADHD를 가진 사람들을 돕는 작업 관리 전문가입니다. 주어진 작업을 사용자의 현재 컨디션에 맞춰 적절한 단계로 분해해주세요.

**현재 컨디션 가이드:**${styleInstruction}

**기본 원칙:**
- 단계는 실행 가능해야 합니다
- 3-7개의 단계로 분해하세요
- 각 단계에 예상 소요 시간을 표시하세요

**작업:** ${taskTitle}
${estimatedMinutes ? `**총 예상 시간:** ${estimatedMinutes}분` : ''}

**출력 형식 (JSON):**
\`\`\`json
[
  {
    "text": "단계 설명",
    "estimatedMinutes": 숫자
  }
]
\`\`\`

JSON 형식으로만 응답하세요. 다른 설명은 포함하지 마세요.`;
}

/**
 * Parse Claude's response into step objects
 */
function parseAIResponse(response) {
    try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = response.match(/```json?\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : response;

        const steps = JSON.parse(jsonString.trim());

        // Validate and format steps
        return steps.map((step, index) => ({
            id: `step-${index}`,
            text: step.text || step.description || step.step,
            completed: false,
            estimatedMinutes: step.estimatedMinutes || step.time || 10,
        }));
    } catch (error) {
        console.error('Error parsing AI response:', error);
        console.log('Raw response:', response);

        // Fallback: try to extract steps from natural language
        const lines = response.split('\n').filter(line => line.trim());
        return lines
            .filter(line => /^\d+\./.test(line.trim())) // Lines starting with numbers
            .map((line, index) => {
                const text = line.replace(/^\d+\.\s*/, '').trim();
                const timeMatch = text.match(/\((\d+)분\)/);
                const estimatedMinutes = timeMatch ? parseInt(timeMatch[1]) : 10;
                const cleanText = text.replace(/\(\d+분\)/, '').trim();

                return {
                    id: `step-${index}`,
                    text: cleanText,
                    completed: false,
                    estimatedMinutes,
                };
            });
    }
}

/**
 * Get AI suggestions for task categorization
 */
export async function categorizTaskWithAI(taskTitle) {
    if (!CLAUDE_API_KEY || CLAUDE_API_KEY === 'your_claude_api_key_here') {
        return null;
    }

    try {
        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 256,
                messages: [
                    {
                        role: 'user',
                        content: `다음 작업을 카테고리로 분류하세요: "${taskTitle}"

카테고리 옵션: work(업무), personal(개인), health(건강), learning(학습), household(집안일), other(기타)

JSON 형식으로 응답하세요:
{"category": "카테고리", "urgency": 1-10, "importance": 1-10}`,
                    },
                ],
            }),
        });

        if (!response.ok) return null;

        const data = await response.json();
        const content = data.content[0].text;

        const jsonMatch = content.match(/```json?\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;

        return JSON.parse(jsonString.trim());
    } catch (error) {
        console.error('Error categorizing task:', error);
        return null;
    }
}
