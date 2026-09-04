/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)
 * ĐIỀU KHIỂN PHÂN HỆ HỘI VIÊN, ĐIỂM DANH, INBODY & GIÁO ÁN (member.js)
 * ==============================================================================
 */

let currentTab = 'members';

document.addEventListener('DOMContentLoaded', async () => {
  initMemberTabsFromHash();
  window.addEventListener('hashchange', initMemberTabsFromHash);
  
  await loadMembers();
  await loadAttendanceList();
  await loadInBodyProgress();
  await loadWorkoutPlans();
  populatePackageSelects();
  populateMemberDropdowns();
});

/**
 * Điều hướng Tab thông qua URL hash (#members, #attendance, #progress, #workout_plans, #my_package)
 */
function initMemberTabsFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (['members', 'attendance', 'progress', 'workout_plans', 'my_package'].includes(hash)) {
    switchMemberTab(hash);
  } else {
    const currentUser = (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser) ? GymAPI.getCurrentUser() : { Role: 'Admin' };
    if (currentUser.Role === 'Member') {
      switchMemberTab('my_package');
    } else {
      switchMemberTab('members');
    }
  }
}

/**
 * Chuyển đổi qua lại giữa các tab chức năng trong trang Hội viên
 * @param {string} tabId - Tên tab
 */
function switchMemberTab(tabId) {
  currentTab = tabId;

  const titles = {
    members: { title: '<i class="fa fa-user-friends text-red"></i> Quản lý Hội viên', sub: 'Quản lý hồ sơ học viên, thông tin liên hệ và gói tập đăng ký' },
    my_package: { title: '<i class="fa fa-box text-red"></i> Gói Tập Của Tôi', sub: 'Thông tin chi tiết gói tập đang kích hoạt và quyền lợi sử dụng' },
    attendance: { title: '<i class="fa fa-id-badge text-green"></i> Điểm danh Ra/Vào Phòng tập', sub: 'Theo dõi lượt check-in / check-out của học viên hàng ngày' },
    progress: { title: '<i class="fa fa-heartbeat text-red"></i> Theo dõi Chỉ số InBody', sub: 'Ghi nhận cân nặng, chiều cao, tỉ lệ mỡ và khối lượng cơ' },
    workout_plans: { title: '<i class="fa fa-dumbbell text-yellow"></i> Giáo án & Kế hoạch Luyện tập', sub: 'Thiết kế chương trình tập luyện compound, cardio cá nhân hóa' }
  };

  const titleEl = document.getElementById('memberPageTitle');
  const subEl = document.getElementById('memberPageSubtitle');
  if (titleEl && titles[tabId]) titleEl.innerHTML = titles[tabId].title;
  if (subEl && titles[tabId]) subEl.textContent = titles[tabId].sub;

  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.style.display = sec.id === `section_${tabId}` ? 'block' : 'none';
  });

  if (tabId === 'workout_plans') {
    loadWorkoutPlans();
  } else if (tabId === 'attendance') {
    loadAttendanceList();
  } else if (tabId === 'progress') {
    loadInBodyProgress();
  } else if (tabId === 'members') {
    loadMembers();
  }

  if (typeof initSidebarNavigation === 'function') {
    initSidebarNavigation();
  }
}




// ==============================================================================
// 1. QUẢN LÝ DANH SÁCH HỘI VIÊN (CRUD)
// ==============================================================================

async function loadMembers(query = '', statusFilter = 'all') {
  const tableBody = document.getElementById('memberTableBody');
  if (!tableBody) return;

  let members = await GymAPI.getMembers(query);
  if (statusFilter !== 'all') {
    members = members.filter(m => m.Status === statusFilter);
  }

  const memberCountEl = document.getElementById('totalMemberCount');
  if (memberCountEl) memberCountEl.textContent = `${members.length} Hội viên`;

  const currentUser = (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser) ? GymAPI.getCurrentUser() : { Role: 'Admin' };
  const isAdmin = currentUser.Role === 'Admin' || currentUser.Role === 'Manager';

  tableBody.innerHTML = members.map(m => {
    const isPaid = m.PaymentStatus === 'Paid' || m.Status === 'Active';
    const isPending = m.PaymentStatus === 'Pending' || m.Status === 'Pending' || m.Status === 'Chờ thanh toán';
    const isExpired = m.Status === 'Expired' || m.Status === 'Hết hạn';

    let paymentHtml = '';
    let statusHtml = '';

    if (isPending) {
      paymentHtml = `
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span class="badge badge-yellow" style="font-size: 11px; padding: 2px 8px; width: fit-content;"><i class="fa fa-clock"></i> Chờ thanh toán</span>
          <span style="font-size: 11.5px; color: #FF334B; font-weight: 700;">Chưa thu tiền</span>
        </div>
      `;
      statusHtml = `<span class="badge badge-yellow" style="font-size: 11.5px;">Chờ kích hoạt</span>`;
    } else if (isExpired) {
      paymentHtml = `
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span class="badge badge-red" style="font-size: 11px; padding: 2px 8px; width: fit-content;"><i class="fa fa-ban"></i> Hết hạn gói</span>
          <span style="font-size: 11.5px; color: #9CA3AF;">${m.PaymentMethod || 'Đã tất toán'}</span>
        </div>
      `;
      statusHtml = `<span class="badge badge-red" style="font-size: 11.5px;">Đã hết hạn</span>`;
    } else {
      paymentHtml = `
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span class="badge badge-green" style="font-size: 11px; padding: 2px 8px; width: fit-content;"><i class="fa fa-check-circle"></i> Đã thanh toán</span>
          <span style="font-size: 11.5px; color: #60A5FA; font-weight: 600;"><i class="fa fa-credit-card" style="font-size: 10px;"></i> ${m.PaymentMethod || 'VietQR'}</span>
        </div>
      `;
      statusHtml = `<span class="badge badge-green" style="font-size: 11.5px;">Đang hoạt động</span>`;
    }

    const priceText = m.Price ? formatVND(m.Price) : '';

    return `
      <tr>
        <td>
          <div class="member-avatar-cell">
            <div class="avatar-circle">${m.Fullname.split(' ').pop()[0]}</div>
            <div>
              <div style="font-weight: 700; color: #FFFFFF;">${m.Fullname}</div>
              <div style="font-size: 12px; color: var(--text-muted);">${m.Email || 'Chưa cập nhật email'}</div>
            </div>
          </div>
        </td>
        <td class="code-highlight" style="font-weight: 800;">${m.Code || `HV-${m.MemberID}`}</td>
        <td>${m.Phone || '—'}</td>
        <td>
          <div style="font-weight: 700; color: #FFFFFF;">${m.PackageName || 'Chưa đăng ký'}</div>
          ${priceText ? `<div style="font-size: 11.5px; color: #9CA3AF;">${priceText}</div>` : ''}
        </td>
        <td>
          ${paymentHtml}
        </td>
        <td>
          <div style="font-size: 12px; color: #FFFFFF; font-weight: 600;">
            ${formatDate(m.JoinDate)} <span style="color: #9CA3AF; margin: 0 2px;">➔</span> ${formatDate(m.EndDate) || '—'}
          </div>
        </td>
        <td style="text-align: center;">
          ${statusHtml}
        </td>
        <td>
          <div class="action-btn-group" style="justify-content: flex-end;">
            ${isPending ? `
              <button class="btn btn-primary btn-sm" style="font-size: 11.5px; padding: 4px 10px; font-weight: 700;" onclick="openCollectPaymentModal(${m.MemberID})" title="Thu tiền &amp; Kích hoạt gói ngay">
                <i class="fa fa-qrcode"></i> Thu tiền
              </button>
            ` : ''}
            ${isAdmin ? `
              <button class="btn-action-icon" title="Chỉnh sửa thông tin & gói tập" onclick="openEditMemberModal(${m.MemberID})">
                <i class="fa fa-edit"></i>
              </button>
              <button class="btn-action-icon" title="Xem InBody & Sức khỏe" onclick="viewMemberInBody(${m.MemberID})">
                <i class="fa fa-heartbeat"></i>
              </button>
              <button class="btn-action-icon btn-danger" title="Xóa hội viên" onclick="handleDeleteMember(${m.MemberID})">
                <i class="fa fa-trash"></i>
              </button>
            ` : `
              <button class="btn-action-icon" title="Xem chi tiết hồ sơ" onclick="openViewMemberDetailModal(${m.MemberID})">
                <i class="fa fa-eye"></i>
              </button>
              <button class="btn-action-icon" title="Xem InBody & Sức khỏe" onclick="viewMemberInBody(${m.MemberID})">
                <i class="fa fa-heartbeat"></i>
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}



function handleMemberSearch() {
  const query = document.getElementById('memberSearchInput').value;
  const status = document.getElementById('memberStatusFilter').value;
  loadMembers(query, status);
}

let pendingNewMemberData = null;

function openAddMemberModal() {
  document.getElementById('memberModalTitle').textContent = 'Thêm Hội viên Mới';
  document.getElementById('memberForm').reset();
  document.getElementById('editMemberId').value = '';
  const submitBtn = document.getElementById('btnMemberSubmit');
  if (submitBtn) submitBtn.innerHTML = '<i class="fa fa-arrow-right"></i> Tiếp tục thanh toán VietQR';
  openModal('memberModal');
}

async function openViewMemberDetailModal(id) {
  const member = await GymAPI.getMemberById(id);
  if (!member) return;

  const avatarEl = document.getElementById('vmdAvatar');
  const nameEl = document.getElementById('vmdName');
  const codeEl = document.getElementById('vmdCode');
  const phoneEl = document.getElementById('vmdPhone');
  const emailEl = document.getElementById('vmdEmail');
  const packageEl = document.getElementById('vmdPackage');
  const statusEl = document.getElementById('vmdStatus');
  const joinDateEl = document.getElementById('vmdJoinDate');
  const endDateEl = document.getElementById('vmdEndDate');
  const paymentMethodEl = document.getElementById('vmdPaymentMethod');

  if (avatarEl) avatarEl.textContent = member.Fullname.split(' ').pop()[0];
  if (nameEl) nameEl.textContent = member.Fullname;
  if (codeEl) codeEl.textContent = `Mã HV: ${member.Code || 'HV-' + member.MemberID}`;
  if (phoneEl) phoneEl.textContent = member.Phone || '—';
  if (emailEl) emailEl.textContent = member.Email || '—';
  if (packageEl) packageEl.textContent = member.PackageName ? `${member.PackageName} (${member.Price ? formatVND(member.Price) : ''})` : 'Chưa đăng ký';
  if (statusEl) {
    if (member.Status === 'Active' || member.PaymentStatus === 'Paid') {
      statusEl.innerHTML = `<span class="badge badge-green"><i class="fa fa-check-circle"></i> Đang hoạt động</span>`;
    } else if (member.Status === 'Pending' || member.PaymentStatus === 'Pending') {
      statusEl.innerHTML = `<span class="badge badge-yellow"><i class="fa fa-clock"></i> Chờ thanh toán</span>`;
    } else {
      statusEl.innerHTML = `<span class="badge badge-red"><i class="fa fa-ban"></i> Hết hạn</span>`;
    }
  }
  if (paymentMethodEl) {
    if (member.Status === 'Pending' || member.PaymentStatus === 'Pending') {
      paymentMethodEl.innerHTML = `<span style="color: #FF334B; font-weight: 700;"><i class="fa fa-exclamation-circle"></i> Chưa thu tiền (Chờ TT)</span>`;
    } else {
      paymentMethodEl.innerHTML = `<span style="color: #10B981; font-weight: 700;"><i class="fa fa-check-circle"></i> Đã thanh toán (${member.PaymentMethod || 'VietQR'})</span>`;
    }
  }
  if (joinDateEl) joinDateEl.textContent = formatDate(member.JoinDate);
  if (endDateEl) endDateEl.textContent = formatDate(member.EndDate) || '—';
  if (addressEl) addressEl.textContent = member.Address || 'Chưa cập nhật địa chỉ';

  openModal('viewMemberDetailModal');
}


async function openEditMemberModal(id) {
  const currentUser = (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser) ? GymAPI.getCurrentUser() : { Role: 'Admin' };
  if (currentUser.Role !== 'Admin' && currentUser.Role !== 'Manager') {
    showToast('Nhân viên chỉ có quyền thêm mới, không được tự ý sửa thông tin hoặc gói tập của hội viên!', 'error');
    return;
  }

  const member = await GymAPI.getMemberById(id);
  if (!member) return;

  document.getElementById('memberModalTitle').textContent = 'Chỉnh sửa Hội viên';
  document.getElementById('editMemberId').value = member.MemberID;
  document.getElementById('mFullname').value = member.Fullname;
  document.getElementById('mGender').value = member.Gender || 'Male';
  document.getElementById('mBirthDate').value = member.BirthDate || '';
  document.getElementById('mPhone').value = member.Phone || '';
  document.getElementById('mEmail').value = member.Email || '';
  document.getElementById('mAddress').value = member.Address || '';
  document.getElementById('mPackage').value = member.PackageName || 'Gói 1 tháng';
  document.getElementById('mStatus').value = member.Status || 'Active';

  const submitBtn = document.getElementById('btnMemberSubmit');
  if (submitBtn) submitBtn.innerHTML = '<i class="fa fa-save"></i> Cập nhật thông tin';

  openModal('memberModal');
}

async function handleSaveMember(e) {
  e.preventDefault();
  const id = document.getElementById('editMemberId').value;
  const fullname = document.getElementById('mFullname').value.trim();
  const gender = document.getElementById('mGender').value;
  const birthDate = document.getElementById('mBirthDate').value;
  const phone = document.getElementById('mPhone').value.trim();
  const email = document.getElementById('mEmail').value.trim();
  const address = document.getElementById('mAddress').value.trim();
  const packageName = document.getElementById('mPackage').value;
  const status = document.getElementById('mStatus').value;

  if (!fullname) {
    showToast('Vui lòng nhập họ tên hội viên', 'error');
    return;
  }

  // Lấy danh sách gói để xác định PackageID
  const packages = await GymAPI.getPackages();

  const selectedPackage = packages.find(
    p => p.PackageName === packageName
  );

  if (!selectedPackage) {
    showToast('Không tìm thấy gói tập đã chọn!', 'error');
    return;
  }

  const startDate = new Date();
  const endDate = new Date();

  if (packageName.includes('12 tháng')) {
    endDate.setFullYear(
      startDate.getFullYear() + 1
    );
  } else if (packageName.includes('6 tháng')) {
    endDate.setMonth(
      startDate.getMonth() + 6
    );
  } else if (packageName.includes('3 tháng')) {
    endDate.setMonth(
      startDate.getMonth() + 3
    );
  } else {
    endDate.setMonth(
      startDate.getMonth() + 1
    );
  }

  const memberData = {
    Fullname: fullname,
    Gender: gender,
    BirthDate: birthDate,
    Phone: phone,
    Email: email,
    Address: address,

    // Thông tin gói
    PackageID: Number(selectedPackage.PackageID),
    PackageName: selectedPackage.PackageName,

    // Thời hạn
    StartDate: startDate.toISOString().split('T')[0],
    EndDate: endDate.toISOString().split('T')[0],

    Status: status,

    JoinDate: startDate.toISOString().split('T')[0]
  };
    if (id) {
      const currentUser = (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser) ? GymAPI.getCurrentUser() : { Role: 'Admin' };
      if (currentUser.Role !== 'Admin' && currentUser.Role !== 'Manager') {
        showToast('Nhân viên chỉ có quyền thêm mới, không được tự ý sửa thông tin hoặc gói tập của hội viên!', 'error');
        return;
      }
      memberData.MemberID = Number(id);
      await GymAPI.updateMember(memberData);
      showToast('Cập nhật thông tin hội viên thành công!', 'success');
      closeModal('memberModal');
      loadMembers();
    } else {
      // Thêm mới hội viên -> Mở popup thanh toán VietQR
      const packages = await GymAPI.getPackages();
      const pkg = packages.find(p => p.PackageName === packageName) || { Price: 500000, PackageID: 1 };
      const members = await GymAPI.getMembers();
      const nextCode = `HV-${String(1000 + members.length + 1).padStart(4, '0')}`;

      memberData.Code = nextCode;
      memberData.Price = pkg.Price || 500000;
      memberData.PackageID = pkg.PackageID || 1;
      pendingNewMemberData = memberData;

      // Cập nhật thông tin lên popup VietQR
      document.getElementById('qrMemberName').textContent = fullname;
      document.getElementById('qrMemberCode').textContent = nextCode;
      document.getElementById('qrPackageName').textContent = packageName;
      document.getElementById('qrExpiryDate').textContent = formatDate(memberData.EndDate);
      document.getElementById('qrAmountDisplay').textContent = formatVND(memberData.Price);

      // Tạo mã VietQR chuẩn ngân hàng MB Bank
      const transferNote = `${nextCode.replace('-','')} ${packageName.replace(/\s+/g, '')}`;
      const qrUrl = `https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=${memberData.Price}&addInfo=${encodeURIComponent(transferNote)}&accountName=PHONG%20TAP%20FITNESS`;
      const qrImg = document.getElementById('qrImageDisplay');
      if (qrImg) qrImg.src = qrUrl;

      closeModal('memberModal');
      openModal('memberPaymentModal');
    }
  }

/**
 * Xác nhận thanh toán và kích hoạt gói tập cho hội viên mới
 * @param {boolean} isPaid - true: Đã thu tiền / false: Thanh toán sau
 */
async function confirmMemberPayment(isPaid = true) {
  
  try {
    if (!pendingNewMemberData) {
      showToast('Không có thông tin hội viên cần lưu!', 'error');
      return;
    }

    // Lấy phương thức thanh toán đang chọn
    const payMethodEl = document.querySelector(
      'input[name="payMethod"]:checked'
    );

    const payMethod = payMethodEl
      ? payMethodEl.value
      : 'VietQR';

    // Chuẩn bị dữ liệu gửi Backend
    const memberData = {
      ...pendingNewMemberData,

      PaymentMethod: payMethod,

      PaymentStatus: isPaid
        ? 'Completed'
        : 'Pending',

      Status: isPaid
        ? 'Active'
        : 'Pending'
    };

    console.log('📤 Gửi dữ liệu thêm hội viên:', memberData);

    // Gọi Backend API
    const result = await GymAPI.addMember(memberData);

    console.log('📥 Backend trả về:', result);

    // Backend báo lỗi
    if (!result || !result.success) {
      showToast(
        result?.message || 'Không thể thêm hội viên!',
        'error'
      );
      return;
    }

    // Thành công
    if (isPaid) {
      showToast(
        `🎉 Đã thu ${formatVND(memberData.Price)} (${payMethod}) & Kích hoạt gói tập cho ${memberData.Fullname}!`,
        'success'
      );
    } else {
      showToast(
        `Đã lưu hồ sơ hội viên ${memberData.Fullname} (Trạng thái: Chờ thanh toán)!`,
        'info'
      );
    }

    // Xóa dữ liệu tạm
    pendingNewMemberData = null;

    // Đóng popup thanh toán
    closeModal('memberPaymentModal');

    // Tải lại danh sách từ MySQL
    await loadMembers();

  } catch (error) {
    console.error('❌ Lỗi confirmMemberPayment:', error);

    showToast(
      error.message || 'Có lỗi xảy ra khi thêm hội viên!',
      'error'
    );
  }
}
/**
 * Mở popup thu tiền VietQR cho hội viên đang ở trạng thái 'Chờ thanh toán'
 */
async function openCollectPaymentModal(memberId) {
  const member = await GymAPI.getMemberById(memberId);
  if (!member) return;

  const packages = await GymAPI.getPackages();
  const pkg = packages.find(p => p.PackageName === member.PackageName) || { Price: 500000, PackageID: 1 };

  pendingNewMemberData = {
    ...member,
    Price: pkg.Price || 500000,
    PackageID: pkg.PackageID || 1
  };

  document.getElementById('qrMemberName').textContent = member.Fullname;
  document.getElementById('qrMemberCode').textContent = member.Code || `HV-${member.MemberID}`;
  document.getElementById('qrPackageName').textContent = member.PackageName || 'Gói 1 tháng';
  document.getElementById('qrExpiryDate').textContent = formatDate(member.EndDate) || '30 ngày';
  document.getElementById('qrAmountDisplay').textContent = formatVND(pendingNewMemberData.Price);

  const transferNote = `${(member.Code || 'HV').replace('-','')} ${(member.PackageName || 'GOI').replace(/\s+/g, '')}`;
  const qrUrl = `https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=${pendingNewMemberData.Price}&addInfo=${encodeURIComponent(transferNote)}&accountName=PHONG%20TAP%20FITNESS`;
  const qrImg = document.getElementById('qrImageDisplay');
  if (qrImg) qrImg.src = qrUrl;

  openModal('memberPaymentModal');
}



async function handleDeleteMember(id) {
  const currentUser = (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser) ? GymAPI.getCurrentUser() : { Role: 'Admin' };
  if (currentUser.Role !== 'Admin' && currentUser.Role !== 'Manager') {
    showToast('Nhân viên không có quyền xóa hội viên!', 'error');
    return;
  }

  if (confirm('Bạn có chắc chắn muốn xóa hội viên này không?')) {
    await GymAPI.deleteMember(id);
    showToast('Đã xóa hội viên thành công', 'info');
    loadMembers();
  }
}


// ==============================================================================
// 2. QUẢN LÝ ĐIỂM DANH (ATTENDANCE)
// ==============================================================================

async function loadAttendanceList(query = '') {
  const currentUser = (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser) ? GymAPI.getCurrentUser() : { Role: 'Admin' };
  const memberAttendanceView = document.getElementById('memberAttendanceView');
  const staffAttendanceView = document.getElementById('staffAttendanceView');

  if (currentUser.Role === 'Member') {
    if (memberAttendanceView) memberAttendanceView.style.display = 'block';
    if (staffAttendanceView) staffAttendanceView.style.display = 'none';
    return;
  }

  if (memberAttendanceView) memberAttendanceView.style.display = 'none';
  if (staffAttendanceView) staffAttendanceView.style.display = 'block';

  const tableBody = document.getElementById('fullAttendanceTable');
  if (!tableBody) return;

  let attendanceList = await GymAPI.getAttendance();

  if (query) {
    const q = query.toLowerCase().trim();
    attendanceList = attendanceList.filter(a => 
      String(a.AttendanceID).includes(q) ||
      String(a.MemberID).includes(q) ||
      (a.MemberName && a.MemberName.toLowerCase().includes(q))
    );
  }

  tableBody.innerHTML = attendanceList.map(a => `
    <tr>
      <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${a.AttendanceID}</td>
      <td style="color: #FFFFFF; padding: 14px 18px;">${a.CheckInTime}</td>
      <td style="color: #9CA3AF; padding: 14px 18px;">${a.CheckOutTime || '---'}</td>
      <td style="color: #FFFFFF; padding: 14px 18px;">${a.AttendanceDate}</td>
      <td style="font-weight: 700; color: #FFFFFF; text-align: center; padding: 14px 18px;">${a.MemberID}</td>
    </tr>
  `).join('');
}


function handleAttendanceSearch(query) {
  loadAttendanceList(query);
}


async function handleCheckOutAction(id) {
  const res = await GymAPI.checkOut(id);
  if (res.success) {
    showToast(`Hội viên ${res.data.MemberName} đã check-out lúc ${res.data.CheckOutTime}`, 'success');
    loadAttendanceList();
  }
}

function openMemberCheckInModal() {
  openModal('memberCheckInModal');
}

async function submitMemberCheckIn() {
  const select = document.getElementById('checkInMemberSelect');
  const typeSelect = document.getElementById('checkInTypeSelect');
  if (!select || !select.value) {
    showToast('Vui lòng chọn hội viên', 'error');
    return;
  }

  const result = await GymAPI.checkIn(select.value, typeSelect ? typeSelect.value : 'Gym & Fitness');
  if (result.success) {
    showToast(`Check-in thành công: ${result.data.MemberName}`, 'success');
    closeModal('memberCheckInModal');
    loadAttendanceList();
  }
}

let bodyFatChartInstance = null;

function initProgressBodyFatChart(progressList) {
  const canvas = document.getElementById('progressBodyFatChart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (bodyFatChartInstance) {
    bodyFatChartInstance.destroy();
  }

  const labels = progressList.map(p => `ID ${p.ProgressID || p.ID}`);
  const dataPoints = progressList.map(p => Number(p.BodyFat));

  const ctx = canvas.getContext('2d');
  bodyFatChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Tỷ lệ mỡ (%)',
        data: dataPoints,
        borderColor: '#FF334B',
        backgroundColor: 'rgba(255, 51, 75, 0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: '#FF334B',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        pointRadius: 4.5,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 11, 20, 0.92)',
          titleColor: '#FFFFFF',
          bodyColor: '#FF334B',
          borderColor: 'rgba(255, 51, 75, 0.4)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (context) => ` BodyFat: ${context.parsed.y}%`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { color: '#9CA3AF', font: { size: 11, weight: '600' } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.06)', drawBorder: false },
          ticks: { color: '#9CA3AF', font: { size: 11 } }
        }
      }
    }
  });
}

async function loadInBodyProgress() {
  const currentUser = (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser) ? GymAPI.getCurrentUser() : { Role: 'Admin' };
  const memberProgressView = document.getElementById('memberProgressView');
  const trainerProgressView = document.getElementById('trainerProgressView');
  const adminProgressView = document.getElementById('adminProgressView');

  if (currentUser.Role === 'Member') {
    if (memberProgressView) memberProgressView.style.display = 'block';
    if (trainerProgressView) trainerProgressView.style.display = 'none';
    if (adminProgressView) adminProgressView.style.display = 'none';
    return;
  }

  if (currentUser.Role === 'Trainer') {
    if (memberProgressView) memberProgressView.style.display = 'none';
    if (trainerProgressView) trainerProgressView.style.display = 'block';
    if (adminProgressView) adminProgressView.style.display = 'none';
    return;
  }

  if (memberProgressView) memberProgressView.style.display = 'none';
  if (trainerProgressView) trainerProgressView.style.display = 'none';
  if (adminProgressView) adminProgressView.style.display = 'block';

  const tableBody = document.getElementById('progressTableBody');
  if (!tableBody) return;

  const records = await GymAPI.getProgress();

  // Compute KPI Averages
  if (records && records.length > 0) {
    const avgFat = (records.reduce((sum, r) => sum + Number(r.BodyFat || 0), 0) / records.length).toFixed(2);
    const avgMuscle = (records.reduce((sum, r) => sum + Number(r.MuscleMass || 0), 0) / records.length).toFixed(2);

    const fatEl = document.getElementById('avgBodyFatDisplay');
    const muscleEl = document.getElementById('avgMuscleMassDisplay');
    if (fatEl) fatEl.textContent = `${avgFat}%`;
    if (muscleEl) muscleEl.textContent = `${avgMuscle} kg`;

    setTimeout(() => {
      initProgressBodyFatChart(records);
    }, 50);
  }

  tableBody.innerHTML = records.map(p => {
    const fatVal = Number(p.BodyFat || 0);
    const fatColor = fatVal <= 20 ? '#10B981' : '#F59E0B';

    return `
      <tr>
        <td style="font-weight: 700; color: #FF334B; padding: 14px 18px;">${p.ProgressID || p.ID}</td>
        <td style="color: #9CA3AF; padding: 14px 18px;">${p.RecordDate}</td>
        <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${Number(p.Weight).toFixed(2)}</td>
        <td style="color: #FFFFFF; padding: 14px 18px;">${Number(p.Height).toFixed(2)}</td>
        <td style="color: ${fatColor}; font-weight: 700; padding: 14px 18px;">${Number(p.BodyFat).toFixed(2)}</td>
        <td style="color: #10B981; font-weight: 700; padding: 14px 18px;">${Number(p.MuscleMass).toFixed(2)}</td>
        <td style="font-weight: 700; color: #FFFFFF; text-align: center; padding: 14px 18px;">${p.MemberID}</td>
        <td style="font-weight: 700; color: #FFFFFF; text-align: center; padding: 14px 18px;">${p.TrainerID || 1}</td>
      </tr>
    `;
  }).join('');
}



async function viewMemberInBody(memberId) {
  const member = await GymAPI.getMemberById(memberId);
  const records = await GymAPI.getProgress(memberId);

  document.getElementById('inbodyMemberName').textContent = member ? `${member.Fullname} (${member.Code})` : 'Hội viên';
  
  if (records.length > 0) {
    const latest = records[records.length - 1];
    document.getElementById('ibWeight').textContent = `${latest.Weight} kg`;
    document.getElementById('ibHeight').textContent = `${latest.Height} cm`;
    document.getElementById('ibFat').textContent = `${latest.BodyFat} %`;
    document.getElementById('ibMuscle').textContent = `${latest.MuscleMass} kg`;
  }

  openModal('inbodyModal');
}

function openAddInBodyModal() {
  openModal('addInBodyModal');
}

async function handleSaveInBody(e) {
  e.preventDefault();
  const memberId = document.getElementById('ibMemberSelect').value;
  const weight = Number(document.getElementById('ibInpWeight').value);
  const height = Number(document.getElementById('ibInpHeight').value);
  const fat = Number(document.getElementById('ibInpFat').value);
  const muscle = Number(document.getElementById('ibInpMuscle').value);

  const member = await GymAPI.getMemberById(memberId);

  await GymAPI.addProgress({
    MemberID: Number(memberId),
    MemberName: member ? member.Fullname : 'Hội viên',
    Weight: weight,
    Height: height,
    BodyFat: fat,
    MuscleMass: muscle,
    TrainerName: 'Trần Quốc Bảo'
  });

  showToast('Lưu chỉ số InBody thành công!', 'success');
  closeModal('addInBodyModal');
  loadInBodyProgress();
}

let currentWorkoutPlanTrainerFilter = 'all';
let currentWorkoutPlanStatusFilter = 'active';

async function loadWorkoutPlans() {
  const currentUser = (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser) ? GymAPI.getCurrentUser() : { Role: 'Admin' };
  const memberWorkoutPlanView = document.getElementById('memberWorkoutPlanView');
  const adminWorkoutPlanView = document.getElementById('adminWorkoutPlanView');

  if (currentUser.Role === 'Member') {
    if (memberWorkoutPlanView) memberWorkoutPlanView.style.display = 'block';
    if (adminWorkoutPlanView) adminWorkoutPlanView.style.display = 'none';
    return;
  }

  if (memberWorkoutPlanView) memberWorkoutPlanView.style.display = 'none';
  if (adminWorkoutPlanView) adminWorkoutPlanView.style.display = 'block';

  const tableBody = document.getElementById('workoutPlanTableBody');
  if (!tableBody) return;

  const isTrainer = currentUser.Role === 'Trainer';

  const titleEl = document.getElementById('wpHeaderTitle');
  const subEl = document.getElementById('wpHeaderSubtitle');
  const btnEl = document.getElementById('wpHeaderBtn');
  const toolbarEl = document.getElementById('wpToolbarRow');

  if (titleEl) titleEl.textContent = isTrainer ? 'Giáo Án Tập Luyện (Workout Plan)' : 'Quản lý Giáo trình & Workout Plan';
  if (subEl) subEl.textContent = isTrainer ? 'Thiết kế và quản lý lộ trình tập luyện cá nhân hóa' : 'Lịch trình tập luyện được thiết kế riêng bởi PT';
  if (btnEl) btnEl.innerHTML = `<i class="fa fa-plus"></i> ${isTrainer ? '+ Tạo giáo án mới' : '+ Tạo kế hoạch mới'}`;
  if (toolbarEl) toolbarEl.style.display = isTrainer ? 'none' : 'flex';


  if (isTrainer) {
    const trainerPlans = [
      { id: 1, name: 'Leg Day Specialist v2', goal: 'Tăng sức mạnh thân dưới', desc: 'Squat, Leg Press, Lunges', date: '2026-07-20', memberId: 1 },
      { id: 2, name: 'Cardio Blast & HIIT', goal: 'Đốt mỡ thừa tối đa', desc: 'HIIT 30 phút, Running', date: '2026-08-10', memberId: 2 },
      { id: 3, name: 'Hypertrophy Push/Pull', goal: 'Phát triển cơ vai & ngực', desc: 'Bench Press, OHP', date: '2026-05-01', memberId: 3 },
      { id: 4, name: 'Pilates Strength & Core', goal: 'Cải thiện vóc dáng', desc: 'Pilates, Core Work', date: '2026-08-05', memberId: 4 }
    ];

    tableBody.innerHTML = trainerPlans.map(p => `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
        <td style="font-weight: 700; color: #FFFFFF; padding: 16px 18px;">${p.id}</td>
        <td style="font-weight: 700; color: #FF334B; padding: 16px 18px;">${p.name}</td>
        <td style="color: #9CA3AF; padding: 16px 18px;">${p.goal}</td>
        <td style="color: #9CA3AF; font-size: 13.5px; padding: 16px 18px;">${p.desc}</td>
        <td style="color: #9CA3AF; padding: 16px 18px;">${p.date}</td>
        <td style="font-weight: 700; color: #FFFFFF; text-align: center; padding: 16px 18px;">${p.memberId}</td>
      </tr>
    `).join('');
    return;
  }

  // Admin / General view
  let plans = await GymAPI.getWorkoutPlans();

  if (currentWorkoutPlanTrainerFilter !== 'all') {
    if (currentWorkoutPlanTrainerFilter === '1') {
      plans = plans.filter(p => [1, 2, 5].includes(p.PlanID));
    } else if (currentWorkoutPlanTrainerFilter === '2') {
      plans = plans.filter(p => [3, 4, 6].includes(p.PlanID));
    }
  }

  tableBody.innerHTML = plans.map(p => {
    let goalBadgeClass = 'badge-green';
    const goalLower = (p.Goal || '').toLowerCase();
    if (goalLower.includes('giảm mỡ') || goalLower.includes('giảm cân')) {
      goalBadgeClass = 'badge-red';
    } else if (goalLower.includes('sức mạnh')) {
      goalBadgeClass = 'badge-yellow';
    }

    return `
      <tr>
        <td style="font-weight: 700; color: #FF334B; padding: 14px 18px;">${p.PlanID}</td>
        <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${p.PlanName}</td>
        <td style="padding: 14px 18px;">
          <span class="badge ${goalBadgeClass}" style="padding: 4px 14px; border-radius: 12px; font-weight: 600; font-size: 12.5px;">
            ${p.Goal}
          </span>
        </td>
        <td style="color: #9CA3AF; font-size: 13.5px; padding: 14px 18px; max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${p.Description}
        </td>
        <td style="color: #9CA3AF; padding: 14px 18px;">${p.CreateDate}</td>
        <td style="font-weight: 700; color: #FFFFFF; text-align: center; padding: 14px 18px;">${p.MemberID}</td>
      </tr>
    `;
  }).join('');
}


function filterWorkoutPlans(trainerId, event) {
  document.querySelectorAll('#wpTrainerFilterTabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  currentWorkoutPlanTrainerFilter = trainerId;
  loadWorkoutPlans();
}

function filterWorkoutPlanStatus(status) {
  currentWorkoutPlanStatusFilter = status;
  loadWorkoutPlans();
}

function openAddWorkoutPlanModal() {
  openModal('addWorkoutPlanModal');
}


async function handleSaveWorkoutPlan(e) {
  e.preventDefault();
  const memberId = document.getElementById('wpMemberSelect').value;
  const planName = document.getElementById('wpPlanName').value.trim();
  const goal = document.getElementById('wpGoal').value.trim();
  const desc = document.getElementById('wpDescription').value.trim();

  const member = await GymAPI.getMemberById(memberId);

  const db = MockDB.getDB();
  db.workout_plan.unshift({
    PlanID: db.workout_plan.length + 1,
    MemberID: Number(memberId),
    MemberName: member ? member.Fullname : 'Hội viên',
    PlanName: planName,
    Goal: goal,
    Description: desc,
    CreateDate: new Date().toISOString().split('T')[0]
  });
  MockDB.saveDB(db);

  showToast('Tạo giáo án luyện tập thành công!', 'success');
  closeModal('addWorkoutPlanModal');
  loadWorkoutPlans();
}

async function populatePackageSelects() {
  const packages = await GymAPI.getPackages();
  const select = document.getElementById('mPackage');
  if (select) {
    select.innerHTML = packages.map(p => `<option value="${p.PackageName}">${p.PackageName} - ${formatVND(p.Price)}</option>`).join('');
  }
}

async function populateMemberDropdowns() {
  const members = await GymAPI.getMembers();
  const dropdowns = ['ibMemberSelect', 'wpMemberSelect', 'checkInMemberSelect'];
  dropdowns.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = members.map(m => `<option value="${m.MemberID}">${m.Code} - ${m.Fullname}</option>`).join('');
    }
  });
}

window.switchMemberTab = switchMemberTab;
window.handleMemberSearch = handleMemberSearch;
window.openAddMemberModal = openAddMemberModal;
window.openEditMemberModal = openEditMemberModal;
window.handleSaveMember = handleSaveMember;
window.handleDeleteMember = handleDeleteMember;
window.handleCheckOutAction = handleCheckOutAction;
window.openMemberCheckInModal = openMemberCheckInModal;
window.submitMemberCheckIn = submitMemberCheckIn;
window.viewMemberInBody = viewMemberInBody;
window.openAddInBodyModal = openAddInBodyModal;
window.handleSaveInBody = handleSaveInBody;
window.openAddWorkoutPlanModal = openAddWorkoutPlanModal;
window.filterWorkoutPlans = filterWorkoutPlans;
window.filterWorkoutPlanStatus = filterWorkoutPlanStatus;
window.confirmMemberPayment = confirmMemberPayment;
window.openCollectPaymentModal = openCollectPaymentModal;
window.handleAttendanceSearch = handleAttendanceSearch;




