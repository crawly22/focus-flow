# ADHD 계획 및 실행 지원 앱 기획서

## 1. 프로젝트 개요

### 1.1 앱 이름
**FocusFlow** (포커스플로우)

### 1.2 목적
ADHD를 가진 사람들이 계획을 세우고 실행하는 과정에서 겪는 어려움을 최소화하고, 작업 완수율을 높이기 위한 모바일 애플리케이션

### 1.3 핵심 가치
- **즉각적인 시작**: 복잡한 설정 없이 바로 사용 가능
- **시각적 피드백**: 진행 상황을 직관적으로 확인
- **긍정적 강화**: 작은 성취도 축하하고 동기부여
- **유연한 구조**: 계획 변경이 쉽고 부담 없음

---

## 2. 타겟 사용자 분석

### 2.1 주요 사용자
- ADHD 진단을 받은 성인 및 청소년
- ADHD 특성을 가진 사람들 (비진단 포함)
- 실행 기능 장애를 겪는 사람들

### 2.2 사용자의 주요 어려움
1. **시간 맹목(Time Blindness)**
   - 시간이 얼마나 지났는지 인식하기 어려움
   - 작업 소요 시간 예측 실패
   
2. **작업 시작의 어려움**
   - 압도감으로 인한 회피
   - 완벽주의로 인한 지연
   
3. **주의력 전환**
   - 외부 자극에 쉽게 산만해짐
   - 멀티태스킹으로 인한 미완료 작업 증가
   
4. **우선순위 설정 실패**
   - 모든 것이 긴급해 보임
   - 중요도 판단의 어려움
   
5. **지속적인 동기부여 부족**
   - 장기 목표에 대한 흥미 상실
   - 즉각적인 보상 욕구

---

## 3. 핵심 기능 명세

### 3.1 작업 분해 기능 (Task Breakdown)

#### 기능 설명
큰 작업을 작고 실행 가능한 단계로 자동/수동 분해

#### 구현 요구사항
```
입력:
- 작업 제목 (예: "방 청소하기")
- 예상 소요 시간 (선택)

처리:
- AI 기반 자동 분해 제안 (3-5단계)
- 각 단계는 5-15분 내 완료 가능한 크기
- 사용자가 단계 수정/추가/삭제 가능

출력:
- 체크리스트 형태의 세부 단계
- 각 단계별 예상 시간
- 진행률 표시 (0-100%)

예시:
작업: "방 청소하기"
→ 1. 바닥의 옷 모으기 (5분)
→ 2. 책상 위 정리하기 (10분)
→ 3. 쓰레기 버리기 (5분)
→ 4. 진공청소기 돌리기 (10분)
```

#### UI 요구사항
- 드래그 앤 드롭으로 단계 순서 변경
- 탭/클릭으로 단계 완료 체크
- 완료된 단계는 회색 처리 및 취소선
- 현재 진행 중인 단계 하이라이트

---

### 3.2 타이머 기능 (Adaptive Timer)

#### 기능 설명
다양한 타이머 모드로 집중력 관리

#### 타이머 모드

##### 1) 포모도로 타이머
```
기본 설정:
- 작업 시간: 25분
- 짧은 휴식: 5분
- 긴 휴식: 15분 (4회 작업 후)

커스터마이징:
- 사용자가 시간 조정 가능
- ADHD 친화적 단축 모드 (15분 작업 / 3분 휴식)
```

##### 2) 타임박싱 (Time Boxing)
```
기능:
- 작업에 정확한 시간 할당
- 시간 종료 시 알림
- 연장 여부 선택 가능

UI:
- 원형 타이머 (시각적 시간 감소 표시)
- 남은 시간 대형 숫자로 표시
- 진동/소리 알림 (사용자 설정)
```

##### 3) 긴급 모드
```
특징:
- 5분 초단위 집중 타이머
- "지금 바로 5분만 하기" 버튼
- 작업 시작 장벽 낮추기
```

#### 기술 요구사항
```javascript
// 타이머 객체 구조
Timer {
  id: string,
  mode: 'pomodoro' | 'timebox' | 'urgent',
  duration: number, // 초 단위
  remainingTime: number,
  isPaused: boolean,
  taskId: string, // 연결된 작업 ID
  notifications: {
    sound: boolean,
    vibration: boolean,
    visual: boolean
  }
}
```

---

### 3.3 시각적 진행도 추적 (Visual Progress Tracking)

#### 기능 설명
작업 진행 상황을 다양한 시각적 방법으로 표시

#### 표시 방식

##### 1) 일일 진행바
```
표시 항목:
- 오늘 완료한 작업 수 / 계획한 작업 수
- 총 집중 시간
- 완료율 퍼센트

시각화:
- 진행바 (0-100%)
- 색상 코딩 (빨강 → 노랑 → 초록)
```

##### 2) 주간/월간 히트맵
```
표시:
- 달력 형태
- 각 날짜별 활동량을 색상 강도로 표시
- GitHub 잔디밭 스타일

인터랙션:
- 날짜 클릭 시 해당일 상세 보기
```

##### 3) 연속 달성 스트릭
```
기능:
- 연속으로 작업한 날짜 카운트
- "3일 연속 달성!" 배지
- 스트릭 끊김 방지 알림
```

#### UI 컴포넌트
```
ProgressCard {
  dailyProgress: {
    completed: number,
    total: number,
    focusTime: number // 분 단위
  },
  weeklyHeatmap: Array<{date: Date, intensity: 0-4}>,
  streak: {
    current: number,
    longest: number,
    lastActive: Date
  }
}
```

---

### 3.4 우선순위 매트릭스 (Priority Matrix)

#### 기능 설명
아이젠하워 매트릭스 기반 작업 분류

#### 사분면 구조
```
긴급함 ↑
    |
    | [긴급+중요]      [중요+비긴급]
    | 즉시 실행        계획 수립
    |
    |--------------------------------→ 중요함
    |
    | [긴급+비중요]    [비긴급+비중요]
    | 위임/간소화      제거 고려
    |
```

#### 구현 방식
```
입력 방법:
1. 슬라이더로 긴급도/중요도 선택
2. 질문 기반 자동 분류
   - "마감일이 있나요?"
   - "안 하면 큰 문제가 생기나요?"
   - "당신의 목표와 관련이 있나요?"

출력:
- 4개 섹션으로 작업 자동 분류
- 각 섹션에 권장 행동 표시
- 오늘 할 일 자동 제안
```

#### 데이터 구조
```javascript
Task {
  id: string,
  title: string,
  urgency: number, // 1-10
  importance: number, // 1-10
  quadrant: 1 | 2 | 3 | 4,
  suggestedAction: string,
  deadline?: Date
}
```

---

### 3.5 보상 시스템 (Gamification & Rewards)

#### 기능 설명
작은 성취를 축하하고 지속적인 동기부여 제공

#### 보상 유형

##### 1) 즉각적 피드백
```
작업 완료 시:
- 애니메이션 효과 (체크 아이콘 확대)
- 긍정적 메시지 랜덤 표시
  예: "잘했어요! 한 걸음 더 나아갔네요!"
- 효과음 (선택 가능)
```

##### 2) 경험치 및 레벨 시스템
```
경험치 획득:
- 작업 완료: 10-50 XP (난이도별)
- 타이머 완료: 5 XP / 25분
- 연속 달성: 보너스 XP

레벨업 혜택:
- 새로운 테마 잠금 해제
- 커스텀 아이콘/배지
- 통계 대시보드 확장
```

##### 3) 배지 컬렉션
```
배지 종류:
- 시작 관련: "첫 작업 완료", "첫 타이머 사용"
- 연속성: "3일 연속", "7일 연속", "30일 연속"
- 성취: "작업 10개 완료", "총 100개 완료"
- 특별: "새벽 집중러", "주말 전사"

표시:
- 프로필 화면에 컬렉션 진열
- 미획득 배지는 실루엣으로 표시
```

#### 주의사항
```
ADHD 친화적 설계:
- 과도한 알림 자제
- 사용자가 보상 시스템 on/off 가능
- 실패에 대한 처벌 없음
- 비교 기능 제외 (다른 사용자와 경쟁 X)
```

---

### 3.6 유연한 재계획 기능 (Flexible Rescheduling)

#### 기능 설명
계획 변경을 쉽고 부담 없게 만듦

#### 핵심 원칙
```
"계획이 틀어져도 괜찮아요"
- 죄책감 유발 없는 UI
- 한 번의 탭으로 일정 변경
```

#### 재계획 옵션
```
작업 미완료 시 선택지:
1. 내일로 이동
2. 다음 주로 이동
3. 언젠가 목록으로 이동
4. 삭제 (더 이상 안 함)

자동 제안:
- "이 작업은 3번 미루셨어요. 삭제하시겠어요?"
- "비슷한 작업을 묶어서 한 번에 할까요?"
```

#### UI/UX
```
인터랙션:
- 스와이프로 빠른 재계획
- 드래그 앤 드롭으로 날짜 이동
- 한 번에 여러 작업 이동 (멀티 셀렉트)

피드백:
- "괜찮아요, 다시 계획해봐요" 메시지
- 재계획 횟수 저장하지만 강조하지 않음
```

---

### 3.7 집중 방해 차단 (Focus Shield)

#### 기능 설명
집중 시간 동안 방해 요소 차단

#### 차단 옵션
```
1. 앱 차단
   - 사용자가 선택한 앱 (SNS, 게임 등)
   - 타이머 중 해당 앱 실행 시 리다이렉트
   - "10분 후에 돌아와요!" 메시지

2. 알림 차단
   - 시스템 알림 일시 중지
   - 긴급 연락처만 허용 옵션

3. 웹사이트 차단 (선택)
   - 특정 사이트 접근 제한
```

#### 비상 탈출구
```
설계 철학:
- 완전 차단 아닌 마찰 추가
- "정말 이 앱을 여시겠어요?" 확인 창
- 긴급 상황 대비 즉시 해제 가능

구현:
- "집중 깨기" 버튼 (3초 홀드)
- 해제 시 이유 선택 (통계용, 강제 아님)
```

---

### 3.8 음성 작업 추가 (Voice Task Input)

#### 기능 설명
말로 빠르게 작업 추가

#### 사용 시나리오
```
문제:
- ADHD인은 생각이 빠르게 지나감
- 타이핑이 귀찮아서 작업 추가 미루기

해결:
- 플로팅 버튼 → 음성 녹음
- 자동 텍스트 변환 및 작업 생성
```

#### 기술 스펙
```
입력: 음성 (1-30초)
처리:
- Speech-to-Text API 사용
- 자연어 처리로 작업 추출
- 날짜/시간 표현 인식
  예: "내일 오후 3시에 회의 준비"

출력:
- 작업 제목
- 자동 추출된 날짜/시간
- 편집 가능한 프리뷰
```

---

### 3.9 감정 체크인 (Emotional Check-in)

#### 기능 설명
현재 상태 인식 및 적응적 제안

#### 체크인 프로세스
```
질문 (선택):
1. "지금 기분이 어때요?"
   - 이모티콘 선택 (😊😐😟)
   
2. "에너지 레벨은요?"
   - 슬라이더 (낮음 ← → 높음)
   
3. "집중도는요?"
   - 슬라이더 (산만함 ← → 집중됨)

빈도:
- 앱 시작 시 (선택)
- 하루 1-2회 알림 (사용자 설정)
```

#### 적응적 제안
```
에너지 낮음 + 집중 어려움:
→ "쉬운 작업부터 시작해봐요"
→ 5분 타이머 제안
→ 단순 반복 작업 우선 표시

에너지 높음 + 집중 좋음:
→ "어려운 작업 도전!"
→ 긴 타이머 제안
→ 중요+긴급 작업 우선 표시

기분 나쁨:
→ "오늘은 가볍게 가도 돼요"
→ 필수 작업만 표시
→ 자기 돌봄 작업 제안
```

---

## 4. 화면 구성 (Screen Flow)

### 4.1 메인 화면
```
구성 요소:
[상단]
- 오늘 날짜
- 감정 체크인 아이콘
- 설정 아이콘

[중앙]
- "오늘 할 일" 섹션
  - 우선순위 높은 작업 3-5개
  - 각 작업에 재생 버튼 (타이머 시작)
- 플로팅 버튼 (+) → 작업 추가

[하단]
- 진행도 요약 카드
- 탭 네비게이션
  - 오늘
  - 전체 작업
  - 통계
  - 프로필
```

### 4.2 작업 추가 화면
```
입력 필드:
1. 작업 제목 (필수)
2. 세부 단계 (선택, AI 제안 가능)
3. 예상 시간 (선택)
4. 마감일 (선택)
5. 긴급도/중요도 (선택, 슬라이더)
6. 카테고리 (선택, 태그)

버튼:
- 저장
- 음성으로 추가
- AI 분해 제안
```

### 4.3 타이머 화면
```
전체 화면 타이머:
[상단]
- 현재 작업 제목
- X 버튼 (타이머 정지 확인 후)

[중앙]
- 대형 원형 타이머
- 남은 시간 숫자
- 진행 애니메이션

[하단]
- 일시정지/재개 버튼
- 작업 완료 버튼
- 건너뛰기 옵션
```

### 4.4 통계 화면
```
[상단]
- 기간 선택 (주간/월간/전체)

[중앙]
- 완료 작업 수 그래프
- 총 집중 시간
- 연속 달성 스트릭
- 히트맵 달력
- 카테고리별 분포

[하단]
- 획득한 배지 갤러리
```

---

## 5. 기술 스택 제안

### 5.1 프론트엔드
```
프레임워크: React Native 또는 Flutter
- 크로스 플랫폼 개발
- 네이티브 성능
- 풍부한 UI 라이브러리

상태 관리:
- Redux 또는 MobX
- 로컬 상태 관리

UI 라이브러리:
- NativeBase 또는 React Native Paper
- 커스텀 애니메이션 (Reanimated)
```

### 5.2 백엔드
```
서버: Node.js (Express) 또는 Firebase
- RESTful API
- 실시간 동기화

데이터베이스:
- PostgreSQL (관계형 데이터)
- Firebase Firestore (NoSQL 옵션)

인증:
- Firebase Auth 또는 JWT
- 소셜 로그인 (Google, Apple)
```

### 5.3 추가 서비스
```
음성 인식: Google Speech-to-Text API
알림: Firebase Cloud Messaging (FCM)
분석: Firebase Analytics
저장소: Firebase Storage (이미지/파일)
```

---

## 6. 데이터 모델

### 6.1 사용자 (User)
```javascript
User {
  id: string,
  email: string,
  displayName: string,
  createdAt: timestamp,
  settings: {
    notifications: boolean,
    soundEffects: boolean,
    defaultPomodoroTime: number,
    focusApps: string[], // 차단할 앱 목록
    theme: 'light' | 'dark' | 'auto'
  },
  stats: {
    totalTasksCompleted: number,
    totalFocusTime: number, // 분
    currentStreak: number,
    longestStreak: number,
    level: number,
    xp: number
  }
}
```

### 6.2 작업 (Task)
```javascript
Task {
  id: string,
  userId: string,
  title: string,
  description?: string,
  steps: Array<{
    id: string,
    text: string,
    completed: boolean,
    estimatedMinutes?: number
  }>,
  urgency: number, // 1-10
  importance: number, // 1-10
  quadrant: 1 | 2 | 3 | 4,
  estimatedMinutes?: number,
  actualMinutes?: number,
  category?: string,
  tags: string[],
  scheduledDate?: Date,
  deadline?: Date,
  completedAt?: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
  status: 'todo' | 'in_progress' | 'completed' | 'someday',
  rescheduleCount: number
}
```

### 6.3 타이머 세션 (TimerSession)
```javascript
TimerSession {
  id: string,
  userId: string,
  taskId?: string,
  mode: 'pomodoro' | 'timebox' | 'urgent',
  plannedDuration: number, // 초
  actualDuration: number, // 초
  completed: boolean,
  startedAt: timestamp,
  endedAt?: timestamp,
  interruptions: number
}
```

### 6.4 감정 체크인 (MoodCheckIn)
```javascript
MoodCheckIn {
  id: string,
  userId: string,
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible',
  energy: number, // 1-10
  focus: number, // 1-10
  note?: string,
  timestamp: timestamp
}
```

---

## 7. API 엔드포인트 설계

### 7.1 작업 관리
```
POST /api/tasks
- 새 작업 생성
- Body: {title, description, urgency, importance, ...}

GET /api/tasks
- 작업 목록 조회
- Query: ?date=2024-01-01&status=todo

GET /api/tasks/:id
- 특정 작업 상세

PUT /api/tasks/:id
- 작업 수정

DELETE /api/tasks/:id
- 작업 삭제

POST /api/tasks/:id/complete
- 작업 완료 처리

POST /api/tasks/:id/reschedule
- 작업 재계획
- Body: {newDate}

POST /api/tasks/breakdown
- AI 작업 분해 제안
- Body: {taskTitle}
```

### 7.2 타이머
```
POST /api/timer/start
- 타이머 시작
- Body: {taskId, mode, duration}

POST /api/timer/:id/pause
- 타이머 일시정지

POST /api/timer/:id/resume
- 타이머 재개

POST /api/timer/:id/complete
- 타이머 완료
```

### 7.3 통계
```
GET /api/stats/daily
- 일일 통계
- Query: ?date=2024-01-01

GET /api/stats/weekly
- 주간 통계

GET /api/stats/heatmap
- 히트맵 데이터
- Query: ?startDate=2024-01-01&endDate=2024-01-31
```

### 7.4 사용자
```
POST /api/auth/signup
- 회원가입

POST /api/auth/login
- 로그인

GET /api/user/profile
- 프로필 조회

PUT /api/user/settings
- 설정 변경
```

---

## 8. UI/UX 디자인 원칙

### 8.1 ADHD 친화적 디자인
```
1. 시각적 명확성
   - 큰 버튼 (최소 48x48dp)
   - 명확한 색상 구분
   - 충분한 여백

2. 즉각적 피드백
   - 모든 액션에 즉시 반응
   - 애니메이션으로 변화 표시
   - 햅틱 피드백

3. 단순한 네비게이션
   - 최대 3단계 깊이
   - 주요 기능은 1-2탭 이내
   - 뒤로가기 항상 가능

4. 압도감 최소화
   - 한 화면에 3-5개 항목만
   - 접을 수 있는 섹션
   - "더 보기" 옵션

5. 에러 용인
   - 실행 취소 기능
   - 확인 없는 삭제 금지
   - 자동 저장
```

### 8.2 색상 팔레트
```
주색상:
- 차분한 파란색 (#4A90E2) - 집중
- 부드러운 초록색 (#7ED321) - 완료
- 따뜻한 주황색 (#F5A623) - 긴급

보조색상:
- 밝은 회색 (#F8F9FA) - 배경
- 어두운 회색 (#343A40) - 텍스트
- 연한 빨강 (#FF6B6B) - 경고 (최소 사용)

다크 모드:
- 배경: #1E1E1E
- 카드: #2D2D2D
- 텍스트: #E0E0E0
```

### 8.3 타이포그래피
```
헤더: 24-32pt, Bold
본문: 16-18pt, Regular
캡션: 12-14pt, Light

폰트 추천:
- Sans-serif (가독성)
- SF Pro (iOS), Roboto (Android)
```

---

## 9. 접근성 (Accessibility)

### 9.1 필수 기능
```
1. 화면 읽기 지원
   - 모든 버튼/요소에 레이블
   - 의미 있는 설명

2. 키보드 네비게이션
   - 탭 순서 논리적
   - 포커스 표시 명확

3. 색각 이상 대응
   - 색상만으로 정보 전달 X
   - 아이콘/텍스트 병행

4. 텍스트 크기 조절
   - 시스템 설정 반영
   - 최대 200% 확대 지원

5. 저시력 지원
   - 고대비 모드
   - 큰 텍스트 옵션
```

---

## 10. 개인정보 보호

### 10.1 데이터 수집 원칙
```
최소 수집:
- 필수: 이메일, 사용자명
- 선택: 프로필 사진, 생년월일

투명성:
- 데이터 사용 목적 명시
- 개인정보 처리방침 제공
```

### 10.2 보안
```
1. 암호화
   - 전송: HTTPS/TLS
   - 저장: 민감 데이터 암호화

2. 인증
   - 비밀번호 강도 체크
   - 2단계 인증 옵션

3. 로컬 저장
   - 오프라인 사용 지원
   - 로컬 DB 암호화
```

---

## 11. 출시 전략

### 11.1 MVP (Minimum Viable Product)
```
1단계 - 핵심 기능:
✓ 작업 추가/수정/삭제
✓ 작업 분해
✓ 포모도로 타이머
✓ 일일 진행도 표시
✓ 기본 통계

제외:
- 음성 입력
- 앱 차단
- 복잡한 게임화
```

### 11.2 베타 테스트
```
대상:
- ADHD 커뮤니티
- 30-50명 베타 테스터

기간: 4주

수집 데이터:
- 사용 패턴
- 버그 리포트
- 기능 요청
- 만족도 조사
```

### 11.3 정식 출시
```
플랫폼:
- iOS (App Store)
- Android (Google Play)

수익 모델:
- 무료 버전 (광고 없음)
- 프리미엄 ($4.99/월)
  - 무제한 작업
  - 고급 통계
  - 테마 추가
  - 우선 지원
```

---

## 12. 향후 개발 로드맵

### 12.1 단기 (3-6개월)
```
- 음성 작업 추가
- 위젯 지원
- 웨어러블 연동 (Apple Watch, Galaxy Watch)
- 더 많은 타이머 모드
```

### 12.2 중기 (6-12개월)
```
- 협업 기능 (작업 공유)
- 습관 트래커
- 일지/저널 기능
- AI 코칭 제안
```

### 12.3 장기 (1년+)
```
- 웹 버전
- 캘린더 통합 (Google, Outlook)
- 전문가 연결 (ADHD 코치)
- 가족/파트너 계정
```

---

## 13. 성공 지표 (KPI)

### 13.1 사용자 참여도
```
- DAU/MAU (일간/월간 활성 사용자)
- 평균 세션 시간
- 주간 리텐션
```

### 13.2 기능 사용률
```
- 작업 완료율
- 타이머 완료율
- 평균 타이머 사용 횟수/일
```

### 13.3 사용자 만족도
```
- 앱 스토어 평점
- NPS (순추천지수)
- 리뷰 감정 분석
```

---

## 14. 개발 일정 예상

```
Phase 1: 기획 및 디자인 (4주)
- 와이어프레임
- UI/UX 디자인
- 프로토타입

Phase 2: MVP 개발 (8주)
- 프론트엔드 개발
- 백엔드/API 개발
- 데이터베이스 구축

Phase 3: 테스트 (4주)
- 내부 QA
- 베타 테스트
- 버그 수정

Phase 4: 출시 준비 (2주)
- 앱 스토어 제출
- 마케팅 준비
- 문서화

총 예상 기간: 18주 (약 4.5개월)
```

---

## 15. 참고 자료

### 15.1 ADHD 관련 연구
```
- Russell Barkley의 실행 기능 이론
- ADDitude Magazine
- CHADD (Children and Adults with ADHD)
```

### 15.2 유사 앱 분석
```
강점 벤치마킹:
- Todoist (깔끔한 UI)
- Forest (집중 타이머, 게임화)
- TickTick (포모도로 + 할 일)
- Brain Focus (ADHD 특화)

차별화 포인트:
- ADHD 사용자 중심 설계
- 유연한 재계획
- 감정 기반 적응
- 죄책감 없는 UX
```

---

## 16. 연락처 및 피드백

```
개발팀 이메일: [설정 필요]
커뮤니티: [Discord/Slack 링크]
버그 리포트: [GitHub Issues 링크]
기능 제안: [양식 링크]
```

---

**문서 버전**: 1.0
**마지막 업데이트**: 2025년 1월
**작성자**: [담당자명]

---

이 기획서는 ADHD를 가진 사람들의 실제 어려움을 해결하기 위해 작성되었습니다. 
개발 과정에서 실제 사용자 피드백을 지속적으로 반영하여 
진정으로 도움이 되는 앱을 만들어가겠습니다.
