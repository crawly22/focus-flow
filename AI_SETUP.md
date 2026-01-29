# 🚀 AI 작업 분해 실행 가이드

## 📝 준비 완료!

- ✅ Claude API 키 설정됨
- ✅ 최신 모델 업데이트 (claude-sonnet-4-20250514)
- ✅ CORS 프록시 서버 생성

---

## 🔧 실행 방법

### 1단계: 의존성 설치

새로운 패키지를 추가했으므로 설치가 필요합니다:

```bash
npm install
```

설치되는 패키지:
- `express` - 프록시 서버
- `cors` - CORS 처리

---

### 2단계: 프록시 서버 + 개발 서버 실행

**터미널 2개**를 열어야 합니다:

#### 터미널 1: 프록시 서버
```bash
npm run proxy
```

**예상 출력:**
```
✅ CORS Proxy running on http://localhost:3001
📝 Forward requests to: http://localhost:3001/api/claude
```

#### 터미널 2: 개발 서버  
```bash
npm run dev
```

**예상 출력:**
```
VITE v5.0.8  ready in 500 ms
➜  Local:   http://localhost:3000/
```

---

## 🧪 테스트

### 1. 브라우저 열기
http://localhost:3000 접속

### 2. 작업 추가
+ 버튼 클릭 → 작업 제목 입력

### 3. AI 분해 버튼 클릭
"🤖 AI로 작업 분해하기" 클릭

**예시 입력:**
- "방 청소하기"
- "보고서 작성"
- "저녁 요리 준비"

### 4. 결과 확인 (2-5초 후)
```
예시 출력 (방 청소하기):

✅ 바닥의 옷과 물건 모으기 (5분)
✅ 책상 위 정리하기 (10분)
✅ 쓰레기 버리기 (5분)
✅ 진공청소기 돌리기 (10분)
✅ 걸레질하기 (10분)
```

---

## 🎯 단축 실행 (한 줄)

### Windows (Command Prompt)
```bash
start cmd /k "npm run proxy" && npm run dev
```

### PowerShell
```powershell
Start-Process cmd -ArgumentList '/k','npm run proxy'; npm run dev
```

---

## ❌ 문제 해결

### "Failed to fetch" 오류
**원인**: 프록시 서버가 실행 중이지 않음

**해결**:
1. 터미널 1에서 `npm run proxy` 실행 확인
2. http://localhost:3001 접속 가능한지 확인

---

### "API key missing" 오류
**원인**: API 키가 프록시로 전달되지 않음

**해결**:
1. `.env` 파일에 `VITE_CLAUDE_API_KEY` 확인
2. 서버 재시작 (Ctrl+C 후 재실행)

---

### "Connection refused" 오류
**원인**: 포트 3001이 이미 사용 중

**해결**:
1. `proxy-server.js` 파일 열기
2. `const PORT = 3001;`을 `const PORT = 3002;`로 변경
3. `src/services/ai.js` 파일 열기
4. `http://localhost:3001`을 `http://localhost:3002`로 변경

---

## 🔐 보안 참고

### 현재 설정 (개발용)
- ✅ 로컬 프록시 서버 사용
- ✅ API 키는 서버 측에서 관리
- ⚠️ 로컬 네트워크에서만 접근 가능

### 프로덕션 배포 시
프록시 서버를 Firebase Functions 또는 Vercel Serverless로 마이그레이션 필요:

```javascript
// Firebase Functions 예시
exports.claudeProxy = functions.https.onRequest(async (req, res) => {
  // proxy-server.js 로직을 여기에 복사
});
```

---

## 📊 성능

- **응답 시간**: 2-5초
- **비용**: 작업 분해 1회 약 $0.001-0.003
- **안정성**: 프록시를 통해 CORS 문제 완전 해결

---

## 🎉 완료!

이제 양쪽 서버가 실행 중이면:

1. ✅ 프록시 서버: http://localhost:3001
2. ✅ 개발 서버: http://localhost:3000
3. 🤖 AI 작업 분해 사용 가능!

---

**Happy Coding! 🎯✨**
