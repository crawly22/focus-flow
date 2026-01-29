# FocusFlow 설정 체크리스트

## ✅ 프로젝트 생성 완료

- [x] 프로젝트 구조 생성
- [x] 3-Layer Architecture 구성
- [x] package.json 설정
- [x] Vite 구성
- [x] .gitignore 설정

## 📦 다음 단계: 설치 및 설정

### 1단계: 의존성 설치

**PowerShell 실행 정책 문제가 있는 경우:**

#### 방법 A: 관리자 PowerShell에서 실행
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 방법 B: Command Prompt 사용
1. `Win + R` → `cmd` 입력
2. 프로젝트 폴더로 이동:
   ```bash
   cd "C:\Users\이원근\Desktop\0129 테스트"
   ```
3. 의존성 설치:
   ```bash
   npm install
   ```

**설치 확인:**
- [ ] `node_modules` 폴더 생성됨
- [ ] firebase 패키지 설치됨
- [ ] vite 패키지 설치됨

---

### 2단계: Firebase 프로젝트 생성

**Firebase Console**: https://console.firebase.google.com/

#### A. 프로젝트 생성
- [ ] Firebase Console에 로그인
- [ ] "프로젝트 추가" 클릭
- [ ] 프로젝트 이름 입력 (예: `focusflow-test`)
- [ ] Google Analytics 비활성화 (선택)
- [ ] 프로젝트 생성 완료

#### B. Authentication 설정
- [ ] Authentication → "시작하기" 클릭
- [ ] "익명" 로그인 방법 활성화
- [ ] 저장

#### C. Firestore Database 생성
- [ ] Firestore Database → "데이터베이스 만들기"
- [ ] "테스트 모드로 시작" 선택
- [ ] 위치: `asia-northeast3 (Seoul)` 선택
- [ ] 데이터베이스 생성 완료

#### D. 보안 규칙 설정
1. Firestore Database → 규칙 탭
2. 다음 규칙 복사/붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                          userId == request.auth.uid;
    }
    
    match /timerSessions/{sessionId} {
      allow read, write: if request.auth != null && 
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /moodCheckIns/{checkInId} {
      allow read, write: if request.auth != null && 
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

- [ ] 규칙 게시 클릭

#### E. 웹 앱 등록
- [ ] 프로젝트 설정 (⚙️) → "내 앱" 섹션
- [ ] 웹 아이콘 (`</>`) 클릭
- [ ] 앱 닉네임: `FocusFlow Web`
- [ ] "앱 등록" 클릭
- [ ] Firebase 구성 값 복사 (다음 단계에서 사용)

---

### 3단계: 환경 변수 설정

#### A. .env 파일 생성
Command Prompt 또는 PowerShell에서:
```bash
copy .env.template .env
```

#### B. Firebase 구성 입력
`.env` 파일을 텍스트 에디터로 열고 다음 값 입력:

```env
VITE_FIREBASE_API_KEY=AIzaSy... (Firebase 콘솔에서 복사한 apiKey)
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789...
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...
```

**체크리스트:**
- [ ] `.env` 파일 생성됨
- [ ] `VITE_FIREBASE_API_KEY` 입력됨
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` 입력됨
- [ ] `VITE_FIREBASE_PROJECT_ID` 입력됨
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` 입력됨
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` 입력됨
- [ ] `VITE_FIREBASE_APP_ID` 입력됨

---

### 4단계: 개발 서버 실행

```bash
npm run dev
```

**예상 출력:**
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**확인 사항:**
- [ ] 서버가 정상적으로 시작됨
- [ ] 브라우저가 자동으로 열림 또는 http://localhost:3000 접속
- [ ] 로딩 화면 표시 후 앱 화면 표시
- [ ] 브라우저 콘솔(F12)에 "User authenticated" 로그 표시

---

### 5단계: 기능 테스트

#### A. 작업 추가 테스트
- [ ] 우측 하단 + 버튼 클릭
- [ ] 작업 제목 입력 (예: "테스트 작업")
- [ ] 긴급도/중요도 슬라이더 조정
- [ ] 저장 버튼 클릭
- [ ] 토스트 알림 표시: "작업이 추가되었습니다! 🎯"
- [ ] 작업 카드가 화면에 표시됨

#### B. Firebase 데이터 확인
- [ ] Firebase Console → Firestore Database → 데이터 탭
- [ ] `tasks` 컬렉션에 새 문서 생성됨
- [ ] 문서 내용에 작업 제목, 긴급도, 중요도 표시

#### C. 타이머 테스트
- [ ] 작업 카드의 ▶️ 버튼 클릭
- [ ] 전체화면 타이머 표시
- [ ] 원형 진행바 동작
- [ ] 시간 카운트다운
- [ ] 일시정지 버튼(⏸️) 클릭 → 타이머 일시정지
- [ ] 재생 버튼(▶️) 클릭 → 타이머 재개
- [ ] 완료 버튼(✅) 클릭 → 타이머 종료
- [ ] 토스트 알림: "타이머 세션이 완료되었습니다! 🎯"

#### D. 작업 완료 테스트
- [ ] 작업 카드의 체크박스 클릭
- [ ] 체크 애니메이션 표시
- [ ] 작업 카드가 회색으로 변경
- [ ] 제목에 취소선 표시
- [ ] 토스트 알림에 긍정적 메시지 표시

#### E. 통계 뷰 테스트
- [ ] 하단 네비게이션 📊 탭 클릭
- [ ] 통계 카드 표시 (완료 작업, 집중 시간 등)
- [ ] 28일 히트맵 표시
- [ ] 배지 섹션 표시

---

## 🎉 완료 확인

모든 항목을 체크했다면 FocusFlow가 정상적으로 작동하는 것입니다!

### 다음 작업

- [ ] 프로필 사진 추가 (선택)
- [ ] 커스텀 카테고리 추가
- [ ] 더 많은 작업 생성
- [ ] 배포 준비 (directives/deploy.md 참조)

---

## 🐛 문제 해결

### 문제: "User authenticated" 로그가 안 보임
**해결:**
1. `.env` 파일 내용이 올바른지 확인
2. Firebase Authentication이 활성화되었는지 확인
3. 브라우저 콘솔에서 오류 메시지 확인

### 문제: 작업이 저장되지 않음
**해결:**
1. Firestore 보안 규칙 확인
2. 테스트 모드로 설정되었는지 확인
3. 브라우저 콘솔에 "Permission denied" 오류가 있는지 확인

### 문제: CORS 오류
**해결:**
1. Firebase Console → Authentication → 설정
2. 승인된 도메인에 `localhost` 추가

### 문제: npm 명령어 실행 안됨
**해결:**
1. Command Prompt (cmd) 사용
2. 또는 PowerShell 실행 정책 변경 (QUICKSTART.md 참조)

---

## 📚 참고 문서

- **QUICKSTART.md**: 빠른 시작 가이드
- **README.md**: 전체 프로젝트 문서
- **PROJECT_SUMMARY.md**: 프로젝트 완성 보고서
- **directives/firebase_setup.md**: Firebase 상세 설정
- **directives/deploy.md**: 배포 가이드

---

**축하합니다! FocusFlow를 성공적으로 설정했습니다! 🎯✨**

이제 ADHD 친화적인 작업 관리 앱을 마음껏 사용하세요!
