/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)
 * ĐIỀU KHIỂN GIAO DIỆN TỔNG QUAN (dashboard.js)
 * ==============================================================================
 */

let revenueChartInstance = null;
let attendanceChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  await renderGreetingAndStats();
  await loadRecentCheckIns();
  await loadUpcomingBookings();
  await initCharts();
});

/**
 * Hiển thị câu chào và 4 thẻ thống kê KPI động theo vai trò (Admin / Staff / Trainer / Member)
 */
async function renderGreetingAndStats() {
  const currentUser = GymAPI.getCurrentUser();
  const staffProfileView = document.getElementById('staffProfileView');
  const trainerDashboardView = document.getElementById('trainerDashboardView');
  const memberDashboardView = document.getElementById('memberDashboardView');
  const adminOperationsView = document.getElementById('adminOperationsView');

  if (currentUser.Role === 'Staff') {
    if (staffProfileView) staffProfileView.style.display = 'block';
    if (trainerDashboardView) trainerDashboardView.style.display = 'none';
    if (memberDashboardView) memberDashboardView.style.display = 'none';
    if (adminOperationsView) adminOperationsView.style.display = 'none';

    await loadStaffDashboardStats();

    loadStaffPosItems('all');
    loadStaffRecentAttendees();
    return;
  }

  if (currentUser.Role === 'Trainer') {
    if (staffProfileView) staffProfileView.style.display = 'none';
    if (trainerDashboardView) trainerDashboardView.style.display = 'block';
    if (memberDashboardView) memberDashboardView.style.display = 'none';
    if (adminOperationsView) adminOperationsView.style.display = 'none';

    const trainerGreeting = document.getElementById('trainerGreetingTitle');
    if (trainerGreeting) trainerGreeting.textContent = `Chào ${currentUser.Fullname || 'Trần Quốc Bảo'}! 🏋️`;
    return;
  }


  if (currentUser.Role === 'Member') {
    if (staffProfileView) staffProfileView.style.display = 'none';
    if (trainerDashboardView) trainerDashboardView.style.display = 'none';
    if (memberDashboardView) memberDashboardView.style.display = 'block';
    if (adminOperationsView) adminOperationsView.style.display = 'none';

    const memberWelcome = document.getElementById('memberWelcomeName');
    if (memberWelcome) memberWelcome.textContent = currentUser.Fullname || 'Nguyễn Văn An';
    return;
  }

  // Admin / Manager
  if (staffProfileView) staffProfileView.style.display = 'none';
  if (trainerDashboardView) trainerDashboardView.style.display = 'none';
  if (memberDashboardView) memberDashboardView.style.display = 'none';
  if (adminOperationsView) adminOperationsView.style.display = 'block';


  const greetingTitle = document.getElementById('greetingTitle');
  const greetingSubtitle = document.getElementById('greetingSubtitle');
  const statsContainer = document.getElementById('statsGrid');

  if (greetingTitle) greetingTitle.textContent = `Chào Quản lý ${currentUser.Fullname}! 👋`;
  if (greetingSubtitle) greetingSubtitle.textContent = 'Tổng quan tình hình kinh doanh và vận hành phòng tập';
    if (statsContainer) {
    await loadAdminDashboardStats();
  }
}
async function loadAdminDashboardStats() {
  try {
    const today = new Date();
    const todayStr =
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const monthStart =
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

    const [membersResult, attendanceResult, bookingsResult, paymentsResult] =
      await Promise.all([
        GymAPI.getMembers(),
        dashboardGetMemberAttendance(),
        GymAPI.getBookings(),
        GymAPI.getPayments()
      ]);

    const members = Array.isArray(membersResult)
      ? membersResult
      : (membersResult?.data || []);

    const attendance = Array.isArray(attendanceResult)
      ? attendanceResult
      : (attendanceResult?.data || []);

    const bookings = Array.isArray(bookingsResult)
      ? bookingsResult
      : (bookingsResult?.data || []);

    const payments = Array.isArray(paymentsResult)
      ? paymentsResult
      : (paymentsResult?.data || []);

    // =========================
    // TỔNG HỘI VIÊN
    // =========================
    const memberPackageResponse = await fetch(
  `${API_CONFIG.BASE_URL}/member_package.php`,
  {
    method: 'GET',
    credentials: 'include'
  }
);

const memberPackageResult =
  await memberPackageResponse.json();

const memberPackages =
  memberPackageResult?.success
    ? (memberPackageResult.data || [])
    : [];

const todayDate =
  new Date();

todayDate.setHours(0, 0, 0, 0);

const activeMemberIds =
  new Set();

memberPackages.forEach(mp => {
  const status =
    String(mp.Status || '')
      .trim()
      .toLowerCase();

  const endDate =
    mp.EndDate ||
    mp.endDate ||
    '';

  const packageEndDate =
    endDate
      ? new Date(endDate)
      : null;

  if (packageEndDate) {
    packageEndDate.setHours(23, 59, 59, 999);
  }

  const isActiveStatus =
    status === 'active';

  const isNotExpired =
    !packageEndDate ||
    packageEndDate >= todayDate;

  if (
    isActiveStatus &&
    isNotExpired
  ) {
    activeMemberIds.add(
      Number(mp.MemberID)
    );
  }
});

const activeMembers =
  members.filter(member =>
    activeMemberIds.has(
      Number(member.MemberID)
    )
  ).length;

    // =========================
    // CHECK-IN HÔM NAY
    // =========================
    const todayAttendance = attendance.filter(item => {
      const date = String(
        item.AttendanceDate ||
        item.CheckInDate ||
        ''
      ).substring(0, 10);

      return date === todayStr;
    });

    const currentInGym = todayAttendance.filter(item => {
      return !item.CheckOutTime;
    }).length;

    // =========================
    // BOOKING HÔM NAY
    // =========================
    const todayBookings = bookings.filter(booking => {
      const date = String(
        booking.BookingDate ||
        booking.Date ||
        booking.StartTime ||
        ''
      ).substring(0, 10);

      return date === todayStr;
    });

    const pendingBookings = bookings.filter(booking => {
      const status = String(
        booking.Status || ''
      ).toLowerCase();

      return (
        status === 'pending' ||
        status === 'chờ duyệt' ||
        status === 'cho duyet'
      );
    }).length;

    // =========================
    // DOANH THU THÁNG
    // =========================
    const monthPayments = payments.filter(payment => {
      const date = String(
        payment.PaymentDate ||
        payment.CreatedAt ||
        payment.Date ||
        ''
      ).substring(0, 10);

      const status = String(
        payment.Status || ''
      ).toLowerCase();

      return (
        date >= monthStart &&
        status !== 'pending' &&
        status !== 'cancelled' &&
        status !== 'canceled'
      );
    });

    const monthRevenue = monthPayments.reduce(
      (sum, payment) =>
        sum + (Number(payment.Amount) || 0),
      0
    );

    // =========================
    // HIỂN THỊ 4 CARD ADMIN
    // =========================
    const statsContainer =
      document.getElementById('statsGrid');

    if (!statsContainer) return;

    statsContainer.innerHTML = `
      <div class="glass-card" style="padding: 20px 22px; display: flex; flex-direction: column; gap: 6px; border-left: 3px solid #FFFFFF;">
        <span style="font-size: 12px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
          Tổng hội viên
        </span>
        <span style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
          ${members.length} người
        </span>
        <span style="font-size: 12px; color: #10B981; font-weight: 600;">
          ● ${activeMembers} Đang hoạt động
        </span>
      </div>

      <div class="glass-card" style="padding: 20px 22px; display: flex; flex-direction: column; gap: 6px; border-left: 3px solid #10B981;">
        <span style="font-size: 12px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
          Check-in hôm nay
        </span>
        <span style="font-size: 24px; font-weight: 800; color: #10B981; letter-spacing: -0.5px;">
          ${todayAttendance.length} lượt
        </span>
        <span style="font-size: 12px; color: #9CA3AF;">
          ${currentInGym} người đang tập
        </span>
      </div>

      <div class="glass-card" style="padding: 20px 22px; display: flex; flex-direction: column; gap: 6px; border-left: 3px solid #3B82F6;">
        <span style="font-size: 12px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
          Booking hôm nay
        </span>
        <span style="font-size: 24px; font-weight: 800; color: #3B82F6; letter-spacing: -0.5px;">
          ${todayBookings.length} lịch hẹn
        </span>
        <span style="font-size: 12px; color: #9CA3AF;">
          ${pendingBookings} ca đang chờ duyệt
        </span>
      </div>

      <div class="glass-card" style="padding: 20px 22px; display: flex; flex-direction: column; gap: 6px; border-left: 3px solid #FF334B;">
        <span style="font-size: 12px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
          Doanh thu tháng
        </span>
        <span style="font-size: 24px; font-weight: 800; color: #FF334B; letter-spacing: -0.5px;">
          ${typeof formatVND === 'function'
            ? formatVND(monthRevenue)
            : new Intl.NumberFormat('vi-VN').format(monthRevenue) + 'đ'}
        </span>
        <span style="font-size: 12px; color: #10B981; font-weight: 600;">
          ● Dữ liệu từ thanh toán thực tế
        </span>
      </div>
    `;

    console.log('[DASHBOARD ADMIN DATA]', {
      tongHoiVien: members.length,
      dangHoatDong: activeMembers,
      checkInHomNay: todayAttendance.length,
      dangTrongPhong: currentInGym,
      bookingHomNay: todayBookings.length,
      bookingChoDuyet: pendingBookings,
      doanhThuThang: monthRevenue
    });

  } catch (error) {
    console.error('[DASHBOARD ADMIN KPI ERROR]', error);
  }
}
async function updateStaffRevenueCard() {
  try {
    const result = await GymAPI.getPayments();

    const payments = Array.isArray(result)
      ? result
      : (result?.data || []);

    const now = new Date();

    const today =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const todayPayments = payments.filter(payment => {
      const paymentDate = String(
        payment.PaymentDate ||
        payment.CreatedAt ||
        payment.Date ||
        ''
      ).substring(0, 10);

      const status =
        String(payment.Status || '').toLowerCase();

      return (
        paymentDate === today &&
        status !== 'pending' &&
        status !== 'cancelled' &&
        status !== 'canceled'
      );
    });

    const todayRevenue = todayPayments.reduce(
      (sum, payment) =>
        sum + (Number(payment.Amount) || 0),
      0
    );

    const cards = document.querySelectorAll(
      '#staffProfileView .stats-grid .glass-card'
    );

    if (!cards[0]) return;

    const spans = cards[0].querySelectorAll('span');

    if (spans[1]) {
      spans[1].textContent =
        new Intl.NumberFormat('vi-VN').format(todayRevenue) + 'đ';
    }

    if (spans[2]) {
      spans[2].textContent =
        `📈 ${todayPayments.length} hóa đơn đã thu`;
    }

    console.log(
      '[CARD 1 DOANH THU]',
      todayRevenue,
      todayPayments
    );

  } catch (error) {
    console.error(
      '[CARD 1 DOANH THU ERROR]',
      error
    );
  }
}
async function dashboardGetMemberAttendance() {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/attendance.php`,
      {
        method: 'GET',
        credentials: 'include'
      }
    );

    if (response.ok) {
      const result = await response.json();

      if (result && result.success) {
        return Array.isArray(result.data)
          ? result.data
          : [];
      }
    }
  } catch (error) {
    console.warn('[DASHBOARD] Không lấy được attendance:', error);
  }

  return [];
}
async function loadStaffDashboardStats() {
  try {

    // ============================================================
    // NGÀY HÔM NAY - DÙNG GIỜ LOCAL CỦA TRÌNH DUYỆT
    // ============================================================

    const now = new Date();

    const today =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;


    // ============================================================
    // LẤY DỮ LIỆU THẬT TỪ DATABASE
    // ============================================================

    const [
    paymentsResult,
    salesResult,
    attendance,
    inventoryResult
  ] = await Promise.all([
    GymAPI.getPayments(),
    GymAPI.getSales(),
    dashboardGetMemberAttendance(),
    GymAPI.getInventory()
  ]);


    // Payments API trả về { success, data }
    const payments =
    Array.isArray(paymentsResult)
      ? paymentsResult
      : (paymentsResult?.data || []);
    const todayPayments = payments.filter(payment => {
    const paymentDate = String(
      payment.PaymentDate ||
      payment.CreatedAt ||
      payment.Date ||
      ''
    ).substring(0, 10);

    const status =
      String(payment.Status || '').toLowerCase();

    return (
      paymentDate === today &&
      status !== 'pending' &&
      status !== 'cancelled' &&
      status !== 'canceled'
    );
  });

    // Attendance API đã trả thẳng mảng data
    const attendanceList =
      Array.isArray(attendance)
        ? attendance
        : (attendance?.data || []);


    // Inventory API đã trả thẳng mảng data
    const inventory =
      Array.isArray(inventoryResult)
        ? inventoryResult
        : (inventoryResult?.data || []);

    let staffAttendance = [];

    try {
      const staffAttendanceResult =
        await GymAPI.getStaffAttendance();

      staffAttendance = Array.isArray(staffAttendanceResult)
        ? staffAttendanceResult
        : (staffAttendanceResult?.data || []);
    } catch (error) {
      console.warn(
        '[DASHBOARD] Không lấy được chấm công nhân viên:',
        error
      );
    }



// CARD 1 - DOANH THU HÔM NAY
// ============================================================
  const sales = Array.isArray(salesResult)
    ? salesResult
    : (salesResult?.data || []);
  const todaySales = sales.filter(sale => {
    const date = String(
      sale.CreatedAt ||
      sale.SaleDate ||
      sale.Date ||
      ''
    ).substring(0, 10);

    const status =
      String(sale.Status || '').toLowerCase();

    return (
      date === today &&
      status !== 'pending' &&
      status !== 'cancelled' &&
      status !== 'canceled'
    );
  });

    const paymentRevenue = todayPayments.reduce(
    (sum, payment) =>
      sum + (Number(payment.Amount) || 0),
      0
    );

    const salesRevenue = todaySales.reduce(
      (sum, sale) =>
        sum + (Number(sale.TotalAmount) || 0),
      0
    );

    const todayRevenue =
      paymentRevenue + salesRevenue;
      // ============================================================
    // 2. LƯỢT KHÁCH VÀO TẬP HÔM NAY
    // ============================================================

    const todayAttendance =
      attendanceList.filter(item => {

        const attendanceDate =
          String(
            item.AttendanceDate ||
            item.CheckInDate ||
            ''
          ).substring(0, 10);

        return attendanceDate === today;
      });


    const currentInGym =
      todayAttendance.filter(item =>
        !item.CheckOutTime
      ).length;


    // ============================================================
    // 3. TÌM 4 CARD STAFF
    // ============================================================

    const cards =
      document.querySelectorAll(
        '#staffProfileView .stats-grid .glass-card'
      );


    if (!cards.length) {
      console.error(
        '[DASHBOARD] Không tìm thấy 4 card Staff'
      );
      return;
    }


    // ============================================================
    // CARD 1 - DOANH THU
    // ============================================================

    if (cards[0]) {

      const spans =
        cards[0].querySelectorAll('span');

      if (spans[1]) {
        spans[1].textContent =
          new Intl.NumberFormat('vi-VN').format(
            todayRevenue
          ) + 'đ';
      }

      if (spans[2]) {
        spans[2].textContent =
          `📈 ${todayPayments.length + todaySales.length} hóa đơn đã thu`;
      }
    }


    // ============================================================
    // CARD 2 - LƯỢT KHÁCH VÀO TẬP
    // ============================================================

    if (cards[1]) {

      const spans =
        cards[1].querySelectorAll('span');

      if (spans[1]) {
        spans[1].textContent =
          `${todayAttendance.length} lượt`;
      }

      if (spans[2]) {
        spans[2].textContent =
          `🟢 ${currentInGym} người đang ở phòng`;
      }
    }


    // ============================================================
    // CARD 3 - GÓI TẬP & SẢN PHẨM
    // ============================================================

    if (cards[2]) {

      const spans =
        cards[2].querySelectorAll('span');

      if (spans[1]) {
        spans[1].textContent =
          `${inventory.length} mặt hàng`;
      }

      if (spans[2]) {
        spans[2].textContent =
          'Sẵn sàng phục vụ';
      }
    }


    // ============================================================
    // CARD 4 - NHÂN VIÊN TRỰC CA
    // ============================================================

    if (cards[3]) {

      const spans =
        cards[3].querySelectorAll('span');

      const currentUser =
        GymAPI.getCurrentUser();


      if (spans[1]) {
        spans[1].textContent =
          currentUser?.Fullname ||
          currentUser?.Username ||
          'Nhân viên';
      }


      // Tìm ca của nhân viên đang đăng nhập hôm nay
      const myShift =
        staffAttendance.find(item => {

          const itemDate =
            String(
              item.AttendanceDate ||
              item.ShiftDate ||
              ''
            ).substring(0, 10);

          const itemUserID =
            item.UserID ??
            item.FKUserID ??
            item.EmployeeID;

          return (
            itemDate === today &&
            Number(itemUserID) ===
              Number(currentUser?.UserID)
          );
        });


      if (spans[2]) {

        if (myShift) {

          if (myShift.CheckInTime) {
            spans[2].textContent =
              `● Đang trực — vào ca ${myShift.CheckInTime}`;
          } else {
            spans[2].textContent =
              '● Chưa check-in ca hôm nay';
          }

        } else {

          spans[2].textContent =
            '● Chưa có ca hôm nay';
        }
      }
    }


    // ============================================================
    // CẬP NHẬT BIẾN POS
    // ============================================================

    currentShiftRevenue =todayRevenue;

    currentShiftOrders =todayPayments.length;


    // ============================================================
    // DEBUG - XEM CONSOLE ĐỂ ĐỐI CHIẾU DATABASE
    // ============================================================

    console.log(
      '[DASHBOARD STAFF DATA]',
      {
        today,
        doanhThuHomNay: todayRevenue,
        soHoaDon: todayPayments.length,
        luotKhach: todayAttendance.length,
        dangTrongPhong: currentInGym,
        soMatHang: inventory.length,
        nhanVien: GymAPI.getCurrentUser()
      }
    );


  } catch (error) {

    console.error(
      '[DASHBOARD STAFF KPI ERROR]',
      error
    );
  }
}
/**
 * Tải 5 hội viên check-in gần đây
 */
async function loadRecentCheckIns() {
  try {
    const tableBody =
      document.getElementById('recentCheckInTable');

    if (!tableBody) return;

    const result = await GymAPI.getAttendance();

    const attendanceList =
      Array.isArray(result)
        ? result
        : (result?.data || []);

    const recent =
      attendanceList.slice(0, 5);

    if (!recent.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4"
              style="text-align: center; padding: 30px; color: #9CA3AF;">
            Chưa có dữ liệu check-in
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = recent.map(item => `
      <tr>
        <td style="font-weight: 600;">
          ${item.MemberName || 'Không rõ'}
        </td>

        <td class="code-highlight">
          ${item.MemberCode || `HV-10${item.MemberID || ''}`}
        </td>

        <td class="time-highlight">
          ${item.CheckInTime || '--:--:--'}
        </td>

        <td>
          <span class="badge ${
            item.Type === 'Yoga'
              ? 'badge-yellow'
              : item.Type === 'Cardio'
                ? 'badge-blue'
                : 'badge-green'
          }">
            ${item.Type || 'Gym & Fitness'}
          </span>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error(
      '[DASHBOARD CHECK-IN]',
      error
    );
  }
}
/**
 * Tải bảng 5 lịch hẹn PT sắp tới
 */
async function loadUpcomingBookings() {
  const tableBody = document.getElementById('upcomingBookingTable');
  if (!tableBody) return;

  const bookings = await GymAPI.getBookings();
  const upcoming = bookings.slice(0, 5);

  tableBody.innerHTML = upcoming.map(item => `
    <tr>
      <td class="time-highlight">${item.StartTime}</td>
      <td style="font-weight: 600;">${item.MemberName}</td>
      <td>${item.TrainerName || 'HLV Ca Trực'}</td>
      <td style="color: var(--text-muted); font-size: 13px;">${item.Notes || 'Tập luyện khởi động'}</td>
    </tr>
  `).join('');
}

/**
 * Khởi tạo biểu đồ Chart.js (Biểu đồ doanh thu đỏ neon & Biểu đồ điểm danh tuần)
 */
async function initCharts() {
  const revenueCanvas =
    document.getElementById('revenueChart');

  const attendanceCanvas =
    document.getElementById('attendanceChart');

  // ============================================================
  // BIỂU ĐỒ DOANH THU 6 THÁNG - DỮ LIỆU THẬT
  // ============================================================

  if (
    revenueCanvas &&
    typeof Chart !== 'undefined'
  ) {
    try {
      const result =
        await GymAPI.getPayments();

      const payments =
        Array.isArray(result)
          ? result
          : (result?.data || []);

      const now = new Date();

      // Tạo danh sách 6 tháng gần nhất
      const months = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        );

        months.push({
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          label:
            `Tháng ${date.getMonth() + 1}`,
          revenue: 0
        });
      }

      // Cộng doanh thu thực tế theo từng tháng
      payments.forEach(payment => {
        const rawDate =
          payment.PaymentDate ||
          payment.CreatedAt ||
          payment.Date ||
          '';

        const date =
          String(rawDate).substring(0, 10);

        if (!date) return;

        const year =
          Number(date.substring(0, 4));

        const month =
          Number(date.substring(5, 7));

        const status =
          String(
            payment.Status || ''
          ).toLowerCase();

        // Không tính giao dịch chưa hoàn tất / đã hủy
        if (
          status === 'pending' ||
          status === 'cancelled' ||
          status === 'canceled'
        ) {
          return;
        }

        const foundMonth =
          months.find(item =>
            item.year === year &&
            item.month === month
          );

        if (foundMonth) {
          foundMonth.revenue +=
            Number(payment.Amount) || 0;
        }
      });

      const labels =
        months.map(item => item.label);

      // Đổi VNĐ -> triệu VNĐ để biểu đồ dễ nhìn
      const revenueData =
        months.map(item =>
          Number(
            (item.revenue / 1000000).toFixed(2)
          )
        );
        // ============================================================
// TÍNH TĂNG TRƯỞNG DOANH THU SO VỚI THÁNG TRƯỚC
// ============================================================

      const revenueGrowthBadge =
        document.getElementById(
          'revenueGrowthBadge'
        );

      if (
        revenueGrowthBadge &&
        months.length >= 2
      ) {
        const currentRevenue =
          months[months.length - 1].revenue;

        const previousRevenue =
          months[months.length - 2].revenue;

        if (previousRevenue > 0) {
          const growth =
            ((currentRevenue - previousRevenue) /
              previousRevenue) * 100;

          const sign =
            growth >= 0 ? '+' : '';

          revenueGrowthBadge.textContent =
            `${sign}${growth.toFixed(1)}% so với kỳ trước`;

          revenueGrowthBadge.classList.remove(
            'badge-red',
            'badge-green'
          );

          revenueGrowthBadge.classList.add(
            growth >= 0
              ? 'badge-green'
              : 'badge-red'
          );
        } else {
          revenueGrowthBadge.textContent =
            'Chưa có dữ liệu kỳ trước';
        }
      }

      const ctx =
        revenueCanvas.getContext('2d');

      const gradient =
        ctx.createLinearGradient(
          0,
          0,
          0,
          200
        );

      gradient.addColorStop(
        0,
        '#FF334B'
      );

      gradient.addColorStop(
        1,
        '#990011'
      );

      revenueChartInstance =
        new Chart(ctx, {
          type: 'bar',

          data: {
            labels: labels,

            datasets: [{
              label:
                'Doanh thu (Triệu VNĐ)',

              data: revenueData,

              backgroundColor:
                gradient,

              borderRadius: 6,

              barPercentage: 0.55
            }]
          },

          options: {
            responsive: true,

            maintainAspectRatio: false,

            plugins: {
              legend: {
                display: false
              },

              tooltip: {
                callbacks: {
                  label: context => {
                    return `${context.raw} triệu VNĐ`;
                  }
                }
              }
            },

            scales: {
              x: {
                grid: {
                  color:
                    'rgba(255,255,255,0.05)'
                },

                ticks: {
                  color: '#9CA3AF'
                }
              },

              y: {
                beginAtZero: true,

                grid: {
                  color:
                    'rgba(255,255,255,0.05)'
                },

                ticks: {
                  color: '#9CA3AF'
                }
              }
            }
          }
        });

      console.log(
        '[DASHBOARD REVENUE CHART]',
        months
      );

    } catch (error) {
      console.error(
        '[DASHBOARD REVENUE CHART ERROR]',
        error
      );
    }
  }

  // ============================================================
  // BIỂU ĐỒ CHECK-IN
  // TẠM GIỮ NGUYÊN - SẼ ĐỔI SANG DATABASE Ở BƯỚC TIẾP THEO
  // ============================================================

 if (
  attendanceCanvas &&
  typeof Chart !== 'undefined'
) {
  try {
    // ============================================================
    // LẤY ATTENDANCE THẬT
    // ============================================================

    const result =
      await GymAPI.getAttendance();

    const attendance =
      Array.isArray(result)
        ? result
        : (result?.data || []);

    // ============================================================
    // XÁC ĐỊNH TUẦN HIỆN TẠI
    // Thứ 2 -> Chủ nhật
    // ============================================================

    const now = new Date();

    const currentDay =
      now.getDay();

    // JS: CN = 0, Thứ 2 = 1, ..., Thứ 7 = 6
    const daysFromMonday =
      currentDay === 0
        ? 6
        : currentDay - 1;

    const monday =
      new Date(now);

    monday.setDate(
      now.getDate() - daysFromMonday
    );

    monday.setHours(
      0, 0, 0, 0
    );

    // ============================================================
    // TẠO 7 NGÀY TRONG TUẦN
    // ============================================================

    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const date =
        new Date(monday);

      date.setDate(
        monday.getDate() + i
      );

      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, '0');

      const day =
        String(
          date.getDate()
        ).padStart(2, '0');

      weekDays.push({
        date:
          `${year}-${month}-${day}`,

        label: [
          'Thứ 2',
          'Thứ 3',
          'Thứ 4',
          'Thứ 5',
          'Thứ 6',
          'Thứ 7',
          'CN'
        ][i],

        count: 0
      });
    }

    // ============================================================
    // ĐẾM CHECK-IN THEO TỪNG NGÀY
    // ============================================================

    attendance.forEach(item => {
      const attendanceDate =
        String(
          item.AttendanceDate ||
          item.CheckInDate ||
          item.Date ||
          ''
        ).substring(0, 10);

      const found =
        weekDays.find(
          day =>
            day.date === attendanceDate
        );

      if (found) {
        found.count++;
      }
    });

    const labels =
      weekDays.map(
        day => day.label
      );

    const attendanceData =
      weekDays.map(
        day => day.count
      );

    // ============================================================
    // HÔM NAY
    // ============================================================

    const todayString =
      `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;

    const todayData =
      weekDays.find(
        day => day.date === todayString
      );

    const todayCount =
      todayData?.count || 0;

    // ============================================================
    // CẬP NHẬT BADGE "HÔM NAY"
    // ============================================================

    const attendanceCard =
      attendanceCanvas.closest(
        '.glass-card'
      );

    if (attendanceCard) {
      const badge =
        attendanceCard.querySelector(
          'span'
        );

      if (badge) {
        badge.textContent =
          `Hôm nay: ${todayCount} lượt`;
      }
    }

    // ============================================================
    // VẼ BIỂU ĐỒ
    // ============================================================

    const ctx2 =
      attendanceCanvas.getContext('2d');

    attendanceChartInstance =
      new Chart(ctx2, {
        type: 'line',

        data: {
          labels: labels,

          datasets: [{
            label:
              'Lượt Check-in',

            data:
              attendanceData,

            borderColor:
              '#10B981',

            backgroundColor:
              'rgba(16, 185, 129, 0.1)',

            fill: true,

            tension: 0.4,

            pointBackgroundColor:
              '#10B981',

            pointRadius: 4
          }]
        },

        options: {
          responsive: true,

          maintainAspectRatio: false,

          plugins: {
            legend: {
              display: false
            },

            tooltip: {
              callbacks: {
                label: context =>
                  `${context.raw} lượt check-in`
              }
            }
          },

          scales: {
            x: {
              grid: {
                color:
                  'rgba(255,255,255,0.05)'
              },

              ticks: {
                color:
                  '#9CA3AF'
              }
            },

            y: {
              beginAtZero: true,

              ticks: {
                precision: 0,

                color:
                  '#9CA3AF'
              },

              grid: {
                color:
                  'rgba(255,255,255,0.05)'
              }
            }
          }
        }
      });

    console.log(
      '[DASHBOARD ATTENDANCE CHART]',
      {
        weekDays,
        todayCount
      }
    );

  } catch (error) {
    console.error(
      '[DASHBOARD ATTENDANCE CHART ERROR]',
      error
    );
  }
}
}

/**
 * Xử lý sự kiện điểm danh nhanh từ Modal
 */
async function handleQuickCheckIn() {
  const memberSelect = document.getElementById('quickCheckInMember');
  const typeSelect = document.getElementById('quickCheckInType');
  if (!memberSelect || !memberSelect.value) {
    showToast('Vui lòng chọn hội viên để check-in', 'error');
    return;
  }

  const result = await GymAPI.checkIn(memberSelect.value, typeSelect ? typeSelect.value : 'Gym & Fitness');
  if (result.success) {
    showToast(`Check-in thành công: ${result.data.MemberName} (${result.data.CheckInTime})`, 'success');
    closeModal('quickCheckInModal');
  } else {
    showToast(result.message || 'Lỗi khi điểm danh', 'error');
  }
}

/**
 * Mở Modal điểm danh nhanh và nạp danh sách hội viên vào dropdown
 */
async function openQuickCheckInModal() {
  const select = document.getElementById('quickCheckInMember');
  if (select) {
    const members = await GymAPI.getMembers();
    select.innerHTML = members.map(m => `
      <option value="${m.MemberID}">${m.Code} - ${m.Fullname} (${m.PackageName})</option>
    `).join('');
  }
  openModal('quickCheckInModal');
}

window.openQuickCheckInModal = openQuickCheckInModal;
window.handleQuickCheckIn = handleQuickCheckIn;

// ==============================================================================
// STAFF DASHBOARD / QUẦY BÁN HÀNG & LỄ TÂN (POS)
// ==============================================================================

let currentStaffPosCategory = 'all';

async function loadStaffPosItems(category = 'all') {
  const tableBody = document.getElementById('staffPosTableBody');
  if (!tableBody) return;

  currentStaffPosCategory = category;

  // Lấy danh sách sản phẩm trực tiếp từ kho hàng trong database
  let items = await GymAPI.getInventory();

  if (!Array.isArray(items)) {
      items = items?.data || [];
  }

  if (category !== 'all') {
    items = items.filter(p => p.Category === category);
  }

  tableBody.innerHTML = items.map(item => {
    const itemName = item.ProductName || item.Name;
    const itemId = item.ProductID || item.ID;

    let catBadgeClass = 'badge-blue';
    if (item.Category === 'Clothing' || item.Category === 'Trang phục') catBadgeClass = 'badge-yellow';
    else if (item.Category === 'Accessory' || item.Category === 'Phụ kiện') catBadgeClass = 'badge-red';
    else if (item.Category === 'Beverage' || item.Category === 'Đồ uống') catBadgeClass = 'badge-green';

    const isOutOfStock = item.Stock !== undefined && item.Stock <= 0;
    const stockDisplay = isOutOfStock
      ? '<span class="badge badge-red">Hết hàng (0)</span>'
      : (typeof item.Stock === 'number' ? `<span style="color: #10B981; font-weight: 700;">${item.Stock}</span>` : `<span style="color: #9CA3AF;">${item.Stock}</span>`);

    return `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
        <td style="padding: 14px 16px;">
          <div style="font-weight: 700; color: #FFFFFF;">${itemName}</div>
          <div style="font-size: 12px; color: #9CA3AF; margin-top: 2px;">${item.Description || ''}</div>
        </td>
        <td style="padding: 14px 16px; text-align: center;"><span class="badge ${catBadgeClass}">${item.Category}</span></td>

        <td style="color: #FF334B; font-weight: 800; padding: 14px 16px;">${formatVND(item.Price)}</td>
        <td style="padding: 14px 16px; text-align: center;">${stockDisplay}</td>
        <td style="text-align: center; padding: 14px 16px;">
          ${isOutOfStock ? `
            <button class="btn btn-secondary btn-sm" disabled style="opacity: 0.5; cursor: not-allowed; font-weight: 600;">
              <i class="fa fa-ban"></i> Hết hàng
            </button>
          ` : `
            <button class="btn btn-primary btn-sm"style="font-weight: 700; padding: 6px 14px;"onclick="openSaleModal(${itemId})">
              <i class="fa fa-shopping-cart"></i> Bán ngay
            </button>
          `}
        </td>
      </tr>
    `;
  }).join('');
}


function filterStaffPos(category, event) {
  document.querySelectorAll('#staffPosTabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  loadStaffPosItems(category);
}

//let currentShiftRevenue = 2850000;
//let currentShiftOrders = 8;

//let currentSaleItem = null;
let currentSaleItem = null;
let currentSellingItem = null;

let currentShiftRevenue = 0;
let currentShiftOrders = 0;

async function handleStaffQuickSell(itemId) {
    try {
        const items = await GymAPI.getInventory();

        const item = items.find(
            i => Number(i.ProductID) === Number(itemId)
        );

        if (!item) {
            showToast('Không tìm thấy sản phẩm trong kho', 'error');
            return;
        }

        if (Number(item.Stock) <= 0) {
            showToast(`Mặt hàng "${item.ProductName}" đã hết hàng!`, 'error');
            return;
        }

        // Hiển thị hộp xác nhận đơn giản
        const quantityInput = prompt(
            `Bán sản phẩm: ${item.ProductName}\n` +
            `Đơn giá: ${formatVND(item.Price)}\n` +
            `Tồn kho: ${item.Stock}\n\n` +
            `Nhập số lượng:`,
            '1'
        );

        if (quantityInput === null) {
            return;
        }

        const quantity = Number(quantityInput);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            showToast('Số lượng không hợp lệ', 'error');
            return;
        }

        if (quantity > Number(item.Stock)) {
            showToast(
                `Không đủ hàng! Chỉ còn ${item.Stock} sản phẩm.`,
                'error'
            );
            return;
        }

        const paymentMethod = 'Tiền mặt';

        const result = await GymAPI.createSale({
            ProductID: Number(item.ProductID),
            Quantity: quantity,
            PaymentMethod: paymentMethod
        });

        console.log('CREATE SALE RESULT:', result);

        if (!result || !result.success) {
            showToast(
                result?.message || 'Không thể thực hiện bán hàng',
                'error'
            );
            return;
        }

        currentShiftRevenue += Number(result.data?.Subtotal || 0);
        currentShiftOrders += 1;

        const revEl = document.getElementById('staffShiftRevenue');
        if (revEl) {
            revEl.textContent = formatVND(currentShiftRevenue);
        }

        showToast(
            `Đã bán ${quantity} ${item.ProductName} - ${formatVND(result.data?.Subtotal || 0)}`,
            'success'
        );

        await loadStaffPosItems(currentStaffPosCategory);

    } catch (error) {
        console.error('Quick Sell Error:', error);
        showToast('Không thể thực hiện bán hàng', 'error');
    }
}
function updateSaleTotal() {
    if (!currentSellingItem) return;

    const quantity =
        Number(document.getElementById('saleQuantity')?.value) || 1;

    const total =
        quantity * Number(currentSellingItem.Price || 0);

    const totalEl =
        document.getElementById('saleTotal');

    if (totalEl) {
        totalEl.textContent = formatVND(total);
    }
}
async function openSaleModal(itemId) {
    try {
        let items = await GymAPI.getInventory();

        // API có thể trả về mảng hoặc { data: [...] }
        if (!Array.isArray(items)) {
            items = items?.data || [];
        }

        const item = items.find(
            i => Number(i.ProductID || i.ID) === Number(itemId)
        );

        if (!item) {
            console.error('Không tìm thấy sản phẩm:', {
                itemId,
                items
            });

            showToast('Không tìm thấy sản phẩm trong kho!', 'error');
            return;
        }

        const productId =
            Number(item.ProductID || item.ID);

        const productName =
            item.ProductName || item.Name || 'Sản phẩm';

        const price =
            Number(item.Price) || 0;

        const stock =
            Number(item.Stock) || 0;

        if (stock <= 0) {
            showToast(
                `"${productName}" đã hết hàng!`,
                'error'
            );
            return;
        }

        // Lưu sản phẩm đang bán
        currentSaleItem = {
          ...item,
          ProductID: productId,
          ProductName: productName,
          Price: price,
          Stock: stock
        };

        currentSellingItem = currentSaleItem;
        window.currentSellingItem = currentSellingItem;

        console.log(
            '[SALE MODAL] Sản phẩm:',
            currentSellingItem
        );

        // =========================
        // ĐỔ DỮ LIỆU VÀO MODAL
        // =========================

        const nameEl =
            document.getElementById('saleProductName');

        const priceEl =
            document.getElementById('saleProductPrice');

        const stockEl =
            document.getElementById('saleProductStock');

        const quantityEl =
            document.getElementById('saleQuantity');

        const paymentEl =
            document.getElementById('salePaymentMethod');

        // Tên sản phẩm
        if (nameEl) {
            nameEl.textContent = productName;
        }

        // Đơn giá
        if (priceEl) {
            priceEl.textContent = formatVND(price);
        }

        // Tồn kho
        if (stockEl) {
            stockEl.textContent = `Tồn kho: ${stock}`;
        }

        // Số lượng mặc định
        if (quantityEl) {
            quantityEl.value = 1;
            quantityEl.min = 1;
            quantityEl.max = stock;
        }

        // Mặc định tiền mặt
        if (paymentEl) {
            paymentEl.value = 'Tiền mặt';
        }

        // Tính tổng
        updateSaleTotal();

        // Mở modal
        openModal('saleModal');

    } catch (error) {

        console.error(
            '[OPEN SALE MODAL ERROR]',
            error
        );

        showToast(
            'Không thể lấy thông tin sản phẩm!',
            'error'
        );
    }
}
async function handleConfirmSale(event) {
    event.preventDefault();

    const item = window.currentSellingItem;

    if (!item) {
        showToast('Không xác định được sản phẩm!', 'error');
        return;
    }

    const quantity =
        Number(document.getElementById('saleQuantity').value);

    const paymentMethod =
        document.getElementById('salePaymentMethod').value;

    if (!quantity || quantity < 1) {
        showToast('Số lượng không hợp lệ!', 'error');
        return;
    }

    if (quantity > Number(item.Stock)) {
        showToast('Số lượng bán vượt quá tồn kho!', 'error');
        return;
    }

    const unitPrice = Number(item.Price) || 0;
    const subtotal = quantity * unitPrice;

    try {

        const currentUser =
            (typeof GymAPI !== 'undefined' &&
             GymAPI.getCurrentUser)
                ? GymAPI.getCurrentUser()
                : null;

        const result = await GymAPI.createSale({
            FKUserID: currentUser ? Number(currentUser.UserID) : null,

            TotalAmount: subtotal,

            PaymentMethod: paymentMethod,

            Status: 'Completed',

            items: [
                {
                    FKProductID: Number(item.ProductID),
                    Quantity: quantity,
                    UnitPrice: unitPrice,
                    Subtotal: subtotal
                }
            ]
        });

        if (!result.success) {
            showToast(
                result.message || 'Bán hàng thất bại!',
                'error'
            );
            return;
        }

          showToast(
                `Bán ${quantity} ${item.ProductName} thành công!`,
                'success'
            );

            closeModal('saleModal');

            window.currentSellingItem = null;

            // Reload dữ liệu từ DATABASE
            await loadStaffDashboardStats();

            // Reload danh sách sản phẩm / tồn kho
            await loadStaffPosItems(
                typeof currentStaffPosCategory !== 'undefined'
                    ? currentStaffPosCategory
                    : 'all'
            );

        // Reload danh sách sản phẩm
        await loadStaffPosItems(
            typeof currentStaffPosCategory !== 'undefined'
                ? currentStaffPosCategory
                : 'all'
        );

        window.currentSellingItem = null;

    } catch (error) {

        console.error('Lỗi bán hàng:', error);

        showToast(
            'Không thể kết nối máy chủ!',
            'error'
        );
    }
}

async function submitSale(e) {
    if (e) e.preventDefault();

    if (!currentSaleItem) {
        showToast('Chưa chọn sản phẩm!', 'error');
        return;
    }

    const quantity =
        Number(document.getElementById('saleQuantity')?.value) || 1;

    if (quantity <= 0) {
        showToast('Số lượng không hợp lệ!', 'error');
        return;
    }

    if (quantity > Number(currentSaleItem.Stock)) {
        showToast('Số lượng bán vượt quá tồn kho!', 'error');
        return;
    }

    const paymentMethod =
        document.getElementById('salePaymentMethod')?.value ||
        'Tiền mặt';

    const total =
        Number(currentSaleItem.Price) * quantity;

    try {
        const result = await GymAPI.createSale({
            ProductID: Number(currentSaleItem.ProductID),
            Quantity: quantity,
            UnitPrice: Number(currentSaleItem.Price),
            TotalAmount: total,
            PaymentMethod: paymentMethod
        });

        if (!result || !result.success) {
            showToast(
                result?.message || 'Bán hàng thất bại!',
                'error'
            );
            return;
        }

        showToast('Bán hàng thành công!', 'success');

        closeModal('saleModal');

        currentSaleItem = null;

        await loadStaffPosItems(currentStaffPosCategory);

    } catch (error) {
        console.error('Submit Sale Error:', error);
        showToast('Không thể kết nối máy chủ!', 'error');
    }
}


async function loadStaffRecentAttendees() {
  const container = document.getElementById('staffRecentCheckInList');
  if (!container) return;

  const attendanceList = await GymAPI.getAttendance();
  const recent = attendanceList.slice(0, 5);

  container.innerHTML = recent.map(item => `
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 10px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);"></div>
        <div>
          <div style="font-weight: 700; color: #FFFFFF; font-size: 13.5px;">${item.MemberName}</div>
          <div style="font-size: 12px; color: #9CA3AF; margin-top: 1px;">${item.MemberCode || `HV-10${item.MemberID}`} • ${item.CheckInTime}</div>
        </div>
      </div>
      <span class="badge badge-green" style="font-size: 11.5px; padding: 4px 10px;">Đang tập</span>
    </div>
  `).join('');
}

async function handleStaffQuickCheckIn() {
  const inp = document.getElementById('staffQuickCheckInInp');
  if (!inp || !inp.value.trim()) {
    showToast('Vui lòng nhập mã hội viên hoặc tên', 'error');
    return;
  }

  const term = inp.value.trim();
  const members = await GymAPI.getMembers();
  const found = members.find(m => 
    m.Code.toLowerCase() === term.toLowerCase() || 
    m.Fullname.toLowerCase().includes(term.toLowerCase())
  );

  if (found) {
    const res = await GymAPI.checkIn(found.MemberID, found.PackageName || 'Gym & Fitness');
    if (res.success) {
      showToast(`Check-in thành công: ${found.Fullname} (${found.Code})`, 'success');
      inp.value = '';
      loadStaffRecentAttendees();
    }
  } else {
    showToast('Không tìm thấy mã hội viên này trong hệ thống', 'error');
  }
}

window.filterStaffPos = filterStaffPos;
window.handleStaffQuickSell = handleStaffQuickSell;
window.handleStaffQuickCheckIn = handleStaffQuickCheckIn;
window.loadStaffPosItems = loadStaffPosItems;
window.loadStaffRecentAttendees = loadStaffRecentAttendees;
window.openSaleModal = openSaleModal;

