const resultElement = document.getElementById('result')
let cooldown = false
let lastScanTime = Date.now()

// ✅ 10초 이상 인식 안 된 경우 자동 안내
setInterval(() => {
  if (!cooldown && Date.now() - lastScanTime > 10000) {
    resultElement.textContent = '📣 QR 코드를 화면에 보여주세요'
  }
}, 1000)

// ✅ QR 인식 성공 시
function onScanSuccess(decodedText, decodedResult) {
  if (cooldown) {
    console.log('🕒 쿨타임 중 - 인증 무시됨')
    return
  }

  cooldown = true // ✅ 인증 시도 직후 쿨타임 진입
  setTimeout(() => {
    cooldown = false
    resultElement.textContent = '📷 다시 인식 준비 완료'
    console.log('✅ 쿨타임 해제됨')
  }, 3000) // ✅ 쿨타임: 3초

  lastScanTime = Date.now() // 마지막 인식 시간 갱신
  console.log('🎯 QR 코드 인식 성공:', decodedText)
  resultElement.textContent = '✅ QR 코드 내용: ' + decodedText

  fetch('http://127.0.0.1:8000/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ qr_code: decodedText }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('🔐 인증 결과:', data)
      lastScanTime = Date.now()

      if (data.status === 'success') {
        resultElement.textContent += `\n✅ 인증 성공: ${data.message}`
      } else if (data.message.includes('만료')) {
        resultElement.textContent += `\n⏳ 인증 실패: ${data.message}`
      } else if (data.message.includes('등록되지 않은')) {
        resultElement.textContent += `\n🚫 인증 실패: ${data.message}`
      } else {
        resultElement.textContent += `\n❌ 인증 실패: ${data.message}`
      }
    })
    .catch((error) => {
      console.error('🚨 인증 요청 실패:', error)
      resultElement.textContent += '\n🚨 서버 통신 실패!'
    })
}

// ✅ QR 인식 실패 시 (로그만 남김)
function onScanFailure(error) {
  // console.warn("⚠️ QR 인식 실패:", error);
}

// ✅ 카메라 시작
const html5QrCode = new Html5Qrcode('reader')

Html5Qrcode.getCameras()
  .then((cameras) => {
    if (cameras && cameras.length > 0) {
      const cameraId = cameras[0].id
      console.log('📷 카메라 시작:', cameraId)

      html5QrCode
        .start(
          cameraId,
          {
            fps: 10,
            // qrbox 제거 → 전체 화면에서 인식
          },
          onScanSuccess,
          onScanFailure
        )
        .then(() => {
          console.log('✅ QR 스캔 시작됨')
        })
        .catch((err) => {
          console.error('❌ QR 스캔 시작 실패:', err)
          resultElement.textContent = '❌ QR 스캔 시작 실패: ' + err
        })
    } else {
      console.error('🚫 카메라 없음')
      resultElement.textContent = '🚫 카메라를 찾을 수 없습니다.'
    }
  })
  .catch((err) => {
    console.error('🚫 카메라 접근 실패:', err)
    resultElement.textContent = '🚫 카메라 접근 실패: ' + err
  })

// 🎯 관리자 포탈 진입
const secretLink = document.getElementById('secret-link')
const modal = document.getElementById('password-modal')
const input = document.getElementById('password-input')
const submitBtn = document.getElementById('password-submit')
const cancelBtn = document.getElementById('password-cancel')

secretLink.addEventListener('click', () => {
  modal.style.display = 'block'
  input.value = ''
  input.focus()
})

submitBtn.addEventListener('click', () => {
  const password = input.value
  if (password === 'admin') {
    window.location.href = 'admin.html'
  } else {
    alert('❌ 비밀번호가 틀렸습니다')
    modal.style.display = 'none'
  }
})

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    submitBtn.click()
  }
})

cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none'
})

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none'
  }
})
