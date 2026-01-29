# FocusFlow 🎯

> ADHD를 위한 계획 및 실행 지원 웹 애플리케이션

FocusFlow는 ADHD를 가진 사람들이 계획을 세우고 실행하는 과정에서 겪는 어려움을 최소화하고, 작업 완수율을 높이기 위한 웹 애플리케이션입니다.

![FocusFlow Preview](https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=FocusFlow+-+ADHD+Planning+App)

## ✨ 주요 기능

### 📋 작업 관리
- **작업 분해**: 큰 작업을 작고 실행 가능한 단계로 분해
- **우선순위 설정**: 긴급도와 중요도 기반 우선순위 매트릭스
- **단계별 체크리스트**: 각 단계를 체크하며 진행
- **진행률 추적**: 실시간 진행 상황 시각화

### ⏱️ 타이머 기능
- **포모도로 타이머**: 25분 집중 + 5분 휴식
- **커스텀 타이머**: 작업에 맞는 시간 설정
- **시각적 피드백**: 원형 진행 바로 남은 시간 표시
- **완료 알림**: 타이머 종료 시 소리와 시각적 피드백

### 📊 통계 및 성취
- **일일 진행도**: 오늘 완료한 작업 수와 진행률
- **28일 히트맵**: GitHub 스타일의 활동 히트맵
- **연속 달성 스트릭**: 연속으로 작업한 날짜 추적
- **배지 시스템**: 성취에 따른 배지 획득

### 💎 ADHD 친화적 디자인
- **즉각적 피드백**: 모든 액션에 즉시 반응하는 애니메이션
- **긍정적 강화**: 작은 성취도 축하하는 메시지
- **유연한 구조**: 계획 변경이 쉽고 부담 없음
- **시각적 명확성**: 큰 버튼, 명확한 색상, 충분한 여백

## 🏗️ 프로젝트 구조

이 프로젝트는 **3-Layer Architecture**를 따릅니다 (Agent.md 참조):

```
focusflow/
├── directives/              # Layer 1: 지시사항 (What to do)
│   ├── firebase_setup.md    # Firebase 설정 가이드
│   └── deploy.md            # 배포 가이드
│
├── execution/               # Layer 3: 실행 스크립트 (Doing)
│   └── (Python scripts for automation)
│
├── src/                     # Layer 2: 오케스트레이션 (Decision making)
│   ├── components/          # UI 컴포넌트
│   │   ├── Task.js          # 작업 카드 컴포넌트
│   │   ├── Timer.js         # 타이머 컴포넌트
│   │   └── AddTaskModal.js  # 작업 추가 모달
│   │
│   ├── views/               # 페이지 뷰
│   │   ├── TodayView.js     # 오늘 할 일 뷰
│   │   └── StatsView.js     # 통계 뷰
│   │
│   ├── firebase/            # Firebase 서비스
│   │   ├── config.js        # Firebase 초기화
│   │   └── database.js      # Firestore 서비스
│   │
│   ├── utils/               # 유틸리티
│   │   ├── store.js         # 상태 관리
│   │   └── helpers.js       # 헬퍼 함수
│   │
│   ├── styles/              # 스타일시트
│   │   ├── index.css        # 메인 CSS + 디자인 시스템
│   │   ├── components.css   # 컴포넌트 스타일
│   │   └── modals.css       # 모달 & 타이머 스타일
│   │
│   └── main.js              # 애플리케이션 진입점
│
├── public/                  # 정적 파일
├── .tmp/                    # 임시 파일 (gitignore)
├── index.html               # HTML 진입점
├── package.json             # 의존성
└── vite.config.js           # Vite 설정
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- Firebase 계정 (무료)

### 1. 프로젝트 클론 및 설치

```bash
# 의존성 설치
npm install
```

### 2. Firebase 설정

#### 2.1 Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication → Anonymous 로그인 활성화
3. Firestore Database 생성 (테스트 모드로 시작)

자세한 내용은 `directives/firebase_setup.md` 참조

#### 2.2 환경 변수 설정

`.env.template`을 `.env`로 복사하고 Firebase 설정 정보 입력:

```bash
cp .env.template .env
```

`.env` 파일 수정:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저가 자동으로 열리며 `http://localhost:3000`에서 앱을 확인할 수 있습니다.

### 4. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

## 📱 기능 사용 가이드

### 작업 추가하기
1. 우측 하단의 **+ 버튼** 클릭
2. 작업 제목 입력 (필수)
3. 긴급도/중요도 설정
4. 필요시 세부 단계 추가
5. **저장** 버튼 클릭

### 타이머 시작하기
1. 작업 카드의 **▶️ 버튼** 클릭
2. 전체화면 타이머 시작
3. 일시정지/재개/완료 가능
4. 타이머 완료 시 자동으로 통계에 반영

### 통계 확인하기
1. 하단 네비게이션에서 **📊 통계** 탭 선택
2. 완료한 작업 수, 집중 시간, 연속 달성 일수 확인
3. 28일 히트맵으로 활동 패턴 파악
4. 획득한 배지 확인

## 🎨 디자인 철학

### ADHD 친화적 원칙

1. **시각적 명확성**
   - 큰 버튼 (최소 48x48px)
   - 명확한 색상 구분
   - 충분한 여백과 간격

2. **즉각적 피드백**
   - 모든 액션에 애니메이션 반응
   - 체크박스 완료 시 축하 메시지
   - 햅틱 피드백 (모바일)

3. **단순한 네비게이션**
   - 최대 3단계 깊이
   - 주요 기능은 1-2탭 이내
   - 항상 뒤로가기 가능

4. **압도감 최소화**
   - 한 화면에 3-5개 항목만
   - 긴 리스트는 접기/펼치기
   - 빈 상태 메시지로 안내

5. **에러 용인**
   - 실행 취소 기능
   - 확인 없는 삭제 금지
   - 자동 저장

### 색상 팔레트

- **Primary (집중)**: `#4A90E2` - 차분한 파란색
- **Success (완료)**: `#7ED321` - 부드러운 초록색
- **Warning (긴급)**: `#F5A623` - 따뜻한 주황색
- **Danger (주의)**: `#FF6B6B` - 연한 빨강

## 🔧 기술 스택

- **Frontend**: Vanilla JavaScript (ES6+)
- **Build Tool**: Vite 5.x
- **Styling**: CSS3 (Custom Properties, Flexbox, Grid)
- **Backend**: Firebase
  - Authentication (Anonymous)
  - Firestore Database
  - Hosting
- **Architecture**: 3-Layer (Directive → Orchestration → Execution)

## 📚 주요 파일 설명

### `src/main.js`
애플리케이션 진입점. Firebase 인증, 뷰 네비게이션, 전역 이벤트 리스너 설정.

### `src/firebase/database.js`
Firestore CRUD 작업을 위한 서비스 레이어. TaskService, UserService, TimerService 제공.

### `src/components/Task.js`
작업 카드 렌더링 및 상호작용 처리. 체크박스, 진행률, 단계 완료 로직.

### `src/components/Timer.js`
전체화면 타이머 컴포넌트. 원형 SVG 진행 바, 일시정지/재개 기능.

### `src/styles/index.css`
디자인 시스템의 핵심. CSS Variables, 타이포그래피, 레이아웃, 애니메이션.

## 🎯 로드맵

### MVP (완료)
- ✅ 작업 추가/수정/삭제
- ✅ 작업 분해 (수동)
- ✅ 포모도로 타이머
- ✅ 일일 진행도 표시
- ✅ 기본 통계

### Phase 2 (계획 중)
- 🔲 음성 작업 추가
- 🔲 AI 작업 분해 제안
- 🔲 감정 체크인 기능
- 🔲 유연한 재계획 기능
- 🔲 습관 트래커

### Phase 3 (향후)
- 🔲 PWA 지원 (오프라인 사용)
- 🔲 다크 모드 토글
- 🔲 데이터 내보내기
- 🔲 협업 기능

## 🤝 기여하기

기여는 언제나 환영합니다! 이슈를 열거나 Pull Request를 보내주세요.

### 개발 워크플로우
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자유롭게 사용하세요!

## 💬 문의

- 버그 리포트: GitHub Issues
- 기능 제안: GitHub Discussions

---

**Made with ❤️ for the ADHD community**

Let's make task management less overwhelming, one focus session at a time! 🎯✨
