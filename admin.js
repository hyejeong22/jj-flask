document.addEventListener('DOMContentLoaded', function () {
  console.log('✅ admin.js loaded!')

  // ← 메인 페이지로 복귀 버튼
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'index.html'
  })

  // ← 인증 로그 조회
  fetch('http://127.0.0.1:8000/logs')
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector('#log-table tbody')
      data.forEach((log) => {
        const row = document.createElement('tr')
        row.innerHTML = `
  <td>${log.id}</td>
  <td>${log.qr_code}</td>
  <td>${log.status === 'success' ? '✅ 성공' : '❌ 실패'}</td>
  <td>${log.phone_number || '-'}</td>
  <td>${log.memo || '-'}</td>
  <td>${new Date(log.timestamp).toLocaleString()}</td>
`
        tbody.appendChild(row)
      })
    })
    .catch((err) => {
      console.error('로그 불러오기 실패:', err)
    })

  // ← QR 생성 폼 처리
  document.getElementById('qr-form').addEventListener('submit', function (e) {
    e.preventDefault()
    console.log('🚀 QR 생성 버튼 눌림!')

    const phone = document.getElementById('phone').value
    const duration = parseInt(document.getElementById('duration').value)
    const memo = document.getElementById('memo').value
    const result = document.getElementById('qr-result')

    console.log('요청 보냄', {
      phone_number: phone,
      duration_minutes: duration,
      memo: memo,
    })

    fetch('http://127.0.0.1:8000/generate_qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: phone,
        duration_minutes: duration,
        memo: memo,
      }),
    })
      .then((res) => {
        console.log('✅ 응답 도착:', res)
        return res.json()
      })
      .then((data) => {
        console.log('📦 응답 JSON:', data)
        result.textContent = `✅ 생성된 QR: ${data.qr_code}`

        // ✅ QR 이미지 생성
        const qrImageDiv = document.getElementById('qr-image')
        qrImageDiv.innerHTML = ''
        new QRCode(qrImageDiv, {
          text: data.qr_code,
          width: 200,
          height: 200,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H,
        })
      })
      .catch((err) => {
        console.error('❌ QR 생성 실패:', err)
        result.textContent = '❌ QR 생성 실패 (JS 오류)'
      })
  })
})

let currentPage = 1

function loadLogs(page = 1) {
  const limit = 20
  const skip = (page - 1) * limit
  fetch(`http://127.0.0.1:8000/logs?skip=${skip}&limit=${limit}`)
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector('#log-table tbody')
      tbody.innerHTML = '' // 기존 로그 지우기

      data.forEach((log) => {
        const row = document.createElement('tr')
        row.innerHTML = `
  <td>${log.id}</td>
  <td>${log.qr_code}</td>
  <td>${log.status === 'success' ? '✅ 성공' : '❌ 실패'}</td>
  <td>${log.phone_number || '-'}</td>
  <td>${log.memo || '-'}</td>
  <td>${new Date(log.timestamp).toLocaleString()}</td>
`
        tbody.appendChild(row)
      })

      // 페이지 정보 업데이트
      document.getElementById('page-info').textContent = `${page} 페이지`
      currentPage = page
    })
    .catch((err) => {
      console.error('로그 불러오기 실패:', err)
    })
}

// 페이지네이션 버튼
document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) loadLogs(currentPage - 1)
})
document.getElementById('next-page').addEventListener('click', () => {
  loadLogs(currentPage + 1)
})

// 첫 페이지 로드
loadLogs(1)
