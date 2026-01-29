# 🚀 FocusFlow 빠른 시작 가이드

## PowerShell 실행 정책 문제 해결

Windows에서 npm 명령어가 실행되지 않는 경우:

### 방법 1: 관리자 권한으로 PowerShell 실행 정책 변경
```powershell
# 관리자 권한으로 PowerShell 실행 후
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 방법 2: Command Prompt (cmd) 사용
1. `Win + R` 누르기
2. `cmd` 입력 후 Enter
3. 프로젝트 폴더로 이동
4. npm 명령어 실행

---

## 1단계: 의존성 설치

프로젝트 폴더에서 다음 명령어 실행:

```bash
npm install
```

설치되는 패키지:
- `firebase@^10.7.1` - Firebase SDK
- `vite@^5.0.8` - 빌드 도구 및 개발 서버

---

## 2단계: Firebase 설정

### A. Firebase 프로젝트 생성

1. **Firebase Console 접속**
   - https://console.firebase.google.com/ 방문
   - Google 계정으로 로그인

2. **프로젝트 추가**
   - "프로젝트 추가" 클릭
   - 프로젝트 이름 입력 (예: `focusflow-test`)
   - Google 애널리틱스 비활성화 (선택사항)
   - "프로젝트 만들기" 클릭

### B. Authentication 설정

1. 왼쪽 메뉴에서 **"Authentication"** 선택
2. "시작하기" 클릭
3. "로그인 방법" 탭에서 **"익명"** 찾기
4. "사용 설정" 토글을 ON으로 변경
5. "저장" 클릭

### C. Firestore Database 설정

1. 왼쪽 메뉴에서 **"Firestore Database"** 선택
2. "데이터베이스 만들기" 클릭
3. **"테스트 모드에서 시작"** 선택
4. 위치 선택: **"asia-northeast3 (Seoul)"** 권장
5. "사용 설정" 클릭

### D. 웹 앱 등록

1. 프로젝트 설정 (⚙️ 아이콘) 클릭
2. "내 앱"에서 웹 아이콘 (`</>`) 클릭
3. 앱 닉네임 입력: `FocusFlow Web`
4. "Firebase 호스팅 설정" 체크 해제
5. "앱 등록" 클릭
6. **Firebase 구성** 복사 (다음 단계에서 사용)

---

## 3단계: 환경 변수 설정

1. `.env.template` 파일을 `.env`로 복사:
   ```bash
   copy .env.template .env
   ```

2. `.env` 파일을 열고 Firebase 구성 정보 입력:

   ```env
   VITE_FIREBASE_API_KEY=AIzaSy... (복사한 apiKey)
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

**중요**: Firebase 콘솔에서 복사한 값을 정확히 입력하세요!

---

## 4단계: 개발 서버 실행

```bash
npm run dev
```

성공 시 다음과 같은 메시지가 표시됩니다:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

브라우저가 자동으로 열리거나, http://localhost:3000 을 직접 방문하세요.

---

## 5단계: 앱 테스트

### 첫 작업 만들기
1. 우측 하단의 **+ 버튼** 클릭
2. 작업 제목 입력 (예: "FocusFlow 테스트")
3. 긴급도/중요도 슬라이더 조정
4. "저장" 클릭

### 타이머 시작하기
1. 생성된 작업 카드에서 **▶️ 버튼** 클릭
2. 전체화면 타이머 확인
3. 일시정지/재개 테스트
4. "완료" 또는 "건너뛰기" 클릭

### 통계 확인하기
1. 하단 네비게이션에서 **📊 통계** 탭 클릭
2. 완료한 작업 수 확인
3. 히트맵 확인

---

## 문제 해결

### "User authenticated" 로그가 안 보이는 경우
- 브라우저 콘솔(F12) 확인
- `.env` 파일 내용 확인
- Firebase Authentication이 활성화되었는지 확인

### "Permission denied" 오류
- Firestore 보안 규칙 확인 (directives/firebase_setup.md 참조)
- 테스트 모드로 설정되었는지 확인

### CORS 오류
- Firebase Console → Authentication → 설정 → 승인된 도메인에 `localhost` 추가

### 작업이 저장되지 않는 경우
1. Firebase Console → Firestore Database 방문
2. "데이터" 탭에서 `tasks` 컬렉션 확인
3. 데이터가 없다면 브라우저 콘솔에서 오류 확인

---

## 다음 단계

- ✅ **Firebase Security Rules 설정**: `directives/firebase_setup.md` 참조
- ✅ **커스터마이징**: 색상, 폰트, 타이머 시간 등 조정
- ✅ **배포**: `directives/deploy.md` 참조하여 Firebase Hosting에 배포

---

## 도움이 필요하신가요?

- 📖 [README.md](README.md) - 전체 문서
- 🔧 [directives/firebase_setup.md](directives/firebase_setup.md) - Firebase 상세 설정
- 🚀 [directives/deploy.md](directives/deploy.md) - 배포 가이드

---

**즐거운 FocusFlow 경험 되세요! 🎯✨**
