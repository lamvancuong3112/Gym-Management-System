/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)
 * XỬ LÝ ĐĂNG NHẬP & ĐĂNG KÝ (auth.js)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

/**
 * Xử lý sự kiện Submit Form Đăng nhập
 */
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    showToast('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu', 'error');
    return;
  }

  const result = await GymAPI.login(username, password);
  if (result.success) {
    showToast(`Đăng nhập thành công! Chào mừng ${result.user.Fullname}`, 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);
  } else {
    showToast(result.message || 'Tài khoản hoặc mật khẩu không chính xác', 'error');
  }
}

/**
 * Xử lý sự kiện Submit Form Đăng ký
 */
async function handleRegister(e) {
  e.preventDefault();
  const fullname = document.getElementById('regFullname').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  if (!fullname || !username || !password) {
    showToast('Vui lòng điền các thông tin bắt buộc (*)', 'error');
    return;
  }

  // Kiểm tra tên đăng nhập đã tồn tại trong CSDL chưa
  const db = MockDB.getDB();
  const existing = db.users.find(u => u.Username.toLowerCase() === username.toLowerCase());
  if (existing) {
    showToast('Tên đăng nhập đã tồn tại trên hệ thống!', 'error');
    return;
  }

  // Thêm tài khoản mới
  const newUserId = db.users.length + 1;
  const newUser = {
    UserID: newUserId,
    Username: username,
    Fullname: fullname,
    Role: 'Member',
    RoleTitle: 'Hội viên',
    Status: 'Active'
  };
  db.users.push(newUser);

  // Thêm hồ sơ hội viên tương ứng
  const newMemberId = db.members.length + 1;
  db.members.push({
    MemberID: newMemberId,
    Code: `HV-${String(1000 + newMemberId).padStart(4, '0')}`,
    Fullname: fullname,
    Gender: 'Male',
    BirthDate: '2000-01-01',
    Phone: phone,
    Email: email,
    Address: 'TP. Hồ Chí Minh',
    JoinDate: new Date().toISOString().split('T')[0],
    UserID: newUserId,
    PackageName: 'Chưa đăng ký',
    Status: 'Active',
    EndDate: '—'
  });

  MockDB.saveDB(db);
  GymAPI.setCurrentUser(newUser);

  showToast('Đăng ký tài khoản thành công! Đang chuyển đến Dashboard...', 'success');
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 700);
}

/**
 * Hàm hỗ trợ điền nhanh tài khoản mẫu để test chấm bài / demo
 * @param {string} username - Tên đăng nhập mẫu (admin, staff01, trainer01, member01)
 * @param {string} password - Mật khẩu mặc định
 */
function fillDemoAccount(username, password = '123456') {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  if (usernameInput && passwordInput) {
    usernameInput.value = username;
    passwordInput.value = password;
    showToast(`Đã chọn tài khoản mẫu: ${username}`, 'info');
  }
}

/**
 * Mở modal gửi đánh giá góp ý công khai cho hội viên (không cần đăng nhập)
 */
function openPublicFeedbackModal() {
  const modal = document.getElementById('publicFeedbackModal');
  if (!modal) return;
  const form = document.getElementById('publicFeedbackForm');
  if (form) form.reset();
  setFeedbackRating(5);
  openModal('publicFeedbackModal');
}

/**
 * Đặt mức điểm đánh giá sao (1-5 sao)
 */
function setFeedbackRating(rating) {
  const ratingInput = document.getElementById('fbRatingVal');
  if (ratingInput) ratingInput.value = rating;

  const stars = document.querySelectorAll('#fbStarRating .star-btn');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });

  const ratingText = document.getElementById('ratingText');
  if (ratingText) {
    const labels = {
      1: '1/5 Kém ⭐',
      2: '2/5 Tạm được ⭐⭐',
      3: '3/5 Khá ⭐⭐⭐',
      4: '4/5 Tốt ⭐⭐⭐⭐',
      5: '5/5 Tuyệt vời ⭐⭐⭐⭐⭐'
    };
    ratingText.textContent = labels[rating] || `${rating}/5 ⭐`;
  }
}

/**
 * Xử lý khi hội viên gửi đánh giá / feedback
 */
async function handlePublicFeedbackSubmit(e) {
  e.preventDefault();
  const memberName = document.getElementById('fbMemberName').value.trim();
  const trainerSelect = document.getElementById('fbTrainerSelect');
  const trainerId = Number(trainerSelect.value);
  const trainerText = trainerSelect.options[trainerSelect.selectedIndex].text;
  const rating = Number(document.getElementById('fbRatingVal').value) || 5;
  const comment = document.getElementById('fbComment').value.trim();

  if (!memberName || !comment) {
    showToast('Vui lòng nhập Họ tên và Nội dung đánh giá', 'error');
    return;
  }

  const feedbackData = {
    MemberName: memberName,
    TrainerID: trainerId === 0 ? 1 : trainerId,
    TrainerName: trainerId === 0 ? 'Toàn bộ Phòng tập & Cơ sở vật chất' : trainerText.replace('🏋️ HLV ', '').split(' (')[0],
    Rating: rating,
    Comment: comment,
    FeedbackDate: new Date().toISOString().split('T')[0]
  };

  await GymAPI.addFeedback(feedbackData);

  showToast(`Cảm ơn bạn ${memberName} đã gửi đánh giá & góp ý quý báu!`, 'success');
  closeModal('publicFeedbackModal');
}

// Xuất hàm ra global
window.fillDemoAccount = fillDemoAccount;
window.openPublicFeedbackModal = openPublicFeedbackModal;
window.setFeedbackRating = setFeedbackRating;
window.handlePublicFeedbackSubmit = handlePublicFeedbackSubmit;

