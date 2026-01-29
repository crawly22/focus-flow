# FocusFlow 배포 가이드 (Vercel)

FocusFlow를 인터넷에 배포하여 스마트폰이나 다른 컴퓨터에서 접속하는 방법입니다. **Vercel**을 사용하면 무료로 쉽게 배포할 수 있습니다.

## 1. GitHub에 코드 올리기
먼저 작성한 코드를 GitHub 저장소에 올려야 합니다.

1. [GitHub](https://github.com)에 로그인하고 **New Repository**를 클릭합니다.
2. 저장소 이름(예: `focus-flow`)을 짓고 **Create repository**를 클릭합니다.
3. 터미널(VS Code)에서 다음 명령어를 순서대로 입력합니다:

```bash
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/사용자아이디/저장소이름.git
git push -u origin main
```
> (만약 `git remote` 에러가 나면 `git remote remove origin` 후 다시 하세요)

## 2. Vercel에 배포하기
1. [Vercel](https://vercel.com)에 접속하여 GitHub 아이디로 로그인합니다.
2. 대시보드에서 **Add New...** > **Project**를 클릭합니다.
3. 방금 올린 `focus-flow` 저장소 옆의 **Import** 버튼을 클릭합니다.
4. **Configure Project** 화면에서 "Environment Variables" 섹션을 엽니다.

## 3. 환경 변수 설정 (중요! ⭐)
이 단계가 가장 중요합니다. AI 기능과 Firebase가 작동하려면 키 값을 넣어줘야 합니다.
**Environment Variables** 섹션에 다음 값들을 하나씩 추가합니다. (로컬의 `.env` 내용을 복사하세요)

| Key (이름) | Value (값) |
|---|---|
| `VITE_CLAUDE_API_KEY` | `sk-...` (당신의 Claude API 키) |
| `VITE_FIREBASE_API_KEY` | `.env` 파일 참조 |
| `VITE_FIREBASE_AUTH_DOMAIN` | `.env` 파일 참조 |
| `VITE_FIREBASE_PROJECT_ID` | `.env` 파일 참조 |
| `VITE_FIREBASE_STORAGE_BUCKET` | `.env` 파일 참조 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `.env` 파일 참조 |
| `VITE_FIREBASE_APP_ID` | `.env` 파일 참조 |
| `VITE_FIREBASE_MEASUREMENT_ID` | `.env` 파일 참조 |

5. 모든 변수를 추가했으면 **Deploy** 버튼을 클릭합니다.
6. 약 1분 후 배포가 완료되고 사이트 주소(예: `https://focus-flow.vercel.app`)가 생성됩니다! 🎉

## 4. Firebase 도메인 허용
마지막으로 Firebase가 배포된 사이트를 신뢰하도록 설정해야 로그인이 됩니다.

1. [Firebase Console](https://console.firebase.google.com/) 접속 > 프로젝트 선택.
2. 좌측 메뉴: **빌드** > **Authentication**.
3. **Settings (설정)** 탭 클릭 > **Authorized domains (승인된 도메인)**.
4. **도메인 추가** 클릭.
5. Vercel에서 생성된 도메인(예: `focus-flow.vercel.app`)을 입력하고 **추가**.

---

## ⚠️ 주의사항
- **API 비용**: 배포된 사이트 주소를 다른 사람에게 공개하면 당신의 Claude API가 사용되어 비용이 청구될 수 있습니다. 개인용으로만 사용하거나 로그인 기능을 강화하세요.
- **수정사항 반영**: 코드를 수정하고 `git push`만 하면 Vercel이 자동으로 감지하여 다시 배포합니다.
