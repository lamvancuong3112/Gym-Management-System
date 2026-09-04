/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)
 * ĐIỀU KHIỂN GIAO DIỆN CHUNG & TIỆN ÍCH (common.js)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  renderSharedHeader();
  initSidebarNavigation();
  initToastContainer();
  initMobileDrawer();
  window.addEventListener('hashchange', initSidebarNavigation);
});

/**
 * Render Header Component Dùng chung trên tất cả các trang
 */
function renderSharedHeader() {
  const header = document.getElementById('appHeader') || document.querySelector('.app-header');
  if (!header) return;

  const currentUser = GymAPI.getCurrentUser();
  const initials = (currentUser.Fullname || currentUser.Username)
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  header.innerHTML = `
    <div class="header-left">
      <a href="dashboard.html" class="brand-logo">
        <img src="../assets/images/logo.png" alt="Gym Logo">
        <span class="brand-name">FITNESS</span>
      </a>
    </div>

    <div class="header-right">
      <div class="role-selector-pill">
        <i class="fa fa-user-shield text-red"></i>

      </div>


      <div class="user-profile-widget">
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
          <span class="user-name">${currentUser.Fullname || currentUser.Username}</span>
          <span class="user-role">${currentUser.RoleTitle || currentUser.Role}</span>
        </div>
      </div>

      <button class="btn-logout" title="Đăng xuất" onclick="GymAPI.logout()">
        <i class="fa fa-sign-out-alt"></i>
      </button>
    </div>
  `;
}



/**
 * Khởi tạo tính năng Menu vuốt/trượt trên thiết bị di động (Mobile Drawer)
 */
function initMobileDrawer() {
  // Tạo lớp phủ mờ khi mở Sidebar trên Mobile nếu chưa có
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  // Thêm nút Hamburger (☰) vào góc trái Header trên màn hình nhỏ
  const headerLeft = document.querySelector('.header-left');
  if (headerLeft && !document.querySelector('.mobile-menu-toggle')) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-menu-toggle';
    toggleBtn.innerHTML = '<i class="fa fa-bars"></i>';
    toggleBtn.title = 'Mở Menu điều hướng';
    toggleBtn.onclick = toggleMobileSidebar;
    headerLeft.prepend(toggleBtn);
  }

  overlay.onclick = closeMobileSidebar;
}

function toggleMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar && overlay) {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
  }
}

function closeMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (overlay) overlay.classList.remove('active');
}

/**
 * Định dạng số tiền sang chuẩn Việt Nam Đồng (VND), ví dụ: 45000 -> 45.000đ
 * @param {number} amount - Số tiền
 */
function formatVND(amount) {
  if (amount === undefined || amount === null) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

/**
 * Định dạng ngày YYYY-MM-DD sang DD/MM/YYYY
 * @param {string} dateStr - Chuỗi ngày tháng
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Khởi tạo thông tin User trên thanh Topbar và menu chuyển Role
 */
function initHeaderAndProfile() {
  const currentUser = GymAPI.getCurrentUser();
  const userNameEl = document.getElementById('headerUserName');
  const userRoleEl = document.getElementById('headerUserRole');
  const userAvatarEl = document.getElementById('headerUserAvatar');

  if (userNameEl) userNameEl.textContent = currentUser.Fullname || currentUser.Username;
  if (userRoleEl) userRoleEl.textContent = currentUser.RoleTitle || currentUser.Role;
  if (userAvatarEl) {
    const initials = (currentUser.Fullname || currentUser.Username)
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    userAvatarEl.textContent = initials;
  }

  // Cập nhật giá trị vào dropdown chuyển đổi Role
  const roleSelect = document.getElementById('headerRoleSelect');
  if (roleSelect) {
    roleSelect.value = currentUser.Role;
    roleSelect.addEventListener('change', (e) => {
      const selectedRole = e.target.value;
      switchUserRole(selectedRole);
    });
  }
}

/**
 * Chuyển đổi nhanh vai trò (Role) để xem thử giao diện của từng đối tượng
 * @param {string} role - Tên Role (Admin, Staff, Trainer, Member)
 */
function switchUserRole(role) {
  const roleMap = {
    Admin: { UserID: 1, Username: 'admin', Fullname: 'Văn Điền', Role: 'Admin', RoleTitle: 'Quản lý phòng tập' },
    Staff: { UserID: 8, Username: 'vancuong_staff', Fullname: 'Lâm Văn Cường', Role: 'Staff', RoleTitle: 'Nhân viên hỗ trợ', Email: 'vancuong@gmail.com', Phone: '0901111222' },
    Trainer: { UserID: 3, Username: 'trainer01', Fullname: 'Trần Quốc Bảo', Role: 'Trainer', RoleTitle: 'Huấn luyện viên' }
  };

  const newUser = roleMap[role] || roleMap.Admin;
  GymAPI.setCurrentUser(newUser);
  showToast(`Đã chuyển sang vai trò: ${newUser.RoleTitle} (${newUser.Fullname})`, 'info');
  
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 350);
}


/**
 * Tự động dựng danh mục Menu Sidebar dựa theo Role của tài khoản đang đăng nhập
 */
function initSidebarNavigation() {
  const sidebarNav = document.getElementById('sidebarNav');
  if (!sidebarNav) return;

  const currentUser = GymAPI.getCurrentUser();
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

  let menuItems = [];

  if (currentUser.Role === 'Admin' || currentUser.Role === 'Manager') {
    menuItems = [
      { name: 'Dashboard', link: 'dashboard.html', icon: 'fa-chart-pie' },
      { name: 'Quản lý tài khoản', link: 'admin.html#users', icon: 'fa-users-cog' },
      { name: 'Quản lý hội viên', link: 'member.html', icon: 'fa-user-friends' },
      { name: 'Quản lý Trainer', link: 'trainer.html', icon: 'fa-dumbbell' },
      { name: 'Quản lý gói tập', link: 'admin.html#packages', icon: 'fa-box-open' },
      { name: 'Quản lý thanh toán', link: 'admin.html#payments', icon: 'fa-file-invoice-dollar' },
      { name: 'Quản lý kho', link: 'admin.html#inventory', icon: 'fa-warehouse' },
      { name: 'Quản lý chấm công', link: 'admin.html#attendance_manage', icon: 'fa-calendar-check' },
      { name: 'Quản lý lương', link: 'admin.html#salaries', icon: 'fa-money-bill-wave' },
      { name: 'Quản lý Booking', link: 'trainer.html#bookings', icon: 'fa-calendar-alt' },
      { name: 'Feedback & Đánh giá', link: 'trainer.html#feedbacks', icon: 'fa-star' },
      { name: 'Báo cáo', link: 'admin.html#reports', icon: 'fa-chart-bar' }
    ];
  } else if (currentUser.Role === 'Staff') {
    menuItems = [
      { name: 'Bán hàng', link: 'dashboard.html', icon: 'fa-cash-register' },
      { name: 'Hội viên', link: 'member.html', icon: 'fa-user-friends' },
      { name: 'Thanh toán', link: 'admin.html#payments', icon: 'fa-file-invoice-dollar' },
      { name: 'Kho hàng', link: 'admin.html#inventory', icon: 'fa-boxes' },
      { name: 'Chấm công ca trực', link: 'admin.html#staff_attendance', icon: 'fa-user-clock' },
      { name: 'Điểm danh hội viên', link: 'admin.html#attendance_manage', icon: 'fa-calendar-check' },
      { name: 'Booking', link: 'trainer.html#bookings', icon: 'fa-calendar-alt' },
      { name: 'Feedback từ Khách', link: 'trainer.html#feedbacks', icon: 'fa-star' },
      { name: 'Lương cá nhân', link: 'admin.html#my_salary', icon: 'fa-wallet' }
    ];


  } else if (currentUser.Role === 'Trainer') {
    menuItems = [
      { name: 'Dashboard', link: 'dashboard.html', icon: 'fa-home' },
      { name: 'Học viên kèm PT', link: 'trainer.html#my_students', icon: 'fa-user-check' },
      { name: 'Booking', link: 'trainer.html#bookings', icon: 'fa-calendar-alt' },
      { name: 'Buổi kèm', link: 'trainer.html#sessions', icon: 'fa-dumbbell' },
      { name: 'Feedback từ Hội viên', link: 'trainer.html#feedbacks', icon: 'fa-star' },
      { name: 'Chấm công', link: 'admin.html#my_attendance', icon: 'fa-clock' },
      { name: 'Thu nhập', link: 'admin.html#my_salary', icon: 'fa-coins' }
    ];
  } else {
    // Default fallback
    menuItems = [
      { name: 'Dashboard', link: 'dashboard.html', icon: 'fa-home' },
      { name: 'Bán hàng', link: 'dashboard.html', icon: 'fa-cash-register' }
    ];
  }


  // Render HTML danh sách menu
  const currentHash = window.location.hash || '';

  // Tìm menu item phù hợp nhất để active
  // 1. Ưu tiên 1: Cùng trang VÀ cùng hash (nếu có hash)
  let activeItemName = null;
  if (currentHash && currentHash !== '#') {
    const matchHashItem = menuItems.find(item => {
      const [itemPage, itemHash] = item.link.split('#');
      return currentPage === itemPage && itemHash && ('#' + itemHash === currentHash);
    });
    if (matchHashItem) activeItemName = matchHashItem.name;
  }

  // 2. Ưu tiên 2: Cùng trang và không có hash
  if (!activeItemName) {
    const matchPageItem = menuItems.find(item => {
      const [itemPage, itemHash] = item.link.split('#');
      return currentPage === itemPage && !itemHash;
    });
    if (matchPageItem) activeItemName = matchPageItem.name;
  }

  // 3. Ưu tiên 3: Mục đầu tiên của trang hiện tại
  if (!activeItemName) {
    const firstPageItem = menuItems.find(item => item.link.split('#')[0] === currentPage);
    if (firstPageItem) activeItemName = firstPageItem.name;
  }

  sidebarNav.innerHTML = `
    <ul class="nav-menu">
      ${menuItems.map(item => {
        const isActive = (item.name === activeItemName);
        return `
          <li class="nav-item">
            <a href="${item.link}" class="nav-link ${isActive ? 'active' : ''}">
              ${item.name}
            </a>
          </li>
        `;
      }).join('')}
    </ul>
  `;
}


/**
 * Khởi tạo vùng hiển thị Toast Alert thông báo
 */
function initToastContainer() {
  if (!document.getElementById('toastContainer')) {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

/**
 * Hiển thị thông báo Toast ở góc phải màn hình
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo ('success', 'error', 'info')
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer') || document.body;

  // Giới hạn tối đa 2 toast hiển thị cùng lúc để không che khuất màn hình
  const existingToasts = container.querySelectorAll('.toast');
  if (existingToasts.length >= 2) {
    existingToasts[0].remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span style="font-size: 16px;">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  // Hiệu ứng trượt vào
  setTimeout(() => toast.classList.add('show'), 10);

  // Tự động biến mất sau 2.5 giây
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 2500);
}


/**
 * Hàm mở Modal Popup
 * @param {string} modalId - ID của thẻ modal
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

/**
 * Hàm đóng Modal Popup
 * @param {string} modalId - ID của thẻ modal
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Xuất các hàm ra toàn cục để gọi từ HTML
window.formatVND = formatVND;
window.formatDate = formatDate;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.switchUserRole = switchUserRole;
