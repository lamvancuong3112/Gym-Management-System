/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)
 * ĐIỀU KHIỂN PHÂN HỆ QUẢN TRỊ, GÓI TẬP, THANH TOÁN, KHO, LƯƠNG & BÁO CÁO (admin.js)
 * ==============================================================================
 */

let currentInventoryCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  // Đặt lại dữ liệu chấm công sạch sẽ mỗi lần F5 để dễ dàng test
  if (typeof MockDB !== 'undefined' && typeof DEFAULT_DATABASE !== 'undefined') {
    const db = MockDB.getDB();
    db.staff_attendance = JSON.parse(JSON.stringify(DEFAULT_DATABASE.staff_attendance || []));
    MockDB.saveDB(db);
  }

  loadMySalary();
  initAdminTabsFromHash();
  window.addEventListener('hashchange', initAdminTabsFromHash);
  
  await loadPackages();
  await loadPayments();
  await loadInventory();
  await loadStaffAttendance();
  await updateStaffCurrentShiftUI();
  await loadSalaries();
  await loadUsers();
});



/**
 * Điều hướng Tab dựa theo URL hash (#packages, #payments, #inventory, #attendance_manage, #salaries, #users, #reports)
 */
function initAdminTabsFromHash() {
  const hash = window.location.hash.replace('#', '');
  const validTabs = ['packages', 'payments', 'inventory', 'staff_attendance', 'attendance_manage', 'salaries', 'users', 'reports', 'my_salary', 'my_attendance'];
  
  if (validTabs.includes(hash)) {
    switchAdminTab(hash);
  } else {
    switchAdminTab('packages');
  }
}

/**
 * Chuyển đổi tab hiển thị
 */
function switchAdminTab(tabId) {
  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.style.display = sec.id === `section_${tabId}` ? 'block' : 'none';
  });

  if (tabId === 'packages') {
    loadPackages();
  } else if (tabId === 'payments') {
    loadPayments();
  } else if (tabId === 'inventory') {
    loadInventory();
  } else if (tabId === 'staff_attendance') {
    loadStaffAttendanceData();
    updateStaffCurrentShiftUI();
    startStaffRealtimeClock();
  } else if (tabId === 'attendance_manage') {
    loadMemberAttendance();
  } else if (tabId === 'my_attendance') {
    loadStaffAttendance(); 
  } else if (tabId === 'salaries') {
    loadSalaries();
  } else if (tabId === 'my_salary') {
    loadMySalary();
  } else if (tabId === 'users') {
    loadUsers();
  } else if (tabId === 'reports') {
    loadReportsData();
    setTimeout(initReportChart, 100);
}
}
async function loadMemberAttendance() {
    const tableBody = document.getElementById('fullAttendanceTable');

    if (!tableBody) {
        console.error('Không tìm thấy fullAttendanceTable');
        return;
    }

    try {

        const records = await GymAPI.getAttendance();

        if (!records || records.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7"
                        style="text-align:center; padding:30px; color:#9CA3AF;">
                        Chưa có dữ liệu điểm danh
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = records.map(a => {

            const checkOutButton = !a.CheckOutTime
                ? `
                    <button
                        class="btn btn-secondary btn-sm"
                        style="margin-right:5px;"
                        onclick="handleMemberAttendanceCheckOut(${a.AttendanceID})">
                        Check-out
                    </button>
                  `
                : `
                    <span style="
                        color:#00D084;
                        font-weight:600;
                        margin-right:8px;">
                        Đã hoàn thành
                    </span>
                  `;

            return `
                <tr>

                    <td style="
                        color:#FFFFFF;
                        padding:14px 18px;">
                        ${a.AttendanceID}
                    </td>

                    <td style="
                        color:#FFFFFF;
                        padding:14px 18px;">
                        ${a.CheckInTime || '-'}
                    </td>

                    <td style="
                        color:#FFFFFF;
                        padding:14px 18px;">
                        ${a.CheckOutTime || '-'}
                    </td>

                    <td style="
                        color:#FFFFFF;
                        padding:14px 18px;">
                        ${a.AttendanceDate || '-'}
                    </td>

                    <td style="
                        font-weight:700;
                        color:#FFFFFF;
                        padding:14px 18px;">
                        ${a.MemberID || '-'}
                    </td>

                    <td style="
                        text-align:center;
                        padding:14px 18px;">

                        ${
                            a.CheckOutTime
                                ? `
                                    <span style="
                                        color:#00D084;
                                        font-weight:600;">
                                        Hoàn thành
                                    </span>
                                  `
                                : `
                                    <span style="
                                        color:#F59E0B;
                                        font-weight:600;">
                                        Đang tập
                                    </span>
                                  `
                        }

                    </td>

                    <td style="
                        text-align:center;
                        padding:14px 18px;">

                        ${checkOutButton}

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="handleDeleteMemberAttendance(${a.AttendanceID})">
                            Xóa
                        </button>

                    </td>

                </tr>
            `;

        }).join('');

    } catch (error) {

        console.error(
            'Lỗi load Member Attendance:',
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#FF334B;">
                    Không thể tải dữ liệu điểm danh
                </td>
            </tr>
        `;
    }
}
async function handleMemberCheckIn() {
    const memberId = prompt('Nhập MemberID của hội viên cần check-in:');

    if (!memberId) {
        return;
    }

    if (!/^\d+$/.test(memberId)) {
        showToast('MemberID không hợp lệ!', 'error');
        return;
    }

    try {
        const result = await GymAPI.checkIn(Number(memberId));

        if (!result.success) {
            showToast(
                result.message || 'Check-in thất bại!',
                'error'
            );
            return;
        }

        showToast(
            `Check-in thành công: ${result.data.MemberName || 'Hội viên'}`,
            'success'
        );

        await loadMemberAttendance();

    } catch (error) {
        console.error('Lỗi check-in:', error);

        showToast(
            'Không thể kết nối máy chủ!',
            'error'
        );
    }
}
async function handleMemberAttendanceCheckOut(id) {

    try {

        const result = await GymAPI.checkOut(id);

        if (!result.success) {
            showToast(
                result.message || 'Check-out thất bại!',
                'error'
            );
            return;
        }

        showToast(
            'Check-out thành công!',
            'success'
        );

        await loadMemberAttendance();

    } catch (error) {

        console.error(error);

        showToast(
            'Không thể kết nối máy chủ!',
            'error'
        );
    }
}


async function handleDeleteMemberAttendance(id) {

    if (!confirm(
        'Bạn có chắc chắn muốn xóa bản ghi điểm danh này không?'
    )) {
        return;
    }

    try {

        const result =
            await GymAPI.deleteMemberAttendance(id);

        if (!result.success) {
            showToast(
                result.message || 'Xóa điểm danh thất bại!',
                'error'
            );
            return;
        }

        showToast(
            'Xóa điểm danh thành công!',
            'success'
        );

        await loadMemberAttendance();

    } catch (error) {

        console.error(error);

        showToast(
            'Không thể kết nối máy chủ!',
            'error'
        );
    }
}
function openMemberCheckInModal() {
    const modal = document.getElementById('memberCheckInModal');

    if (!modal) {
        showToast('Không tìm thấy cửa sổ Check-in!', 'error');
        return;
    }

    // Load danh sách hội viên vào dropdown
    GymAPI.getMembers()
        .then(members => {
            const select = document.getElementById('checkInMemberSelect');

            if (!select) return;

            select.innerHTML = '<option value="">-- Chọn hội viên --</option>';

            members.forEach(member => {
                select.innerHTML += `
                    <option value="${member.MemberID}">
                        ${member.Code || 'HV-' + member.MemberID} - ${member.Fullname}
                    </option>
                `;
            });

            openModal('memberCheckInModal');
        })
        .catch(error => {
            console.error('Lỗi tải danh sách hội viên:', error);
            showToast('Không thể tải danh sách hội viên!', 'error');
        });
}


async function submitMemberCheckIn() {
    const select = document.getElementById('checkInMemberSelect');
    const typeSelect = document.getElementById('checkInTypeSelect');

    if (!select || !select.value) {
        showToast('Vui lòng chọn hội viên!', 'error');
        return;
    }

    try {
        // CHECK-IN VÀO DATABASE
        const result = await GymAPI.checkIn(
            Number(select.value),
            typeSelect ? typeSelect.value : 'Gym & Fitness'
        );

        if (!result || !result.success) {
            showToast(
                result?.message || 'Check-in thất bại!',
                'error'
            );
            return;
        }

        // Check-in thành công
        showToast(
            `Check-in thành công: ${result.data?.MemberName || 'Hội viên'}`,
            'success'
        );

        // Đóng modal
        closeModal('memberCheckInModal');

        // Reload bảng riêng, không để lỗi reload
        // làm xuất hiện thông báo "Không thể kết nối máy chủ"
        try {
            await loadAttendanceList();
        } catch (error) {
            console.error(
                'Check-in thành công nhưng không reload được danh sách:',
                error
            );
        }

    } catch (error) {
        console.error('Lỗi check-in hội viên:', error);

        showToast(
            'Không thể kết nối máy chủ!',
            'error'
        );
    }
}

let reportChartInstance = null;

function initReportChart() {
  const ctx =
    document.getElementById('reportRevenueBarChart');

  if (!ctx || typeof Chart === 'undefined') {
    return;
  }

  if (reportChartInstance) {
    reportChartInstance.destroy();
  }

  const reportData =
    window.reportRevenueData || {
      payments: [],
      sales: []
    };

  const now = new Date();

    const labels = [];
    const membershipRevenueData = [];
    const productRevenueData = [];

  for (let i = 5; i >= 0; i--) {

    const date =
      new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

    const year = date.getFullYear();
    const month = date.getMonth();

    labels.push(`Thg ${month + 1}`);

    const nextMonth =
      new Date(
        year,
        month + 1,
        1
      );

    // DOANH THU GÓI TẬP
    const membershipRevenue =
      reportData.payments
        .filter(payment => {

          const rawDate =
            payment.PaymentDate ||
            payment.CreatedAt ||
            payment.Date ||
            '';

          const d = new Date(rawDate);

          const status =
            String(
              payment.Status ||
              payment.PaymentStatus ||
              ''
            ).toLowerCase();

          return (
            !isNaN(d.getTime()) &&
            d >= date &&
            d < nextMonth &&
            status !== 'pending' &&
            status !== 'cancelled' &&
            status !== 'canceled'
          );
        })
        .reduce(
          (sum, payment) =>
            sum +
            Number(
              payment.Amount ||
              payment.TotalAmount ||
              0
            ),
          0
        );

    // DOANH THU SẢN PHẨM
    const productRevenue =
      reportData.sales
        .filter(sale => {

          const rawDate =
            sale.SaleDate ||
            sale.CreatedAt ||
            sale.PaymentDate ||
            sale.Date ||
            '';

          const d = new Date(rawDate);

          const status =
            String(
              sale.Status || ''
            ).toLowerCase();

          return (
            !isNaN(d.getTime()) &&
            d >= date &&
            d < nextMonth &&
            status !== 'pending' &&
            status !== 'cancelled' &&
            status !== 'canceled'
          );
        })
        .reduce(
          (sum, sale) =>
            sum +
            Number(
              sale.TotalAmount ||
              sale.Amount ||
              0
            ),
          0
        );

        membershipRevenueData.push(
    Number((membershipRevenue / 1000000).toFixed(2))
    );

    productRevenueData.push(
    Number((productRevenue / 1000000).toFixed(2))
    );
  }

  reportChartInstance =
    new Chart(ctx, {
      type: 'bar',

      data: {
        labels,

        datasets: [
        {
            label: 'Gói tập',
            data: membershipRevenueData,
            backgroundColor: '#FF334B',
            borderRadius: 6,
            barThickness: 28,
            borderSkipped: false
        },
        {
            label: 'Bán lẻ sản phẩm',
            data: productRevenueData,
            backgroundColor: '#3B82F6',
            borderRadius: 6,
            barThickness: 28,
            borderSkipped: false
        }
        ]
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            backgroundColor:
              '#1E1624',

            titleColor:
              '#FFF',

            bodyColor:
              '#FF334B',

            borderColor:
              'rgba(255, 51, 75, 0.4)',

            borderWidth: 1,

            callbacks: {
              label: ctx =>
                `${ctx.raw} triệu VNĐ`
            }
          }
        },

        scales: {
          x: {
            grid: {
              display: false
            },

            ticks: {
              color: '#9CA3AF',

              font: {
                weight: '600',
                size: 12
              }
            }
          },

          y: {
            display: false,

            grid: {
              display: false
            }
          }
        }
      }
    });
}
function renderReportExtraData(data) {
    const {
        payments = [],
        sales = [],
        members = [],
        attendance = []
    } = data;

    const formatMoney = value =>
        new Intl.NumberFormat('vi-VN').format(
            Number(value) || 0
        ) + 'đ';

    const getDate = item =>
        new Date(
            item.PaymentDate ||
            item.SaleDate ||
            item.CreatedAt ||
            item.Date ||
            ''
        );

    // ============================================================
    // 1. DOANH THU GÓI TẬP / BÁN LẺ
    // ============================================================

    const validPayments = payments.filter(p => {
        const status =
            String(
                p.Status ||
                p.PaymentStatus ||
                ''
            ).toLowerCase();

        return (
            status !== 'pending' &&
            status !== 'cancelled' &&
            status !== 'canceled'
        );
    });

    const membershipRevenue =
        validPayments.reduce(
            (sum, p) =>
                sum +
                Number(
                    p.Amount ||
                    p.TotalAmount ||
                    0
                ),
            0
        );

    const productRevenue =
        sales.reduce(
            (sum, s) =>
                sum +
                Number(
                    s.TotalAmount ||
                    s.Amount ||
                    s.ItemSubtotal ||
                    s.Subtotal ||
                    0
                ),
            0
        );

    const membershipEl =
        document.getElementById(
            'repMembershipRevenue'
        );

    const retailEl =
        document.getElementById(
            'repRetailRevenue'
        );

    if (membershipEl) {
        membershipEl.textContent =
            formatMoney(membershipRevenue);
    }

    if (retailEl) {
        retailEl.textContent =
            formatMoney(productRevenue);
    }

    // ============================================================
    // 2. TỔNG SẢN PHẨM ĐÃ BÁN
    // ============================================================

    const productCount =
        sales.reduce(
            (sum, s) =>
                sum + Number(s.Quantity || 0),
            0
        );

    const productCountEl =
        document.getElementById(
            'repProductCount'
        );

    if (productCountEl) {
        productCountEl.textContent =
            `${productCount} sản phẩm`;
    }

    const breakdownTotalEl =
        document.getElementById(
            'repProductBreakdownTotal'
        );

    if (breakdownTotalEl) {
        breakdownTotalEl.textContent =
            formatMoney(productRevenue);
    }

    // ============================================================
    // 3. DOANH THU THEO NHÓM SẢN PHẨM
    // ============================================================

    const categories = {};

    sales.forEach(sale => {
        const category =
            sale.Category ||
            'Khác';

        const amount =
            Number(
                sale.TotalAmount ||
                sale.Amount ||
                sale.ItemSubtotal ||
                sale.Subtotal ||
                0
            );

        const quantity =
            Number(
                sale.Quantity ||
                sale.Qty ||
                sale.quantity ||
                0
            );

        if (!categories[category]) {
            categories[category] = {
                revenue: 0,
                quantity: 0
            };
        }

        categories[category].revenue += amount;
        categories[category].quantity += quantity;
    });

    const categoryContainer =
        document.getElementById(
            'reportProductCategories'
        );

    if (categoryContainer) {

        const categoryList =
            Object.entries(categories)
                .sort(
                    (a, b) =>
                        b[1].revenue -
                        a[1].revenue
                );

        if (!categoryList.length) {

            categoryContainer.innerHTML = `
                <div style="color:#9CA3AF;font-size:13px;">
                    Chưa có dữ liệu bán sản phẩm.
                </div>
            `;

        } else {

            const categoryColors = [
                '#FF334B',
                '#3B82F6',
                '#10B981',
                '#F59E0B',
                '#A855F7'
            ];

            categoryContainer.innerHTML =
                categoryList
                    .map(
                        ([category, info], index) => {

                            const percent =
                                productRevenue > 0
                                    ? (
                                        info.revenue /
                                        productRevenue *
                                        100
                                    )
                                    : 0;

                            const color =
                                categoryColors[
                                    index %
                                    categoryColors.length
                                ];

                            return `
                                <div>
                                    <div style="
                                        display:flex;
                                        justify-content:space-between;
                                        font-size:13px;
                                        margin-bottom:4px;
                                    ">
                                        <span style="
                                            color:#FFFFFF;
                                            font-weight:600;
                                        ">
                                            ${category}
                                        </span>

                                        <strong style="
                                            color:${color};
                                        ">
                                            ${formatMoney(info.revenue)}
                                            <span style="
                                                color:#9CA3AF;
                                                font-size:11.5px;
                                                font-weight:normal;
                                            ">
                                                (${percent.toFixed(1)}%)
                                            </span>
                                        </strong>
                                    </div>

                                    <div style="
                                        height:6px;
                                        background:rgba(255,255,255,0.08);
                                        border-radius:4px;
                                        overflow:hidden;
                                    ">
                                        <div style="
                                            width:${percent}%;
                                            height:100%;
                                            background:${color};
                                            border-radius:4px;
                                        "></div>
                                    </div>
                                </div>
                            `;
                        }
                    )
                    .join('');
        }
    }

    // ============================================================
    // 4. PHƯƠNG THỨC THANH TOÁN
    // ============================================================

    const paymentMethods = {
    'Banking': { amount: 0, count: 0 },
    'VNPay-QR': { amount: 0, count: 0 },
    'Momo': { amount: 0, count: 0 },
    'ZaloPay': { amount: 0, count: 0 },
    'Visa/Master': { amount: 0, count: 0 },
    'Cash': { amount: 0, count: 0 }
};

payments.forEach(payment => {

    const rawMethod = String(
    payment.PaymentMethod || ''
).trim().toLowerCase();

let method = 'Khác';

if (rawMethod.includes('momo')) {
    method = 'Momo';
} else if (
    rawMethod.includes('vnpay') ||
    rawMethod.includes('vnpay-qr')
) {
    method = 'VNPay-QR';
} else if (rawMethod.includes('zalo')) {
    method = 'ZaloPay';
} else if (
    rawMethod.includes('visa') ||
    rawMethod.includes('master') ||
    rawMethod.includes('card')
) {
    method = 'Visa/Master';
} else if (
    rawMethod.includes('bank') ||
    rawMethod.includes('chuyển khoản')
) {
    method = 'Banking';
} else if (
    rawMethod.includes('cash') ||
    rawMethod.includes('tiền mặt')
) {
    method = 'Cash';
}

const amount =
    Number(
        payment.Amount ||
        payment.TotalAmount ||
        0
    );

    if (!paymentMethods[method]) {
        paymentMethods[method] = {
            amount: 0,
            count: 0
        };
    }

    paymentMethods[method].amount += amount;
    paymentMethods[method].count++;
});

    const paymentCard =
        document.querySelector(
            '#section_reports .glass-card'
        );

    // Tìm card theo tiêu đề "Tỷ trọng Phương thức Thanh toán"
    const paymentCards =
        [...document.querySelectorAll(
            '#section_reports .glass-card'
        )];

    const paymentMethodCard =
        paymentCards.find(card =>
            card.innerText.includes(
                'Tỷ trọng Phương thức Thanh toán'
            )
        );

    if (paymentMethodCard) {

        const methodContainer =
            paymentMethodCard.querySelector(
                ':scope > div:last-child'
            );

        if (methodContainer) {

            const totalTransactions =
                validPayments.length;

            const entries =
                Object.entries(paymentMethods)
                    .sort(
                        (a, b) =>
                            b[1].amount -
                            a[1].amount
                    );

                    methodContainer.innerHTML = entries.map(([method, info]) => {

                            const percent =
                                membershipRevenue > 0
                                    ? (
                                        info.amount /
                                        membershipRevenue *
                                        100
                                    )
                                    : 0;
                                     return ` 
                                    <div style=" 
                                        background:rgba(255,255,255,0.03); 
                                        padding:9px 12px; 
                                        border-radius:8px; 
                                        border:1px solid rgba(255,255,255,0.06); 
                                    "> 
                                        <div style=" 
                                            display:flex; 
                                            justify-content:space-between; 
                                            align-items:center; 
                                            margin-bottom:7px; 
                                        "> 
                                            <span style=" 
                                                color:#FFFFFF; 
                                                font-size:13px; 
                                                font-weight:600; 
                                            "> 
                                                ${method} 
                                            </span> 

                                            <strong style=" 
                                                color:#10B981; 
                                                font-size:13.5px; 
                                            "> 
                                                ${formatMoney(info.amount)} 
                                                <span style=" 
                                                    color:#9CA3AF; 
                                                    font-size:11.5px; 
                                                    font-weight:normal; 
                                                "> 
                                                    (${percent.toFixed(1)}%) 
                                                </span> 
                                            </strong> 
                                        </div> 

                                        <div style=" 
                                            width:100%; 
                                            height:5px; 
                                            background:rgba(255,255,255,0.08); 
                                            border-radius:5px; 
                                            overflow:hidden; 
                                        "> 
                                            <div style=" 
                                                width:${Math.min(percent, 100)}%; 
                                                height:100%; 
                                                background:#10B981; 
                                                border-radius:5px; 
                                            "></div> 
                                        </div> 
                                    </div> 
                                `;
                                }).join('');

                                const headerSpan = 
                                    paymentMethodCard.querySelector( 
                                        ':scope > div:first-child span' 
                                    ); 

                                if (headerSpan) { 
                                    headerSpan.textContent = 
                                        `${totalTransactions} Giao dịch`; 
                                }       
        }
    }
                         


    // ============================================================
    // 5. TỶ LỆ KÍCH HOẠT HỘI VIÊN
    // ============================================================

    const activeMembers =
        members.filter(member =>
            String(
                member.Status || ''
            ).toLowerCase() === 'active'
        ).length;

    const activationRate =
        members.length > 0
            ? activeMembers /
              members.length *
              100
            : 0;

    const activationEl =
        document.getElementById(
            'repActivationRate'
        );

    if (activationEl) {
        activationEl.textContent =
            `${activationRate.toFixed(1)}%`;
    }

    // ============================================================
    // 6. CHECK-IN TRUNG BÌNH / NGÀY
    // ============================================================

    const validAttendance =
        attendance.filter(item => {

            const date =
                new Date(
                    item.AttendanceDate ||
                    item.CheckInDate ||
                    item.Date ||
                    ''
                );

            return !isNaN(date.getTime());
        });

    const uniqueDays =
        new Set(
            validAttendance.map(item =>
                String(
                    item.AttendanceDate ||
                    item.CheckInDate ||
                    item.Date ||
                    ''
                ).substring(0, 10)
            )
        ).size;

    const avgAttendance =
        uniqueDays > 0
            ? validAttendance.length /
              uniqueDays
            : 0;

    const avgAttendanceEl =
        document.getElementById(
            'repAvgAttendance'
        );

    if (avgAttendanceEl) {
        avgAttendanceEl.textContent =
            `${avgAttendance.toFixed(1)} lượt/ngày`;
    }
}



// ==============================================================================
// 1. QUẢN LÝ BẢNG GIÁ GÓI TẬP (PACKAGES)
// ==============================================================================

async function loadPackages() {
  const container = document.getElementById('packageTableBody');
  if (!container) return;

  const packages = await GymAPI.getPackages();
  container.innerHTML = packages.map(p => `
    <tr>
      <td style="font-weight: 700; color: #FFFFFF;">${p.PackageID}</td>
      <td style="font-weight: 700; color: #FFFFFF;">${p.PackageName}</td>
      <td style="color: #E5E7EB;">${p.Duration}</td>
      <td style="font-weight: 700; color: #FFFFFF;">${formatVND(p.Price)}</td>
      <td style="color: #D1D5DB;">${p.Description || 'Gói tập tiêu chuẩn'}</td>
      <td style="text-align: center;">
        <div style="display: inline-flex; gap: 14px; justify-content: center; align-items: center;">
          <button class="action-btn" title="Sửa gói tập" onclick="openEditPackageModal(${p.PackageID})" style="background: transparent; border: none; color: #FFFFFF; font-size: 18px; cursor: pointer; padding: 4px;">
            <i class="fa fa-edit"></i>
          </button>
          <button class="action-btn" title="Xóa gói tập" onclick="handleDeletePackage(${p.PackageID})" style="background: transparent; border: none; color: #FFFFFF; font-size: 18px; cursor: pointer; padding: 4px;">
            <i class="fa fa-trash-alt"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function handleDeletePackage(pkgId) {
  if (!confirm('Bạn có chắc chắn muốn xóa gói tập này?')) return;
  const res = await GymAPI.deletePackage(pkgId);
  if (res.success) {
    showToast(res.message || 'Đã xóa gói tập thành công!', 'success');
    loadPackages();
  } else {
    showToast(res.message || 'Không thể xóa gói tập!', 'error');
  }
}


function openAddPackageModal() {
  document.getElementById('packageModalTitle').textContent = 'Thêm Gói tập Mới';
  document.getElementById('packageForm').reset();
  document.getElementById('pkgId').value = '';
  openModal('packageModal');
}

async function openEditPackageModal(id) {
  const packages = await GymAPI.getPackages();
  const pkg = packages.find(p => p.PackageID === Number(id));
  if (!pkg) return;

  document.getElementById('packageModalTitle').textContent = 'Chỉnh sửa Gói tập';
  document.getElementById('pkgId').value = pkg.PackageID;
  document.getElementById('pkgName').value = pkg.PackageName;
  document.getElementById('pkgDuration').value = pkg.Duration;
  document.getElementById('pkgPrice').value = pkg.Price;
  document.getElementById('pkgDescription').value = pkg.Description || '';
  openModal('packageModal');
}

async function handleSavePackage(e) {
    e.preventDefault();

    const id = document.getElementById('pkgId').value;
    const name = document.getElementById('pkgName').value.trim();
    const duration = Number(document.getElementById('pkgDuration').value);
    const price = Number(document.getElementById('pkgPrice').value);
    const description = document.getElementById('pkgDescription').value.trim();

    const pkgData = {
        packageName: name,
        duration: duration,
        price: price,
        description: description
    };

    let res;

    if (id) {
        pkgData.packageID = Number(id);
        res = await GymAPI.updatePackage(pkgData);
    } else {
        res = await GymAPI.addPackage(pkgData);
    }

    if (!res.success) {
        showToast(res.message || 'Lưu gói tập thất bại!', 'error');
        return;
    }

    showToast(
        id ? 'Cập nhật gói tập thành công!' : 'Thêm gói tập mới thành công!',
        'success'
    );

    closeModal('packageModal');
    await loadPackages();
}
// ==============================================================================
// 2. QUẢN LÝ THANH TOÁN & HÓA ĐƠN (PAYMENTS)
// ==============================================================================

function renderPaymentMethodBadge(method) {
  const m = (method || '').toLowerCase();
  if (m.includes('momo')) {
    return `<span class="badge" style="background: rgba(236, 72, 153, 0.15); color: #F472B6; border: 1px solid rgba(236, 72, 153, 0.35); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa fa-wallet" style="color: #F472B6;"></i> MoMo</span>`;
  }
  if (m.includes('vnpay')) {
    return `<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.35); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa fa-qrcode" style="color: #F87171;"></i> VNPay-QR</span>`;
  }
  if (m.includes('zalo')) {
    return `<span class="badge" style="background: rgba(14, 165, 233, 0.15); color: #38BDF8; border: 1px solid rgba(14, 165, 233, 0.35); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa fa-mobile-alt" style="color: #38BDF8;"></i> ZaloPay</span>`;
  }
  if (m.includes('visa') || m.includes('master') || m.includes('card')) {
    return `<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.35); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa fa-credit-card" style="color: #FBBF24;"></i> Visa / Master</span>`;
  }
  if (m.includes('bank') || m.includes('chuyển khoản')) {
    return `<span class="badge" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.35); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa fa-university" style="color: #60A5FA;"></i> Banking</span>`;
  }
  return `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.35); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa fa-money-bill-wave" style="color: #34D399;"></i> Tiền mặt (Cash)</span>`;
}
async function openEditPaymentModal(id) {

    const paymentsResult = await GymAPI.getPayments();
    const payments = paymentsResult.data || [];

    const payment = payments.find(
        p => Number(p.PaymentsID) === Number(id)
    );

    if (!payment) {
        showToast('Không tìm thấy giao dịch!', 'error');
        return;
    }

    // Lấy danh sách gói hội viên
    const memberPackageResponse = await fetch(
        `${API_CONFIG.BASE_URL}/member_package.php`,
        {
            method: 'GET',
            credentials: 'include'
        }
    );

    const memberPackageResult =
        await memberPackageResponse.json();

    if (!memberPackageResult.success) {
        showToast(
            'Không lấy được danh sách gói hội viên!',
            'error'
        );
        return;
    }

    // Lấy danh sách package
    const packagesResult = await GymAPI.getPackages();
    const packages = packagesResult.data || packagesResult;

    const memberPackageSelect =
        document.getElementById('editPayMemberPackageID');

    if (memberPackageSelect) {
            memberPackageSelect.innerHTML =
            '<option value="">-- Chọn gói tập --</option>' +

            memberPackageResult.data.map(mp => {

                const pkg = packages.find(
                    p => Number(p.PackageID) === Number(mp.PackageID)
                );

                const packageName =
                    pkg ? pkg.PackageName : `Package #${mp.PackageID}`;

                return `
                    <option
                        value="${mp.MemberPackageID}"
                        data-price="${pkg ? pkg.Price : 0}">
                        ${packageName}
                        - ${pkg ? Number(pkg.Price).toLocaleString('vi-VN') : 0}đ
                    </option>
                `;
            }).join('');

    }

    // Đổ dữ liệu giao dịch
    document.getElementById('editPayId').value =
        payment.PaymentsID;
        const packageSelect =
            document.getElementById('editPayMemberPackageID');

        const selectedOption =
            packageSelect.options[packageSelect.selectedIndex];

        if (selectedOption) {
            document.getElementById('editPayAmount').value =
                selectedOption.dataset.price || 0;
        }

        packageSelect.onchange = function () {
            const selectedOption =
                this.options[this.selectedIndex];

            document.getElementById('editPayAmount').value =
                selectedOption.dataset.price || 0;
        };

    document.getElementById('editPayAmount').value =
        payment.Amount;

    document.getElementById('editPayMethod').value =
        payment.PaymentMethod;

    document.getElementById('editPayDate').value =
        payment.PaymentDate;

    document.getElementById('editPayStatus').value =
        payment.Status;

    document.getElementById('editPayMemberPackageID').value =
        payment.MemberPackageID;

    openModal('editPaymentModal');
}
async function handleEditPayment(e) {
    e.preventDefault();

    const paymentsID = Number(
        document.getElementById('editPayId').value
    );

    const amount = Number(
        document.getElementById('editPayAmount').value
    );

    const paymentMethod =
        document.getElementById('editPayMethod').value;

    const paymentDate =
        document.getElementById('editPayDate').value;

    const status =
        document.getElementById('editPayStatus').value;

    const memberPackageID = Number(
        document.getElementById('editPayMemberPackageID').value
    );

    if (
        !paymentsID ||
        !amount ||
        !paymentMethod ||
        !paymentDate ||
        !status ||
        !memberPackageID
    ) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }

    const res = await GymAPI.updatePayment({
        paymentsID: paymentsID,
        amount: amount,
        paymentMethod: paymentMethod,
        paymentDate: paymentDate,
        status: status,
        memberPackageID: memberPackageID
    });

    if (!res.success) {
        showToast(
            res.message || 'Cập nhật thanh toán thất bại!',
            'error'
        );
        return;
    }

    showToast(
        'Cập nhật thanh toán thành công!',
        'success'
    );

    closeModal('editPaymentModal');

    await loadPayments();
}
async function loadPayments() {
  const tableBody = document.getElementById('paymentTableBody');
  if (!tableBody) return;

  const currentUser =
    (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser)
      ? GymAPI.getCurrentUser()
      : { Role: 'admin' };

  const role = String(currentUser.Role || '').toLowerCase();
  const isStaff = role === 'staff';
  const isAdmin = role === 'admin';

  const titleEl = document.getElementById('paymentHeaderTitle');
  const btnEl = document.getElementById('paymentHeaderBtn');
  const cardTitleEl = document.getElementById('paymentTableCardTitle');

  if (titleEl) {
    titleEl.textContent = isStaff
      ? 'Quản lý Thanh toán'
      : 'Quản lý thanh toán & Giao dịch';
  }

  if (btnEl) {
    btnEl.innerHTML =
      `<i class="fa fa-plus"></i> ${isStaff ? '+ Tạo giao dịch' : '+ Tạo hóa đơn'}`;
  }

  if (cardTitleEl) {
    cardTitleEl.textContent = isStaff
      ? 'Danh sách giao dịch gần đây'
      : 'Lịch sử giao dịch toàn hệ thống';
  }

  const result = await GymAPI.getPayments();
  const payments = result.data || [];

  tableBody.innerHTML = payments.map(p => `
    <tr>
      <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">
        ${p.PaymentsID}
      </td>

      <td style="color: #FF334B; font-weight: 700; padding: 14px 18px;">
        ${formatVND(p.Amount)}
      </td>

      <td style="padding: 14px 18px;">
        ${renderPaymentMethodBadge(p.PaymentMethod)}
      </td>

      <td style="color: #FFFFFF; padding: 14px 18px;">
        ${p.PaymentDate}
      </td>

      <td style="padding: 14px 18px;">
        <span class="badge badge-green"
          style="padding: 4px 14px; border-radius: 12px;
          font-weight: 600; font-size: 12px;">
          ${p.Status || 'Paid'}
        </span>
      </td>

      <td style="font-weight: 700; color: #FFFFFF;
        text-align: center; padding: 14px 18px;">
        ${p.MemberPackageID || '-'}
      </td>

      ${isAdmin ? `
        <td style="text-align: center; padding: 14px 18px;">
          <button
            class="btn btn-sm btn-secondary"
            onclick="openEditPaymentModal(${p.PaymentsID})"
            title="Sửa">
            <i class="fa fa-edit"></i>
          </button>

          <button
            class="btn btn-sm btn-danger"
            onclick="handleDeletePayment(${p.PaymentsID})"
            title="Xóa">
            <i class="fa fa-trash"></i>
          </button>
        </td>
      ` : ''}
    </tr>
  `).join('');
}
async function handleDeletePayment(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này không?')) {
        return;
    }

    const res = await GymAPI.deletePayment(id);

    if (!res.success) {
        showToast(res.message || 'Xóa giao dịch thất bại!', 'error');
        return;
    }

    showToast('Xóa giao dịch thành công!', 'success');
    loadPayments();
}
function printInvoice(code, member, amount) {
  showToast(`Đã xuất hóa đơn ${code} cho hội viên ${member} (${formatVND(amount)})`, 'success');
}

async function openCreateInvoiceForPackage(packageName = '', price = 0) {
    switchAdminTab('payments');

    const membersResult = await GymAPI.getMembers();
    const members = membersResult.data || membersResult;

    const memberSelect = document.getElementById('payMemberSelect');

    if (memberSelect) {
        memberSelect.innerHTML = members.map(m =>
            `<option value="${m.MemberID}">
                ${m.Code} - ${m.Fullname}
            </option>`
        ).join('');
    }

    const packagesResult = await GymAPI.getPackages();
    const packages = packagesResult.data || packagesResult;

    const packageSelect = document.getElementById('payPackageName');

    if (packageSelect) {
        packageSelect.innerHTML =
            `<option value="">-- Chọn gói tập --</option>` +
            packages.map(p =>
                `<option value="${p.PackageID}" data-price="${p.Price}">
                    ${p.PackageName} - ${Number(p.Price).toLocaleString('vi-VN')}đ
                </option>`
            ).join('');

        if (packageName) {
            const selected = packages.find(
                p => p.PackageName === packageName
            );

            if (selected) {
                packageSelect.value = selected.PackageID;
            }
        }

        packageSelect.onchange = function () {
            const selected =
                packages.find(p => Number(p.PackageID) === Number(this.value));

            if (selected) {
                document.getElementById('payAmount').value = selected.Price;
            }
        };
    }

    if (price) {
        document.getElementById('payAmount').value = price;
    }

    openModal('paymentModal');
}
async function openAddPaymentModal() {
    try {
        await openCreateInvoiceForPackage();
    } catch (error) {
        console.error('[PAYMENT] Lỗi mở form tạo hóa đơn:', error);
        showToast('Không thể mở form tạo hóa đơn!', 'error');
    }
}
async function handleSavePayment(e) {
    e.preventDefault();

    const memberID = Number(document.getElementById('payMemberSelect').value);
    const packageID = Number(document.getElementById('payPackageName').value);
    const amount = Number(document.getElementById('payAmount').value);
    const method = document.getElementById('payMethod').value;

    if (!memberID || !packageID || !amount || !method) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }

    // Lấy thông tin gói
    const packagesResult = await GymAPI.getPackages();
    const packages = packagesResult.data || packagesResult;

    const pkg = packages.find(
        p => Number(p.PackageID) === packageID
    );

    if (!pkg) {
        showToast('Không tìm thấy gói tập!', 'error');
        return;
    }

    // Lấy các gói hội viên đang có
    const memberPackageResponse = await fetch(
        `${API_CONFIG.BASE_URL}/member_package.php`,
        {
            method: 'GET',
            credentials: 'include'
        }
    );

    const memberPackageResult = await memberPackageResponse.json();

    if (!memberPackageResult.success) {
        showToast('Không lấy được thông tin gói hội viên!', 'error');
        return;
    }

    let memberPackage = memberPackageResult.data.find(mp =>
        Number(mp.MemberID) === memberID &&
        Number(mp.PackageID) === packageID
    );

    // Nếu chưa có gói này → tự tạo gói mới
    if (!memberPackage) {

        const startDate = new Date();
        const endDate = new Date(startDate);

        endDate.setMonth(
            endDate.getMonth() + Number(pkg.Duration)
        );

        const createMemberPackageResponse = await fetch(
            `${API_CONFIG.BASE_URL}/member_package.php`,
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    status: 'Active',
                    memberID: memberID,
                    packageID: packageID
                })
            }
        );

        const createMemberPackageResult =
            await createMemberPackageResponse.json();

        if (!createMemberPackageResult.success) {
            showToast(
                createMemberPackageResult.message ||
                'Không thể tạo gói cho hội viên!',
                'error'
            );
            return;
        }

        // Lấy lại danh sách để lấy MemberPackageID mới
        const reloadResponse = await fetch(
            `${API_CONFIG.BASE_URL}/member_package.php`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const reloadResult = await reloadResponse.json();

        if (!reloadResult.success) {
            showToast('Không lấy được gói hội viên mới!', 'error');
            return;
        }

        memberPackage = reloadResult.data.find(mp =>
            Number(mp.MemberID) === memberID &&
            Number(mp.PackageID) === packageID
        );
    }

    if (!memberPackage) {
        showToast('Không xác định được gói hội viên!', 'error');
        return;
    }

    // Tạo thanh toán
    const res = await GymAPI.addPayment({
        amount: amount,
        paymentMethod: method,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'Paid',
        memberPackageID: memberPackage.MemberPackageID
    });

    if (!res.success) {
        showToast(
            res.message || 'Tạo hóa đơn thất bại!',
            'error'
        );
        return;
    }

    showToast(
        'Tạo phiếu thu tiền thành công!',
        'success'
    );

    closeModal('paymentModal');
    loadPayments();
}


// ==============================================================================
// 3. MENU DỊCH VỤ & KHO HÀNG (INVENTORY)
// ==============================================================================
async function loadInventory(category = 'all') {
  const tableBody = document.getElementById('inventoryTableBody');
  if (!tableBody) return;

  try {
    const currentUser =
      (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser)
        ? GymAPI.getCurrentUser()
        : { Role: 'staff' };

    const role = String(currentUser.Role || '').toLowerCase();
    const isAdmin = role === 'admin';

    const addBtn = document.getElementById('addInventoryBtn');
    const actionTh = document.getElementById('inventoryActionTh');

    if (addBtn) {
      addBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }

    if (actionTh) {
      actionTh.style.display = 'table-cell';
      actionTh.textContent = isAdmin ? 'Thao tác' : 'Nhập hàng';
    }

    currentInventoryCategory = category;

    // Lấy dữ liệu từ backend
    const result = await GymAPI.getInventory();

    const items = Array.isArray(result)
      ? result
      : (result?.data || []);

    console.log('[INVENTORY] Backend data:', items);

    let filteredItems = items;

    if (category !== 'all') {
      filteredItems = items.filter(
        item => String(item.Category || '').toLowerCase() ===
                String(category).toLowerCase()
      );
    }

    if (filteredItems.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7"
              style="text-align:center; padding:40px; color:#9CA3AF;">
            Không có sản phẩm trong kho
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filteredItems.map(item => {

      const itemId =
        Number(item.ProductID || item.ID);

      const itemName =
        item.ProductName || item.Name || 'Không tên';

      const description =
        item.Description || 'Chưa có mô tả';

      const categoryName =
        item.Category || 'Khác';

      const price =
        Number(item.Price) || 0;

      const stock =
        Number(item.Stock) || 0;

      let catBadgeClass = 'badge-blue';

      if (categoryName === 'Clothing') {
        catBadgeClass = 'badge-yellow';
      } else if (categoryName === 'Accessory') {
        catBadgeClass = 'badge-red';
      } else if (categoryName === 'Beverage') {
        catBadgeClass = 'badge-green';
      }

      const stockBadge =
        stock <= 0
          ? `<span class="badge badge-red">Hết hàng</span>`
          : `<span style="color:#10B981;font-weight:700;">${stock}</span>`;

      const actionHTML = isAdmin
        ? `
          <button
            class="btn btn-secondary btn-sm"
            onclick="openEditInventoryModal(${itemId})">
            <i class="fa fa-edit"></i> Sửa
          </button>

          <button
            class="btn btn-danger btn-sm"
            onclick="handleDeleteInventory(${itemId})">
            <i class="fa fa-trash"></i> Xóa
          </button>
        `
        : `
          <button
            class="btn btn-secondary btn-sm"
            onclick="openStaffStockModal(${itemId})">
            <i class="fa fa-plus"></i> Nhập hàng
          </button>
        `;

      return `
        <tr>

          <td style="font-weight:700;color:#9CA3AF;">
            #${itemId}
          </td>

          <td>
            <div style="
              font-weight:700;
              color:#FFFFFF;
              font-size:14.5px;">
              ${itemName}
            </div>

            <div style="
              font-size:12px;
              color:#9CA3AF;
              margin-top:3px;">
              ${description}
            </div>
          </td>

          <td>
            <span class="badge ${catBadgeClass}">
              ${categoryName}
            </span>
          </td>

          <td style="
            color:#FF334B;
            font-weight:800;">
            ${formatVND(price)}
          </td>

          <td style="text-align:center;">
            ${stockBadge}
          </td>

          <td style="text-align:center;">
            ${
              stock > 0
                ? '<span class="badge badge-green">Còn hàng</span>'
                : '<span class="badge badge-red">Hết hàng</span>'
            }
          </td>

          <td style="text-align:center;">
            ${actionHTML}
          </td>

        </tr>
      `;
    }).join('');

  } catch (error) {

    console.error('[INVENTORY] Load error:', error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="7"
            style="
              text-align:center;
              padding:40px;
              color:#EF4444;">
          Không thể tải dữ liệu kho hàng
        </td>
      </tr>
    `;
  }
}

function filterInventory(category, event) {

    document
        .querySelectorAll('#inventoryTabs .tab-btn')
        .forEach(btn => btn.classList.remove('active'));

    if (event && event.target) {
        event.target.classList.add('active');
    }

    loadInventory(category);
}


function openAddInventoryModal() {

    document.getElementById('invModalTitle').textContent =
        'Thêm Sản phẩm / Dịch vụ';

    document.getElementById('inventoryForm').reset();

    document.getElementById('invId').value = '';

    document.getElementById('invDescription').value = '';

    openModal('inventoryModal');
}


async function openEditInventoryModal(id) {

  try {

    const result =
      await GymAPI.getInventory();

    const items =
      Array.isArray(result)
        ? result
        : (result?.data || []);

    const item =
      items.find(
        i => Number(i.ProductID || i.ID) === Number(id)
      );

    if (!item) {
      showToast('Không tìm thấy sản phẩm!', 'error');
      return;
    }

    document.getElementById('invModalTitle').textContent =
      'Chỉnh sửa Sản phẩm / Dịch vụ';

    document.getElementById('invId').value =
      item.ProductID || item.ID;

    document.getElementById('invName').value =
      item.ProductName || item.Name || '';

    document.getElementById('invDescription').value =
      item.Description || '';

    document.getElementById('invCategory').value =
      item.Category || 'Supplement';

    document.getElementById('invPrice').value =
      item.Price || 0;

    document.getElementById('invStock').value =
      item.Stock || 0;

    openModal('inventoryModal');

  } catch (error) {

    console.error('[INVENTORY EDIT]', error);

    showToast(
      'Không thể tải thông tin sản phẩm!',
      'error'
    );
  }
}


async function handleSaveInventory(e) {

    e.preventDefault();

    const id =
        document.getElementById('invId').value;

    const name =
        document.getElementById('invName').value.trim();

    const description =
        document.getElementById('invDescription').value.trim();

    const category =
        document.getElementById('invCategory').value;

    const price =
        Number(document.getElementById('invPrice').value);

    const stock =
        Number(document.getElementById('invStock').value);

    if (!name || !category || price < 0 || stock < 0) {
        showToast(
            'Vui lòng nhập thông tin sản phẩm hợp lệ!',
            'error'
        );
        return;
    }

    const itemData = {
        ProductName: name,
        Category: category,
        Price: price,
        Stock: stock,
        Description: description
    };

    let result;

    if (id) {

        itemData.ProductID = Number(id);

        result = await GymAPI.updateInventoryItem(
            itemData
        );

        if (!result.success) {
            showToast(
                result.message || 'Cập nhật sản phẩm thất bại!',
                'error'
            );
            return;
        }

        showToast(
            'Cập nhật thông tin sản phẩm thành công!',
            'success'
        );

    } else {

        result = await GymAPI.addInventoryItem(
            itemData
        );

        if (!result.success) {
            showToast(
                result.message || 'Thêm sản phẩm thất bại!',
                'error'
            );
            return;
        }

        showToast(
            'Thêm sản phẩm mới thành công!',
            'success'
        );
    }

    closeModal('inventoryModal');

    await loadInventory(currentInventoryCategory);
}


async function handleDeleteInventory(id) {

    if (!confirm(
        'Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho hàng?'
    )) {
        return;
    }

    const result =
        await GymAPI.deleteInventoryItem(id);

    if (!result.success) {
        showToast(
            result.message || 'Xóa sản phẩm thất bại!',
            'error'
        );
        return;
    }

    showToast(
        'Đã xóa sản phẩm khỏi kho hàng thành công!',
        'success'
    );

    await loadInventory(currentInventoryCategory);
}


async function openStaffStockModal(id) {
    try {
        const result = await GymAPI.getInventory();

        const items = Array.isArray(result)
            ? result
            : (result?.data || []);

        const item = items.find(
            product => Number(product.ProductID) === Number(id)
        );

        if (!item) {
            showToast('Không tìm thấy sản phẩm!', 'error');
            return;
        }

        document.getElementById('staffStockItemId').value =
            item.ProductID;

        document.getElementById('staffStockItemName').value =
            item.ProductName;

        document.getElementById('staffStockCurrent').value =
            item.Stock;

        document.getElementById('staffStockAddQty').value = '';

        openModal('staffStockModal');

    } catch (error) {
        console.error('[OPEN STOCK MODAL ERROR]', error);

        showToast(
            'Không thể tải thông tin sản phẩm!',
            'error'
        );
    }
}


async function handleStaffStockIncrement(e) {
  e.preventDefault();

  try {
    const id =
      Number(document.getElementById('staffStockItemId').value);

    const addQty =
      Number(document.getElementById('staffStockAddQty').value);

    const itemName =
      document.getElementById('staffStockItemName').value;

    if (!Number.isInteger(addQty) || addQty <= 0) {
      showToast('Vui lòng nhập số lượng hợp lệ (> 0)', 'error');
      return;
    }

    const result =
      await GymAPI.incrementInventoryStock(id, addQty);

    if (!result.success) {
      showToast(
        result.message || 'Nhập hàng thất bại!',
        'error'
      );
      return;
    }

    showToast(
      `Đã nhập thêm +${addQty} ${itemName} vào kho thành công!`,
      'success'
    );

    closeModal('staffStockModal');

    await loadInventory(currentInventoryCategory);

  } catch (error) {

    console.error('[INVENTORY STOCK ERROR]', error);

    showToast(
      'Không thể nhập hàng!',
      'error'
    );
  }
}


// Export ra window để HTML onclick gọi được
window.loadInventory = loadInventory;
window.filterInventory = filterInventory;
window.openAddInventoryModal = openAddInventoryModal;
window.openEditInventoryModal = openEditInventoryModal;
window.handleSaveInventory = handleSaveInventory;
window.handleDeleteInventory = handleDeleteInventory;
window.openStaffStockModal = openStaffStockModal;
window.handleStaffStockIncrement = handleStaffStockIncrement;



// ==============================================================================
// 4. CHẤM CÔNG NHÂN SỰ (ATTENDANCE MANAGE)

// ==============================================================================

async function loadStaffAttendance() {
  const tableBody = document.getElementById('staffAttendanceTableBody');
  if (!tableBody) return;

  const result = await GymAPI.getStaffAttendance();

  if (!result.success) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:30px;">
          Không thể tải dữ liệu chấm công
        </td>
      </tr>
    `;
    return;
  }

  const attendance = result.data || [];

  tableBody.innerHTML = attendance.map(a => `
    <tr>
      <td style="font-weight:700; color:#FFFFFF; padding:14px 18px;">
        ${a.EmployeeAttendanceID}
      </td>

      <td style="color:#FFFFFF; padding:14px 18px;">
        ${a.CheckInTime || '-'}
      </td>

      <td style="color:#FFFFFF; padding:14px 18px;">
        ${a.CheckOutTime || '-'}
      </td>

      <td style="color:#FFFFFF; padding:14px 18px;">
        ${a.AttendanceDate}
      </td>

      <td style="font-weight:700; color:#FFFFFF; padding:14px 18px;">
        ${a.UserID}
      </td>

      <td style="text-align:center; padding:14px 18px;">
        ${
          !a.CheckOutTime
            ? `
              <button
                class="btn btn-secondary btn-sm"
                style="border-radius:14px; padding:5px 18px; font-size:13px;"
                onclick="handleStaffCheckOut(${a.EmployeeAttendanceID})">
                Check-out
              </button>
            `
            : `
              <span style="color:#00D084; font-weight:600;">
                Đã hoàn thành
              </span>
            `
        }

        <button
          class="btn btn-danger btn-sm"
          style="margin-left:5px;"
          onclick="handleDeleteStaffAttendance(${a.EmployeeAttendanceID})">
          Xóa
        </button>
      </td>
    </tr>
  `).join('');
}


async function handleStaffCheckOut(id) {
  const res = await GymAPI.checkOutStaff(id);

  if (!res.success) {
    showToast(res.message || 'Check-out thất bại!', 'error');
    return;
  }

  showToast('Check-out thành công!', 'success');

  loadStaffAttendance();
}


async function handleDeleteStaffAttendance(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa bản ghi chấm công này không?')) {
    return;
  }

  const res = await GymAPI.deleteStaffAttendance(id);

  console.log('DELETE RESULT:', res);

  if (!res.success) {
    showToast(
      res.message || 'Xóa chấm công thất bại!',
      'error'
    );
    return;
  }

  showToast('Xóa chấm công thành công!', 'success');

  await loadStaffAttendance();
}


function openStaffCheckInModal() {
  GymAPI.checkInStaff({})
    .then(res => {
      if (!res.success) {
        showToast(res.message || 'Check-in thất bại!', 'error');
        return;
      }

      showToast('Check-in thành công!', 'success');

      loadStaffAttendance();
    })
    .catch(() => {
      showToast('Không thể kết nối máy chủ!', 'error');
    });
}


// ==============================================================================
// 5. BẢNG CHẤM CÔNG & QUẢN LÝ LƯƠNG (SALARIES)
// ==============================================================================

async function loadSalaries() {
    const tableBody = document.getElementById('salaryTableBody');
    if (!tableBody) return;

    try {
        const result = await GymAPI.getSalaries();

        const salaries = Array.isArray(result)
            ? result
            : (result.data || []);

        const totalFund = salaries.reduce((sum, s) => {
            const base = Number(s.BaseSalary) || 0;
            const allowance = Number(s.Allowance) || 0;
            const bonus = Number(s.Bonus) || 0;
            const deduction = Number(s.Deduction) || 0;

            return sum + Math.max(
                0,
                base + allowance + bonus - deduction
            );
        }, 0);

        const fundEl =
            document.getElementById('totalSalaryFundDisplay');

        if (fundEl) {
            fundEl.textContent = formatVND(totalFund);
        }

        const countEl =
            document.getElementById('totalSalaryStaffDisplay');

        if (countEl) {
            countEl.textContent =
                `${salaries.length} nhân sự`;
        }

        tableBody.innerHTML = salaries.map(s => {

            const base = Number(s.BaseSalary) || 0;
            const allowance = Number(s.Allowance) || 0;
            const bonus = Number(s.Bonus) || 0;

            return `
                <tr>

                    <td style="font-weight:700;color:#FFFFFF;">
                        NV${s.UserID}
                    </td>

                    <td style="font-weight:700;color:#FFFFFF;">
                        ${s.Username || '—'}
                    </td>

                    <td style="color:#E5E7EB;">
                        ${s.Role || '—'}
                    </td>

                    <td style="color:#FFFFFF;text-align:center;">
                        ${s.WorkDays || 0}
                    </td>

                    <td style="color:#FFFFFF;text-align:center;">
                        ${
                            Number(s.PTClasses) > 0
                                ? `${s.PTClasses} buổi`
                                : '—'
                        }
                    </td>

                    <td style="text-align:center;">
                        <span style="
                            font-weight:700;
                            color:${
                                Number(s.LateDays) === 0
                                    ? '#10B981'
                                    : Number(s.LateDays) <= 2
                                        ? '#F59E0B'
                                        : '#EF4444'
                            };
                        ">
                            ${s.LateDays || 0}
                        </span>
                    </td>

                    <td style="color:#FFFFFF;">
                        ${formatVND(base)}
                    </td>

                    <td style="color:#10B981;font-weight:700;">
                        ${formatVND(allowance + bonus)}
                    </td>

                    <td style="text-align:center;">

                        <button
                            class="btn btn-primary btn-sm"
                            onclick="openEditSalaryModal(${s.SalaryID})"
                        >
                            <i class="fa fa-edit"></i>
                            Sửa lương
                        </button>

                        <button
                            class="btn btn-secondary btn-sm"
                            onclick="openSalaryDetailModal(${s.SalaryID})"
                        >
                            <i class="fa fa-file-invoice-dollar"></i>
                            Chi tiết
                        </button>

                        <button
                            class="btn btn-sm"
                            style="
                                background:rgba(255,51,75,0.15);
                                color:#FF334B;
                                border:1px solid rgba(255,51,75,0.3);
                            "
                            onclick="handleDeleteSalary(${s.SalaryID})"
                        >
                            <i class="fa fa-trash"></i>
                            Xóa
                        </button>

                    </td>

                </tr>
            `;

        }).join('');

    } catch (error) {

        console.error('loadSalaries error:', error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="9"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#9CA3AF;
                    ">
                    Không thể tải dữ liệu bảng lương.
                </td>
            </tr>
        `;
    }
}

async function loadSalaryUsers(selectedUserID = null) {
    const select = document.getElementById('salUser');

    if (!select) return;

    try {
        const result = await GymAPI.getUsers();

        const users = Array.isArray(result)
            ? result
            : (result.data || []);

        select.innerHTML =
            '<option value="">-- Chọn nhân sự --</option>';

        users
            .filter(u =>
                ['staff', 'trainer'].includes(
                    String(u.Role || '').toLowerCase()
                )
            )
            .forEach(u => {

                const option =
                    document.createElement('option');

                option.value = u.UserID;

                option.textContent =
                    `NV${u.UserID} - ${u.Username} (${u.Role})`;

                if (
                    selectedUserID &&
                    Number(selectedUserID) === Number(u.UserID)
                ) {
                    option.selected = true;
                }

                select.appendChild(option);
            });

    } catch (error) {

        console.error(
            'loadSalaryUsers error:',
            error
        );

        select.innerHTML =
            '<option value="">Không tải được danh sách nhân sự</option>';
    }
}


function handleSalaryUserChange() {

    const select =
        document.getElementById('salUser');

    if (!select) return;

    const userID =
        Number(select.value);

    if (!userID) {
        document.getElementById('salCode').value = '';
        document.getElementById('salName').value = '';
        document.getElementById('salRole').value = '';
        return;
    }

    const option =
        select.options[select.selectedIndex];

    const text =
        option.textContent;

    const match =
        text.match(/^NV(\d+)\s*-\s*(.*?)\s*\((.*?)\)$/);

    if (match) {

        document.getElementById('salCode').value =
            `NV${match[1]}`;

        document.getElementById('salName').value =
            match[2];

        document.getElementById('salRole').value =
            match[3];
    }
}
// ==============================================================================
// THÊM PHIẾU LƯƠNG
// ==============================================================================

function openAddSalaryModal() {

    const title =
        document.getElementById('salaryModalTitle');

    if (title) {
        title.innerHTML =
            '<i class="fa fa-plus-circle text-green"></i> Thêm Phiếu Lương Nhân Sự Mới';
    }

    const subtitle =
        document.getElementById('salaryModalSubtitle');

    if (subtitle) {
        subtitle.textContent =
            'Thiết lập bảng lương cho nhân sự';
    }

    const form =
        document.getElementById('salaryForm');

    if (form) {
        form.reset();
    }
    loadSalaryUsers();

    document.getElementById('salId').value = '';
    document.getElementById('salWorkDays').value = 0;
    document.getElementById('salSessions').value = 0;
    document.getElementById('salLateDays').value = 0;

    document.getElementById('salBaseSalary').value = 8000000;
    document.getElementById('salAllowance').value = 0;
    document.getElementById('salBonus').value = 0;
    document.getElementById('salDeduction').value = 0;

    document.getElementById('salNote').value = '';

    calculateTotalSalary();

    setSalaryFormEditable(true);

    openModal('salaryModal');
}


// ==============================================================================
// SỬA PHIẾU LƯƠNG
// ==============================================================================

async function openEditSalaryModal(id) {

    try {

        const result =
            await GymAPI.getSalaryById(id);

        if (!result || !result.success || !result.data) {

            showToast(
                result?.message ||
                'Không tìm thấy bảng lương',
                'error'
            );

            return;
        }

        const item = result.data;
        await loadSalaryUsers(item.UserID);
        document.getElementById('salUser').value =item.UserID;
        handleSalaryUserChange();
        document.getElementById('salaryModalTitle').innerHTML =
            '<i class="fa fa-edit text-red"></i> Điều Chỉnh Bảng Lương';

        const subtitle =
            document.getElementById('salaryModalSubtitle');

        if (subtitle) {
            subtitle.textContent =
                `Chỉnh sửa lương của ${item.Username || ''}`;
        }

        document.getElementById('salId').value =
            item.SalaryID;

        document.getElementById('salCode').value =
            `NV${item.UserID}`;

        document.getElementById('salName').value =
            item.Username || '';

        document.getElementById('salRole').value =
            item.Role || '';

        document.getElementById('salWorkDays').value =
            item.WorkDays || 0;

        document.getElementById('salSessions').value =
            item.PTClasses || 0;

        document.getElementById('salLateDays').value =
            item.LateDays || 0;

        document.getElementById('salBaseSalary').value =
            item.BaseSalary || 0;

        document.getElementById('salAllowance').value =
            item.Allowance || 0;

        document.getElementById('salBonus').value =
            item.Bonus || 0;

        document.getElementById('salDeduction').value =
            item.Deduction || 0;

        document.getElementById('salNote').value =
            item.Note || '';

        const month =
            document.getElementById('salSalaryMonth');

        if (month) {
            month.value =
                item.SalaryMonth || '';
        }

        const status =
            document.getElementById('salStatus');

        if (status) {
            status.value =
                item.Status || 'Pending';
        }

        calculateTotalSalary();

        setSalaryFormEditable(true);

        openModal('salaryModal');

    } catch (error) {

        console.error(
            'openEditSalaryModal error:',
            error
        );

        showToast(
            'Không thể tải phiếu lương',
            'error'
        );
    }
}


// ==============================================================================
// XEM CHI TIẾT
// ==============================================================================

async function openSalaryDetailModal(id) {

    try {

        const result =
            await GymAPI.getSalaryById(id);

        if (!result || !result.success || !result.data) {

            showToast(
                result?.message ||
                'Không tìm thấy bảng lương',
                'error'
            );

            return;
        }

        const item = result.data;

        document.getElementById('salaryModalTitle').innerHTML =
            '<i class="fa fa-file-invoice-dollar"></i> Chi Tiết Phiếu Lương';

        const subtitle =
            document.getElementById('salaryModalSubtitle');

        if (subtitle) {
            subtitle.textContent =
                `Bảng lương của ${item.Username || ''}`;
        }

        document.getElementById('salId').value =
            item.SalaryID;

        document.getElementById('salCode').value =
            `NV${item.UserID}`;

        document.getElementById('salName').value =
            item.Username || '';

        document.getElementById('salRole').value =
            item.Role || '';

        document.getElementById('salWorkDays').value =
            item.WorkDays || 0;

        document.getElementById('salSessions').value =
            item.PTClasses || 0;

        document.getElementById('salLateDays').value =
            item.LateDays || 0;

        document.getElementById('salBaseSalary').value =
            item.BaseSalary || 0;

        document.getElementById('salAllowance').value =
            item.Allowance || 0;

        document.getElementById('salBonus').value =
            item.Bonus || 0;

        document.getElementById('salDeduction').value =
            item.Deduction || 0;

        document.getElementById('salNote').value =
            item.Note || '';

        calculateTotalSalary();

        setSalaryFormEditable(false);

        openModal('salaryModal');

    } catch (error) {

        console.error(
            'openSalaryDetailModal error:',
            error
        );

        showToast(
            'Không thể tải chi tiết bảng lương',
            'error'
        );
    }
}


// ==============================================================================
// KHÓA / MỞ FORM
// ==============================================================================

function setSalaryFormEditable(editable) {

    const ids = [
        'salCode',
        'salName',
        'salRole',
        'salWorkDays',
        'salSessions',
        'salLateDays',
        'salBaseSalary',
        'salAllowance',
        'salBonus',
        'salDeduction',
        'salNote',
        'salSalaryMonth',
        'salStatus'
    ];

    ids.forEach(id => {

        const el =
            document.getElementById(id);

        if (!el) return;

        el.disabled = !editable;

        if ('readOnly' in el) {
            el.readOnly = !editable;
        }
    });

    const saveButton =
        document.getElementById('salarySaveButton');

    if (saveButton) {
        saveButton.style.display =
            editable ? 'inline-flex' : 'none';
    }
}


// ==============================================================================
// TÍNH TỔNG LƯƠNG
// ==============================================================================

function calculateTotalSalary() {

    const base =
        Number(
            document.getElementById('salBaseSalary')?.value
        ) || 0;

    const allowance =
        Number(
            document.getElementById('salAllowance')?.value
        ) || 0;

    const bonus =
        Number(
            document.getElementById('salBonus')?.value
        ) || 0;

    const deduction =
        Number(
            document.getElementById('salDeduction')?.value
        ) || 0;

    const total =
        Math.max(
            0,
            base + allowance + bonus - deduction
        );

    const display =
        document.getElementById('salTotalDisplay');

    if (display) {
        display.textContent =
            formatVND(total);
    }

    return total;
}


// ==============================================================================
// LƯU PHIẾU LƯƠNG
// ==============================================================================

async function handleSaveSalary(event) {

    event.preventDefault();

    try {

        const id =
            document.getElementById('salId')?.value || '';

        let userID = null;

        // SỬA
        if (id) {

            const current =
                await GymAPI.getSalaryById(id);

            if (
                current &&
                current.success &&
                current.data
            ) {
                userID =
                    Number(current.data.UserID);
            }

        }

        // THÊM
        else {

            const code =
                document.getElementById('salCode')
                    ?.value
                    ?.trim() || '';

            const match =
                code.match(/^NV(\d+)$/i);

            if (match) {
                userID =
                    Number(match[1]);
            }
        }

        if (!userID) {

            showToast(
                'Mã nhân sự không hợp lệ. Ví dụ: NV3',
                'error'
            );

            return;
        }

        const salaryData = {

            UserID: userID,

            BaseSalary:
                Number(
                    document.getElementById('salBaseSalary')?.value
                ) || 0,

            Allowance:
                Number(
                    document.getElementById('salAllowance')?.value
                ) || 0,

            Bonus:
                Number(
                    document.getElementById('salBonus')?.value
                ) || 0,

            Deduction:
                Number(
                    document.getElementById('salDeduction')?.value
                ) || 0,

            WorkDays:
                Number(
                    document.getElementById('salWorkDays')?.value
                ) || 0,

            LateDays:
                Number(
                    document.getElementById('salLateDays')?.value
                ) || 0,

            PTClasses:
                Number(
                    document.getElementById('salSessions')?.value
                ) || 0,

            Note:
                document.getElementById('salNote')?.value
                ?.trim() || '',

            SalaryMonth:
                document.getElementById('salSalaryMonth')?.value ||
                new Date().toISOString().slice(0, 7),

            Status:
                document.getElementById('salStatus')?.value ||
                'Pending'
        };

        let result;

        // UPDATE
        if (id) {

            salaryData.SalaryID =
                Number(id);

            result =
                await GymAPI.updateSalary(
                    salaryData
                );

        }

        // INSERT
        else {

            result =
                await GymAPI.addSalary(
                    salaryData
                );
        }

        if (!result || !result.success) {

            showToast(
                result?.message ||
                'Lưu bảng lương thất bại!',
                'error'
            );

            return;
        }

        showToast(
            id
                ? 'Cập nhật bảng lương thành công!'
                : 'Thêm bảng lương thành công!',
            'success'
        );

        closeModal('salaryModal');

        await loadSalaries();

    } catch (error) {

        console.error(
            'handleSaveSalary error:',
            error
        );

        showToast(
            'Có lỗi xảy ra khi lưu bảng lương!',
            'error'
        );
    }
}


// ==============================================================================
// XÓA PHIẾU LƯƠNG
// ==============================================================================

async function handleDeleteSalary(id) {

    if (
        !confirm(
            'Bạn có chắc chắn muốn xóa phiếu lương này không?'
        )
    ) {
        return;
    }

    try {

        const result =
            await GymAPI.deleteSalary(id);

        if (!result || !result.success) {

            showToast(
                result?.message ||
                'Xóa bảng lương thất bại!',
                'error'
            );

            return;
        }

        showToast(
            'Xóa bảng lương thành công!',
            'success'
        );

        await loadSalaries();

    } catch (error) {

        console.error(
            'handleDeleteSalary error:',
            error
        );

        showToast(
            'Không thể xóa bảng lương!',
            'error'
        );
    }
}


// ==============================================================================
// IN PHIẾU LƯƠNG
// ==============================================================================

function printSalarySlip() {

    const code =
        document.getElementById('salCode')?.value || '';

    const name =
        document.getElementById('salName')?.value || '';

    const role =
        document.getElementById('salRole')?.value || '';

    const workDays =
        document.getElementById('salWorkDays')?.value || '0';

    const sessions =
        document.getElementById('salSessions')?.value || '0';

    const lateDays =
        document.getElementById('salLateDays')?.value || '0';

    const baseSalary =
        Number(
            document.getElementById('salBaseSalary')?.value
        ) || 0;

    const allowance =
        Number(
            document.getElementById('salAllowance')?.value
        ) || 0;

    const bonus =
        Number(
            document.getElementById('salBonus')?.value
        ) || 0;

    const deduction =
        Number(
            document.getElementById('salDeduction')?.value
        ) || 0;

    const note =
        document.getElementById('salNote')?.value || '';

    const salaryMonth =
        document.getElementById('salSalaryMonth')?.value ||
        new Date().toISOString().slice(0, 7);

    const total =
        Math.max(
            0,
            baseSalary +
            allowance +
            bonus -
            deduction
        );


    const formatMoney = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
    };


    const printWindow =
        window.open('', '_blank', 'width=900,height=700');

    if (!printWindow) {

        showToast(
            'Trình duyệt đã chặn cửa sổ in. Hãy cho phép popup.',
            'error'
        );

        return;
    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="vi">

        <head>

            <meta charset="UTF-8">

            <title>Phiếu lương ${code}</title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    background: white;
                    color: #111;
                    margin: 0;
                    padding: 40px;
                }

                .salary-slip {
                    max-width: 800px;
                    margin: auto;
                    border: 1px solid #222;
                    padding: 35px;
                }

                .header {
                    text-align: center;
                    border-bottom: 2px solid #111;
                    padding-bottom: 20px;
                    margin-bottom: 25px;
                }

                .header h1 {
                    margin: 0 0 8px;
                    font-size: 25px;
                }

                .header h2 {
                    margin: 0;
                    font-size: 20px;
                }

                .month {
                    margin-top: 10px;
                    font-size: 14px;
                }

                .info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px 40px;
                    margin-bottom: 25px;
                }

                .info-item {
                    padding: 8px 0;
                    border-bottom: 1px solid #ddd;
                }

                .label {
                    font-weight: bold;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th,
                td {
                    border: 1px solid #333;
                    padding: 12px;
                }

                th {
                    text-align: left;
                    background: #f2f2f2;
                }

                td.money {
                    text-align: right;
                }

                .total {
                    margin-top: 25px;
                    padding: 18px;
                    border: 2px solid #111;
                    display: flex;
                    justify-content: space-between;
                    font-size: 20px;
                    font-weight: bold;
                }

                .note {
                    margin-top: 25px;
                    padding: 15px;
                    border: 1px solid #ccc;
                    min-height: 70px;
                }

                .signatures {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 100px;
                    margin-top: 70px;
                    text-align: center;
                }

                .signature-title {
                    font-weight: bold;
                }

                .signature-space {
                    height: 80px;
                }

                @media print {

                    body {
                        padding: 0;
                    }

                    .salary-slip {
                        border: none;
                        max-width: none;
                    }

                }

            </style>

        </head>


        <body>

            <div class="salary-slip">

                <div class="header">

                    <h1>GYM MANAGEMENT SYSTEM</h1>

                    <h2>PHIẾU LƯƠNG NHÂN SỰ</h2>

                    <div class="month">
                        Tháng lương: ${salaryMonth}
                    </div>

                </div>


                <div class="info">

                    <div class="info-item">
                        <span class="label">
                            Mã nhân sự:
                        </span>
                        ${code}
                    </div>

                    <div class="info-item">
                        <span class="label">
                            Họ và tên:
                        </span>
                        ${name}
                    </div>

                    <div class="info-item">
                        <span class="label">
                            Vai trò:
                        </span>
                        ${role}
                    </div>

                    <div class="info-item">
                        <span class="label">
                            Ngày công:
                        </span>
                        ${workDays}
                    </div>

                    <div class="info-item">
                        <span class="label">
                            Số buổi PT:
                        </span>
                        ${sessions}
                    </div>

                    <div class="info-item">
                        <span class="label">
                            Số lần đi trễ:
                        </span>
                        ${lateDays}
                    </div>

                </div>


                <table>

                    <thead>

                        <tr>
                            <th>Khoản mục</th>
                            <th>Số tiền</th>
                        </tr>

                    </thead>


                    <tbody>

                        <tr>
                            <td>Lương cơ bản</td>
                            <td class="money">
                                ${formatMoney(baseSalary)}
                            </td>
                        </tr>

                        <tr>
                            <td>Phụ cấp / Hoa hồng PT</td>
                            <td class="money">
                                ${formatMoney(allowance)}
                            </td>
                        </tr>

                        <tr>
                            <td>Thưởng / Tăng lương</td>
                            <td class="money">
                                ${formatMoney(bonus)}
                            </td>
                        </tr>

                        <tr>
                            <td>Khấu trừ / Phạt</td>
                            <td class="money">
                                - ${formatMoney(deduction)}
                            </td>
                        </tr>

                    </tbody>

                </table>


                <div class="total">

                    <span>
                        THỰC NHẬN
                    </span>

                    <span>
                        ${formatMoney(total)}
                    </span>

                </div>


                <div class="note">

                    <strong>Ghi chú:</strong>

                    <br><br>

                    ${note || 'Không có'}

                </div>


                <div class="signatures">

                    <div>

                        <div class="signature-title">
                            Người nhận lương
                        </div>

                        <div class="signature-space"></div>

                        ${name}

                    </div>


                    <div>

                        <div class="signature-title">
                            Quản lý
                        </div>

                        <div class="signature-space"></div>

                        Ký và ghi rõ họ tên

                    </div>

                </div>

            </div>


            <script>

                window.onload = function() {

                    window.print();

                };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();
}

// ==============================================================================
// EXPORT GLOBAL FUNCTIONS
// ==============================================================================

window.openAddSalaryModal =
    openAddSalaryModal;

window.openEditSalaryModal =
    openEditSalaryModal;

window.openSalaryDetailModal =
    openSalaryDetailModal;

window.handleSaveSalary =
    handleSaveSalary;

window.handleDeleteSalary =
    handleDeleteSalary;

window.calculateTotalSalary =
    calculateTotalSalary;

window.printSalarySlip =
    printSalarySlip;
// ==============================================================================

// 6. QUẢN LÝ TÀI KHOẢN HỆ THỐNG (USERS CRUD)
// ==============================================================================

let selectedUserRoleFilter = 'all';

async function loadUsers() {

  const tableBody =
    document.getElementById('userTableBody');

  if (!tableBody) return;

  const currentUser =
    (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser)
      ? GymAPI.getCurrentUser()
      : { Role: 'staff' };

  const role =
    String(currentUser.Role || '').toLowerCase();

  // Staff / Trainer không được truy cập User Management
  if (role !== 'admin') {
    return;
  }

  try {

    const response =
      await GymAPI.getUsers();

    const users =
      Array.isArray(response)
        ? response
        : (response?.data || []);

    const searchInput =
      document.getElementById('userSearchInput');

    const term =
      searchInput
        ? searchInput.value.toLowerCase().trim()
        : '';

    let filtered = users;

    if (selectedUserRoleFilter !== 'all') {
      filtered = filtered.filter(
        u =>
          String(u.Role || '').toLowerCase() ===
          selectedUserRoleFilter.toLowerCase()
      );
    }

    if (term) {
      filtered = filtered.filter(u =>
        String(u.Username || '')
          .toLowerCase()
          .includes(term) ||

        String(u.Fullname || '')
          .toLowerCase()
          .includes(term) ||

        String(u.Role || '')
          .toLowerCase()
          .includes(term)
      );
    }

    tableBody.innerHTML =
      filtered.map(u => `
        <tr>

          <td>${u.UserID}</td>

          <td>${u.Username}</td>

          <td>${u.Role}</td>

          <td>
            <span class="badge ${
              String(u.Status).toLowerCase() === 'active'
                ? 'badge-green'
                : 'badge-red'
            }">
              ${u.Status}
            </span>
          </td>

          <td style="text-align:center;">
            <button
              class="btn btn-secondary btn-sm"
              onclick="openEditUserModal(${u.UserID})">
              Sửa
            </button>

            <button
              class="btn btn-danger btn-sm"
              onclick="deleteUser(${u.UserID})">
              Xóa
            </button>
          </td>

        </tr>
      `).join('');

  } catch (error) {

    console.error('[USERS] Load error:', error);

  }
}
function filterUserRole(role, event) {
  selectedUserRoleFilter = role;
  const tabs = document.querySelectorAll('#userRoleFilterTabs .tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  if (event && event.target) {
    event.target.classList.add('active');
  }
  loadUsers();
}

function handleUserSearch() {
  loadUsers();
}


function openAddUserModal() {
  document.getElementById('userModalTitle').textContent = 'Thêm Tài khoản Hệ thống';
  document.getElementById('userForm').reset();
  document.getElementById('usrId').value = '';
  openModal('userModal');
}

async function openEditUserModal(id) {
  const response = await GymAPI.getUsers();
  const users = response.data || [];
  const u = users.find(user => user.UserID === Number(id));
  if (!u) return;

  document.getElementById('userModalTitle').textContent = 'Chỉnh sửa Tài khoản';
  document.getElementById('usrId').value = u.UserID;
  document.getElementById('usrUsername').value = u.Username;
  document.getElementById('usrFullname').value = u.Fullname || '';
  document.getElementById('usrRole').value = u.Role;
  document.getElementById('usrStatus').value = u.Status;
  openModal('userModal');
}
async function handleSaveUser(e) {
    e.preventDefault();

    const id = document.getElementById('usrId').value;
    const username = document.getElementById('usrUsername').value.trim();

    const roleElement = document.getElementById('usrRole');
    const role = roleElement ? roleElement.value.toLowerCase() : '';

    const statusElement = document.getElementById('usrStatus');
    const status = statusElement ? statusElement.value.toLowerCase() : '';

    if (!role) {
        showToast('Vui lòng chọn quyền tài khoản!', 'error');
        return;
    }

    // SỬA TÀI KHOẢN
    if (id) {
        const res = await GymAPI.updateUser({
            UserID: Number(id),
            Username: username,
            Role: role,
            Status: status
        });

        if (!res.success) {
            showToast(res.message || 'Cập nhật tài khoản thất bại!', 'error');
            return;
        }

        showToast('Cập nhật tài khoản thành công!', 'success');
    }

    // THÊM TÀI KHOẢN
    else {
        const password = prompt('Nhập mật khẩu cho tài khoản mới:');

        if (!password) {
            showToast('Vui lòng nhập mật khẩu!', 'error');
            return;
        }

        const res = await GymAPI.addUser({
            username: username,
            password: password,
            role: role
        });

        if (!res.success) {
            showToast(res.message || 'Thêm tài khoản thất bại!', 'error');
            return;
        }

        showToast('Thêm tài khoản mới thành công!', 'success');
    }

    closeModal('userModal');
    loadUsers();
}

async function deleteUser(id) {
  if (!confirm('Bạn có chắc muốn xóa tài khoản này không?')) {
    return;
  }

  const res = await GymAPI.deleteUser(id);

  if (!res.success) {
    showToast(res.message || 'Xóa tài khoản thất bại!', 'error');
    return;
  }

  showToast('Xóa tài khoản thành công!', 'success');
  loadUsers();
}
async function toggleUserStatus(id) {
  const db = MockDB.getDB();
  const user = db.users.find(u => u.UserID === Number(id));
  if (user) {
    user.Status = user.Status === 'Active' ? 'Inactive' : 'Active';
    MockDB.saveDB(db);
    showToast(`Đã đổi trạng thái tài khoản ${user.Username} thành: ${user.Status}`, 'info');
    loadUsers();
  }
}
async function loadMySalary() {

  try {

    const currentUser =
      (typeof GymAPI !== 'undefined' &&
       GymAPI.getCurrentUser)
        ? GymAPI.getCurrentUser()
        : null;

    if (!currentUser) {
      return;
    }

    const trainerIncomeView =
      document.getElementById('trainerIncomeView');

    const staffSalaryView =
      document.getElementById('staffSalaryView');

    const role =
      String(currentUser.Role || '').toLowerCase();

    // =========================
    // TRAINER
    // =========================

    if (role === 'trainer') {

      if (trainerIncomeView) {
        trainerIncomeView.style.display = 'block';
      }

      if (staffSalaryView) {
        staffSalaryView.style.display = 'none';
      }

      return;
    }

    // =========================
    // STAFF
    // =========================

    if (trainerIncomeView) {
      trainerIncomeView.style.display = 'none';
    }

    if (staffSalaryView) {
      staffSalaryView.style.display = 'block';
    }

    const staffNameEl =
      document.getElementById('mySalaryStaffName');

    if (staffNameEl) {
      staffNameEl.textContent =
        currentUser.Fullname ||
        currentUser.Username ||
        'Nhân viên';
    }

    // =========================
    // LẤY SALARY TỪ DATABASE
    // =========================

    const result =
      await GymAPI.getSalaries();

    const salaries =
      Array.isArray(result?.data)
        ? result.data
        : [];

    const userID =
      Number(currentUser.UserID);

    const mySalaries =
      salaries
        .filter(s => Number(s.UserID) === userID)
        .sort((a, b) =>
          String(b.SalaryMonth)
            .localeCompare(String(a.SalaryMonth))
        );

    // =========================
    // THÁNG HIỆN TẠI
    // =========================

    const currentMonth =
      new Date().toISOString().slice(0, 7);

    const currentSalary =
      mySalaries.find(
        s => s.SalaryMonth === currentMonth
      );

    const totalEl =
      document.getElementById('mySalaryTotal');

    const workDaysEl =
      document.getElementById('mySalaryWorkDays');

    const bonusEl =
      document.getElementById('mySalaryBonus');

    const historyEl =
      document.getElementById(
        'mySalaryHistoryTableBody'
      );

    // =========================
    // KHÔNG CÓ LƯƠNG THÁNG NÀY
    // =========================

    if (!currentSalary) {

      if (totalEl) {
        totalEl.textContent = 'Chưa có';
      }

      if (workDaysEl) {
        workDaysEl.textContent = 'Chưa có dữ liệu';
      }

      if (bonusEl) {
        bonusEl.textContent = '0đ';
      }

    } else {

      const base =
        Number(currentSalary.BaseSalary) || 0;

      const allowance =
        Number(currentSalary.Allowance) || 0;

      const bonus =
        Number(currentSalary.Bonus) || 0;

      const deduction =
        Number(currentSalary.Deduction) || 0;

      const total =
        Math.max(
          0,
          base +
          allowance +
          bonus -
          deduction
        );

      if (totalEl) {
        totalEl.textContent =
          formatVND(total);
      }

      if (workDaysEl) {
        workDaysEl.textContent =
          `${currentSalary.WorkDays || 0}/26 ngày`;
      }

      if (bonusEl) {
        bonusEl.textContent =
          formatVND(bonus);
      }
    }

    // =========================
    // LỊCH SỬ LƯƠNG
    // =========================

    if (historyEl) {

      if (mySalaries.length === 0) {

        historyEl.innerHTML = `
          <tr>
            <td colspan="6"
                style="
                  text-align:center;
                  color:#9CA3AF;
                  padding:24px;
                ">
              Chưa có dữ liệu lương
            </td>
          </tr>
        `;

      } else {

        historyEl.innerHTML =
          mySalaries.map(s => {

            const base =
              Number(s.BaseSalary) || 0;

            const bonus =
              Number(s.Bonus) || 0;

            const deduction =
              Number(s.Deduction) || 0;

            const allowance =
              Number(s.Allowance) || 0;

            const total =
              Math.max(
                0,
                base +
                allowance +
                bonus -
                deduction
              );

            const monthText =
              s.SalaryMonth
                ? `T${Number(
                    s.SalaryMonth.split('-')[1]
                  )}/${s.SalaryMonth.split('-')[0]}`
                : '—';

            return `
              <tr style="
                border-bottom:
                  1px solid rgba(255,255,255,0.06);
              ">

                <td style="
                  color:#FFFFFF;
                  padding:14px 18px;
                ">
                  ${monthText}
                </td>

                <td style="
                  font-weight:700;
                  color:#FFFFFF;
                  padding:14px 18px;
                ">
                  ${formatVND(base)}
                </td>

                <td style="
                  color:#9CA3AF;
                  padding:14px 18px;
                ">
                  ${s.WorkDays || 0}
                </td>

                <td style="
                  color:#9CA3AF;
                  padding:14px 18px;
                ">
                  ${formatVND(bonus)}
                </td>

                <td style="
                  color:#9CA3AF;
                  padding:14px 18px;
                ">
                  ${formatVND(deduction)}
                </td>

                <td style="
                  font-weight:700;
                  color:#10B981;
                  padding:14px 18px;
                ">
                  ${formatVND(total)}
                </td>

              </tr>
            `;

          }).join('');
      }
    }

  } catch (error) {

    console.error(
      'loadMySalary error:',
      error
    );

    showToast(
      'Không thể tải dữ liệu lương!',
      'error'
    );
  }
}

/**
 * Tải và lọc dữ liệu Báo cáo thống kê
 */
async function loadReportsData() {
  try {

    const range =
      document.getElementById('reportTimeRange')?.value ||
      'month';

    const totalRevEl =
      document.getElementById('repTotalRevenue');

    const prodRevEl =
      document.getElementById('repProductRevenue');

    const newMemEl =
      document.getElementById('repNewMembers');

    const renewalEl =
      document.getElementById('repRenewalRate');
    const membershipRevEl =
        document.getElementById('repMembershipRevenue');

    const retailRevEl =
        document.getElementById('repRetailRevenue');

    const productCountEl =
        document.getElementById('repProductCount');
    
    const [
        paymentsResult,
        membersResult,
        salesResult,
        attendanceResult
    ] = await Promise.all([
        GymAPI.getPayments(),
        GymAPI.getMembers(),
        GymAPI.getSales(),
        GymAPI.getAttendance()
    ]);

    const payments =
      Array.isArray(paymentsResult)
        ? paymentsResult
        : (paymentsResult?.data || []);

    const members =
      Array.isArray(membersResult)
        ? membersResult
        : (membersResult?.data || []);

    const sales =
      Array.isArray(salesResult)
        ? salesResult
        : (salesResult?.data || []);
    const attendance =
    Array.isArray(attendanceResult)
        ? attendanceResult
        : (attendanceResult?.data || []);

    const now = new Date();

    let startDate;
    let endDate;

    if (range === 'year') {

      startDate =
        new Date(
          now.getFullYear(),
          0,
          1
        );

      endDate =
        new Date(
          now.getFullYear() + 1,
          0,
          1
        );

    } else if (range === 'q3') {

      startDate =
        new Date(
          now.getFullYear(),
          6,
          1
        );

      endDate =
        new Date(
          now.getFullYear(),
          9,
          1
        );

        } else {

    // Tháng hiện tại
    startDate =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

    endDate =
      new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      );
}

    // ============================================================
    // DOANH THU GÓI TẬP
    // ============================================================

    const validPayments =
      payments.filter(payment => {

        const rawDate =
          payment.PaymentDate ||
          payment.CreatedAt ||
          payment.Date ||
          '';

        const paymentDate =
          new Date(rawDate);

        const status =
          String(
            payment.Status ||
            payment.PaymentStatus ||
            ''
          ).toLowerCase();

        return (
          !isNaN(paymentDate.getTime()) &&
          paymentDate >= startDate &&
          paymentDate < endDate &&
          status !== 'pending' &&
          status !== 'cancelled' &&
          status !== 'canceled'
        );
      });

    const membershipRevenue =
      validPayments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.Amount ||
            payment.TotalAmount ||
            0
          ),
        0
      );

    // ============================================================
    // DOANH THU SẢN PHẨM
    // ============================================================

    const validSales =
      sales.filter(sale => {

        const rawDate =
          sale.SaleDate ||
          sale.CreatedAt ||
          sale.PaymentDate ||
          sale.Date ||
          '';

        const saleDate =
          new Date(rawDate);

        const status =
          String(
            sale.Status || ''
          ).toLowerCase();

        return (
          !isNaN(saleDate.getTime()) &&
          saleDate >= startDate &&
          saleDate < endDate &&
          status !== 'pending' &&
          status !== 'cancelled' &&
          status !== 'canceled'
        );
      });

    const productRevenue =
      validSales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.TotalAmount ||
            sale.Amount ||
            0
          ),
        0
      );
      const productCount =
        validSales.reduce(
            (sum, sale) =>
            sum +
            Number(
                sale.Quantity ||
                sale.Qty ||
                sale.quantity ||
                1
            ),
            0
        );

    // ============================================================
    // TỔNG
    // ============================================================

    const totalRevenue =
      membershipRevenue +
      productRevenue;

    // ============================================================
    // HỘI VIÊN MỚI
    // ============================================================

    const newMembers =
      members.filter(member => {

        const rawDate =
          member.JoinDate ||
          member.CreatedAt ||
          member.RegisterDate ||
          member.joinDate ||
          '';

        const joinDate =
          new Date(rawDate);

        return (
          !isNaN(joinDate.getTime()) &&
          joinDate >= startDate &&
          joinDate < endDate
        );
      }).length;

    const formatMoney =
      value =>
        new Intl.NumberFormat('vi-VN')
          .format(value) + 'đ';

    // ============================================================
    // HIỂN THỊ
    // ============================================================

    if (totalRevEl) {
    totalRevEl.textContent =
    formatMoney(totalRevenue);
    }

    if (prodRevEl) {
    prodRevEl.textContent =
        formatMoney(productRevenue);
    }

    if (membershipRevEl) {
    membershipRevEl.textContent =
        formatMoney(membershipRevenue);
    }

    if (retailRevEl) {
    retailRevEl.textContent =
        formatMoney(productRevenue);
    }

    if (productCountEl) {
    productCountEl.textContent =
        `${productCount} sản phẩm`;
    }

    if (renewalEl) {
      renewalEl.textContent =
        'Đang cập nhật';
    }

    // Dữ liệu dùng chung cho chart
    window.reportRevenueData = {
    payments: validPayments,
    sales: validSales
};

    console.log(
      '[REPORT REAL DATA]',
      {
        range,
        membershipRevenue,
        productRevenue,
        totalRevenue,
        newMembers,
        paymentCount:
          validPayments.length,
        salesCount:
          validSales.length
      }
    );

    initReportChart();

    renderReportExtraData({
        payments: validPayments,
        sales: validSales,
        members,
        attendance
    });

  } catch (error) {

    console.error(
      '[REPORT LOAD ERROR]',
      error
    );

    showToast(
      'Không thể tải dữ liệu báo cáo!',
      'error'
    );
  }
}
/**
 * Xuất file Excel chuẩn Microsoft SpreadsheetML (XML Spreadsheet 2003)
 * Chuẩn 100% độ rộng cột, không tràn ô, không che chữ, màu sắc và định dạng chuyên nghiệp.
 */
function exportReportToExcel() {
  const exportTime = new Date().toLocaleString('vi-VN');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Fitness Gym Management</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>Fitness Center</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Color="#1F2937"/>
  </Style>
  <!-- Main Banner -->
  <Style ss:ID="sBanner">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="15" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sSubBanner">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#94A3B8"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
  </Style>
  <!-- Section Headers -->
  <Style ss:ID="sSecHeaderRed">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="11.5" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#FF334B" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sSecHeaderBlue">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="11.5" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E40AF" ss:Pattern="Solid"/>
  </Style>
  <!-- Table Header -->
  <Style ss:ID="sTh">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#334155" ss:Pattern="Solid"/>
  </Style>
  <!-- Data Cells -->
  <Style ss:ID="sTd">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5"/>
  </Style>
  <Style ss:ID="sTdBold">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1"/>
  </Style>
  <Style ss:ID="sTdCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5"/>
  </Style>
  <Style ss:ID="sTdCenterBold">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1"/>
  </Style>
  <!-- Striped Cells (Even rows) -->
  <Style ss:ID="sTdEven">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sTdEvenBold">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sTdEvenCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <!-- Currencies / Numbers -->
  <Style ss:ID="sMoneyRed">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#DC2626"/>
  </Style>
  <Style ss:ID="sMoneyRedEven">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#DC2626"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sMoneyBlue">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#2563EB"/>
  </Style>
  <Style ss:ID="sMoneyGreen">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#059669"/>
  </Style>
  <Style ss:ID="sMoneyGreenEven">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#059669"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <!-- Badges -->
  <Style ss:ID="sBadgeGreen">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#059669"/>
  </Style>
  <Style ss:ID="sBadgeYellow">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#D97706"/>
  </Style>
  <!-- Total Rows -->
  <Style ss:ID="sTotalRed">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#DC2626"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#DC2626"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DC2626"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DC2626"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#DC2626"/>
   <Interior ss:Color="#FEF2F2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sTotalRedMoney">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#DC2626"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#DC2626"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DC2626"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DC2626"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11.5" ss:Bold="1" ss:Color="#DC2626"/>
   <Interior ss:Color="#FEF2F2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sTotalBlue">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#2563EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#2563EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2563EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2563EB"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#2563EB"/>
   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sTotalBlueMoney">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#2563EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#2563EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2563EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2563EB"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11.5" ss:Bold="1" ss:Color="#2563EB"/>
   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
  </Style>
  <!-- Signatures -->
  <Style ss:ID="sSignHead">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="sSignSub">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Italic="1" ss:Color="#64748B"/>
  </Style>
  <Style ss:ID="sSignName">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="Báo cáo Doanh thu">
  <Table ss:DefaultRowHeight="22">
   <Column ss:Width="85"/>
   <Column ss:Width="250"/>
   <Column ss:Width="230"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Column ss:Width="175"/>
   <Column ss:Width="145"/>

   <!-- Banner -->
   <Row ss:Height="36">
    <Cell ss:MergeAcross="6" ss:StyleID="sBanner"><Data ss:Type="String">HỆ THỐNG PHÒNG TẬP GYM FITNESS - BÁO CÁO DOANH THU TỔNG HỢP</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="6" ss:StyleID="sSubBanner"><Data ss:Type="String">Thời gian xuất báo cáo: ${exportTime} • Kỳ thống kê: Tháng 08/2026</Data></Cell>
   </Row>
   <Row ss:Height="12"><Cell ss:MergeAcross="6"/></Row>

   <!-- SECTION 1 -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="6" ss:StyleID="sSecHeaderRed"><Data ss:Type="String">  1. TỔNG QUAN DOANH THU THÁNG 08/2026</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Mã HM</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTh"><Data ss:Type="String">Hạng mục Doanh thu</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Doanh thu (VNĐ)</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Tỷ trọng (%)</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Tăng trưởng</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Trạng thái</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">HM-01</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdBold"><Data ss:Type="String">Doanh thu Gói tập Hội viên (Membership)</Data></Cell>
    <Cell ss:StyleID="sMoneyRed"><Data ss:Type="String">34.800.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">72.1%</Data></Cell>
    <Cell ss:StyleID="sBadgeGreen"><Data ss:Type="String">+11.5%</Data></Cell>
    <Cell ss:StyleID="sBadgeGreen"><Data ss:Type="String">Đạt chỉ tiêu</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">HM-02</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdEvenBold"><Data ss:Type="String">Doanh thu Bán lẻ Sản phẩm (Whey / Nước / Phụ kiện)</Data></Cell>
    <Cell ss:StyleID="sMoneyBlue"><Data ss:Type="String">13.450.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">27.9%</Data></Cell>
    <Cell ss:StyleID="sBadgeGreen"><Data ss:Type="String">+28.5%</Data></Cell>
    <Cell ss:StyleID="sBadgeGreen"><Data ss:Type="String">Tăng trưởng mạnh</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:MergeAcross="2" ss:StyleID="sTotalRed"><Data ss:Type="String">TỔNG CỘNG DOANH THU THÁNG 8</Data></Cell>
    <Cell ss:StyleID="sTotalRedMoney"><Data ss:Type="String">48.250.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTotalRed"><Data ss:Type="String">100.0%</Data></Cell>
    <Cell ss:StyleID="sTotalRed"><Data ss:Type="String">+14.2%</Data></Cell>
    <Cell ss:StyleID="sTotalRed"><Data ss:Type="String">Vượt KPI</Data></Cell>
   </Row>
   <Row ss:Height="14"><Cell ss:MergeAcross="6"/></Row>

   <!-- SECTION 2: PRODUCTS -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="6" ss:StyleID="sSecHeaderBlue"><Data ss:Type="String">  2. DOANH THU KINH DOANH SẢN PHẨM CHI TIẾT (WHEY, NƯỚC UỐNG, TRANG PHỤC, PHỤ KIỆN)</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Mã SP</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Tên sản phẩm</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Danh mục</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Đơn giá bán</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Số lượng bán</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Tổng doanh thu</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Tỷ trọng SP</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">SP-101</Data></Cell>
    <Cell ss:StyleID="sTdBold"><Data ss:Type="String">Whey Gold Standard 5lbs</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">Thực phẩm bổ sung (Supplement)</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">1.800.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">3 Hộp</Data></Cell>
    <Cell ss:StyleID="sMoneyRed"><Data ss:Type="String">5.400.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">40.1%</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">SP-102</Data></Cell>
    <Cell ss:StyleID="sTdEvenBold"><Data ss:Type="String">BCAA 6000 Phục hồi cơ</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">Thực phẩm bổ sung (Supplement)</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">850.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">3 Hộp</Data></Cell>
    <Cell ss:StyleID="sMoneyRedEven"><Data ss:Type="String">2.550.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">19.0%</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">SP-103</Data></Cell>
    <Cell ss:StyleID="sTdBold"><Data ss:Type="String">Nước tăng lực Monster Energy</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">Đồ uống &amp; Năng lượng (Beverage)</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">30.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">80 Lon</Data></Cell>
    <Cell ss:StyleID="sMoneyBlue"><Data ss:Type="String">2.400.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">17.8%</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">SP-104</Data></Cell>
    <Cell ss:StyleID="sTdEvenBold"><Data ss:Type="String">Áo thun tập gym Gymshark</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">Trang phục thể thao (Clothing)</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">250.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">8 Áo</Data></Cell>
    <Cell ss:StyleID="sMoneyGreenEven"><Data ss:Type="String">2.000.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">14.9%</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">SP-105</Data></Cell>
    <Cell ss:StyleID="sTdBold"><Data ss:Type="String">Bình nước Shaker Gym 700ml</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">Phụ kiện tập luyện (Accessory)</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">120.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">9 Bình</Data></Cell>
    <Cell ss:StyleID="sMoneyGreen"><Data ss:Type="String">1.100.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">8.2%</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:MergeAcross="3" ss:StyleID="sTotalBlue"><Data ss:Type="String">TỔNG DOANH THU KINH DOANH SẢN PHẨM (F&amp;B / WHEY)</Data></Cell>
    <Cell ss:StyleID="sTotalBlue"><Data ss:Type="String">103 Đơn vị</Data></Cell>
    <Cell ss:StyleID="sTotalBlueMoney"><Data ss:Type="String">13.450.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTotalBlue"><Data ss:Type="String">100.0%</Data></Cell>
   </Row>
   <Row ss:Height="14"><Cell ss:MergeAcross="6"/></Row>

   <!-- SECTION 3: TRAINERS -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="6" ss:StyleID="sSecHeaderRed"><Data ss:Type="String">  3. HIỆU SUẤT DOANH THU THEO HUẤN LUYỆN VIÊN (HLV)</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Mã HLV</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTh"><Data ss:Type="String">Họ và tên HLV</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Chuyên môn đào tạo</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Số học viên</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Doanh thu phụ trách</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Đánh giá sao</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">HLV-01</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdBold"><Data ss:Type="String">Nguyễn Minh Tuấn</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">Tăng cơ giảm mỡ &amp; PT Cá nhân</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">12 Học viên</Data></Cell>
    <Cell ss:StyleID="sMoneyGreen"><Data ss:Type="String">18.500.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sBadgeYellow"><Data ss:Type="String">⭐⭐⭐⭐⭐ 4.9/5</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">HLV-02</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdEvenBold"><Data ss:Type="String">Trần Quốc Hùng</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">Bodybuilding &amp; Sức mạnh</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">15 Học viên</Data></Cell>
    <Cell ss:StyleID="sMoneyGreenEven"><Data ss:Type="String">21.200.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sBadgeYellow"><Data ss:Type="String">⭐⭐⭐⭐⭐ 5.0/5</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">HLV-03</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdBold"><Data ss:Type="String">Lê Đức Mạnh</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">KickFit, Boxing &amp; Cardio</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">8 Học viên</Data></Cell>
    <Cell ss:StyleID="sMoneyGreen"><Data ss:Type="String">9.800.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sBadgeYellow"><Data ss:Type="String">⭐⭐⭐⭐☆ 4.7/5</Data></Cell>
   </Row>
   <Row ss:Height="14"><Cell ss:MergeAcross="6"/></Row>

   <!-- SECTION 4: PAYMENT METHODS -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="6" ss:StyleID="sSecHeaderBlue"><Data ss:Type="String">  4. CƠ CẤU PHƯƠNG THỨC THANH TOÁN (PAYMENT METHODS)</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="sTh"><Data ss:Type="String">STT</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTh"><Data ss:Type="String">Phương thức thanh toán</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Số giao dịch</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Doanh thu thu về</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Tỷ trọng</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Ghi chú</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">1</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdBold"><Data ss:Type="String">Chuyển khoản VietQR (Ngân hàng MB Bank)</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">21 Giao dịch</Data></Cell>
    <Cell ss:StyleID="sMoneyGreen"><Data ss:Type="String">28.950.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">60.0%</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">Chuyển khoản tự động</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">2</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdEvenBold"><Data ss:Type="String">Tiền mặt (Cash tại quầy tiếp tân)</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">11 Giao dịch</Data></Cell>
    <Cell ss:StyleID="sMoneyGreenEven"><Data ss:Type="String">11.500.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">23.8%</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">Thu trực tiếp</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">3</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdBold"><Data ss:Type="String">Quẹt thẻ POS (Visa / MasterCard / ATM)</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">4 Giao dịch</Data></Cell>
    <Cell ss:StyleID="sMoneyGreen"><Data ss:Type="String">4.800.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">10.0%</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">Máy POS chi nhánh</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">4</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdEvenBold"><Data ss:Type="String">Ví điện tử (MoMo / VNPay / ZaloPay)</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">2 Giao dịch</Data></Cell>
    <Cell ss:StyleID="sMoneyGreenEven"><Data ss:Type="String">3.000.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">6.2%</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">Ví điện tử</Data></Cell>
   </Row>
   <Row ss:Height="24"><Cell ss:MergeAcross="6"/></Row>

   <!-- SIGNATURES -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="1" ss:StyleID="sSignHead"><Data ss:Type="String">NGƯỜI LẬP BÁO CÁO</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="sSignHead"><Data ss:Type="String">KẾ TOÁN TRƯỞNG</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sSignHead"><Data ss:Type="String">GIÁM ĐỐC PHÒNG GYM</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="1" ss:StyleID="sSignSub"><Data ss:Type="String">(Ký và ghi rõ họ tên)</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="sSignSub"><Data ss:Type="String">(Ký và ghi rõ họ tên)</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sSignSub"><Data ss:Type="String">(Ký, đóng dấu)</Data></Cell>
   </Row>
   <Row ss:Height="45"><Cell ss:MergeAcross="6"/></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="1" ss:StyleID="sSignName"><Data ss:Type="String">Văn Điền</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="sSignName"><Data ss:Type="String">Nguyễn Văn Quản Lý</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sSignName"><Data ss:Type="String">Ban Giám Đốc Fitness</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'Bao_Cao_Doanh_Thu_Gym_Fitness_2026.xls');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Xuất báo cáo Excel thành công!', 'success');
}

// ==============================================================================
// PHÂN HỆ CHẤM CÔNG CA TRỰC NHÂN VIÊN (STAFF ATTENDANCE)
// ==============================================================================

let staffClockInterval = null;

function startStaffRealtimeClock() {
  if (staffClockInterval) clearInterval(staffClockInterval);

  function updateClock() {
    const clockEl = document.getElementById('staffRealtimeClock');
    const dateEl = document.getElementById('staffRealtimeDate');
    if (!clockEl) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    if (dateEl) {
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[now.getDay()];
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      dateEl.textContent = `Hôm nay, ${dayName} ${day}/${month}/${year}`;
    }
  }

  updateClock();
  staffClockInterval = setInterval(updateClock, 1000);
}

async function loadStaffAttendanceData() {
  try {
    const currentUser =
      (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser)
        ? GymAPI.getCurrentUser()
        : { UserID: 8, Fullname: 'Lâm Văn Cường' };

    const monthSelect = document.getElementById('staffAttMonthSelect');
    const month = monthSelect ? monthSelect.value : 'all';

    const empNameEl = document.getElementById('staffTodayEmpName');
    if (empNameEl) {
      empNameEl.textContent =
        `${currentUser.Fullname || currentUser.Username || 'Nhân viên'}`;
    }

    const result = await GymAPI.getStaffAttendance(
      currentUser.UserID,
      month
    );

    const records = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];

    // =========================
    // TÍNH KPI
    // =========================

    const workDays = records.filter(r => r.CheckInTime).length;

    let totalWorkHours = 0;
    let lateDays = 0;

    records.forEach(r => {
      // Tổng giờ làm
      if (r.CheckInTime && r.CheckOutTime) {
        const inParts = r.CheckInTime.split(':').map(Number);
        const outParts = r.CheckOutTime.split(':').map(Number);

        const inSec =
          inParts[0] * 3600 +
          inParts[1] * 60 +
          (inParts[2] || 0);

        const outSec =
          outParts[0] * 3600 +
          outParts[1] * 60 +
          (outParts[2] || 0);

        if (outSec >= inSec) {
          totalWorkHours += (outSec - inSec) / 3600;
        }
      }

      // Đi muộn
      if (r.CheckInTime) {
        const p = r.CheckInTime.split(':').map(Number);

        const checkInMinutes =
          p[0] * 60 + p[1];

        // Ca sáng bắt đầu 06:00
        if (checkInMinutes > 6 * 60) {
          lateDays++;
        }
      }
    });

    totalWorkHours = Number(totalWorkHours.toFixed(2));

    // =========================
    // CẬP NHẬT KPI
    // =========================

    const workDaysEl =
      document.getElementById('staffKpiWorkDays');

    const workHoursEl =
      document.getElementById('staffKpiWorkHours');

    const lateDaysEl =
      document.getElementById('staffKpiLateDays');

    const allowanceEl =
      document.getElementById('staffKpiAllowance');

    if (workDaysEl) {
      workDaysEl.textContent = `${workDays} ngày`;
    }

    if (workHoursEl) {
      workHoursEl.textContent =
        `${totalWorkHours} Giờ`;
    }

    if (lateDaysEl) {
      lateDaysEl.textContent =
        `${lateDays} Lần`;
    }

    if (allowanceEl) {
      allowanceEl.textContent =
        workDays >= 22
          ? '+500.000đ'
          : '0đ';
    }

    // =========================
    // RENDER TABLE
    // =========================

    const tableBody =
      document.getElementById('staffAttTableBody');

    const recordCountEl =
      document.getElementById('staffAttRecordCount');

    if (recordCountEl) {
      recordCountEl.textContent =
        `Hiển thị ${records.length} ca làm việc`;
    }

    if (tableBody) {

      if (records.length === 0) {

        tableBody.innerHTML = `
          <tr>
            <td colspan="9"
                style="
                  text-align:center;
                  color:#9CA3AF;
                  padding:24px;
                ">
              Chưa có dữ liệu chấm công
            </td>
          </tr>
        `;

      } else {

        tableBody.innerHTML = records.map(r => {

          let workHoursDisplay = '—';

          if (!r.CheckOutTime) {

            workHoursDisplay = `
              <span style="color:#10B981;font-weight:700;">
                Đang làm...
              </span>
            `;

          } else {

            const inParts =
              r.CheckInTime.split(':').map(Number);

            const outParts =
              r.CheckOutTime.split(':').map(Number);

            const inSec =
              inParts[0] * 3600 +
              inParts[1] * 60 +
              (inParts[2] || 0);

            const outSec =
              outParts[0] * 3600 +
              outParts[1] * 60 +
              (outParts[2] || 0);

            const hours =
              Math.max(0, (outSec - inSec) / 3600);

            workHoursDisplay =
              `${hours.toFixed(2)}h`;
          }

          let statusBadge =
            `<span class="badge badge-green">
              <i class="fa fa-check-circle"></i>
              Đúng giờ
            </span>`;

          if (r.Status === 'Late') {

            statusBadge =
              `<span class="badge badge-yellow">
                <i class="fa fa-clock"></i>
                Đi muộn
              </span>`;

          } else if (r.Status === 'EarlyLeave') {

            statusBadge =
              `<span class="badge badge-red">
                <i class="fa fa-exclamation-triangle"></i>
                Về sớm
              </span>`;
          }

          // Backend employee-attendance dùng AttendanceStaffID
          // Nếu API mới trả AttendanceID thì dùng fallback
          const attendanceId =
            r.AttendanceStaffID ??
            r.AttendanceID ??
            r.ID;

          return `
            <tr>

              <td style="
                font-weight:700;
                color:#FFFFFF;
                padding:14px 18px;
              ">
                #${attendanceId ?? '—'}
              </td>

              <td style="
                color:#FFFFFF;
                font-weight:600;
                padding:14px 18px;
              ">
                ${formatDate(r.ShiftDate)}
              </td>

              <td style="
                color:#3B82F6;
                font-weight:700;
                padding:14px 18px;
              ">
                ${r.ShiftName || 'Ca Sáng (06:00 - 14:00)'}
              </td>

              <td style="
                color:#10B981;
                font-weight:700;
                padding:14px 18px;
              ">
                ${r.CheckInTime || '—'}
              </td>

              <td style="
                color:${r.CheckOutTime ? '#E5E7EB' : '#9CA3AF'};
                padding:14px 18px;
              ">
                ${r.CheckOutTime || '—'}
              </td>

              <td style="
                font-weight:700;
                color:#FFFFFF;
                text-align:center;
                padding:14px 18px;
              ">
                ${workHoursDisplay}
              </td>

              <td style="padding:14px 18px;">
                ${statusBadge}
              </td>

              <td style="
                color:#9CA3AF;
                padding:14px 18px;
              ">
                ${r.Note || '—'}
              </td>

              <td style="
                text-align:center;
                padding:14px 18px;
              ">

                ${
                  attendanceId
                    ? `
                      <button
                        class="btn-action-icon"
                        style="
                          color:#EF4444;
                          border-color:rgba(239,68,68,0.3);
                        "
                        title="Xóa ca này"
                        onclick="handleDeleteStaffAttendance(${attendanceId})"
                      >
                        <i class="fa fa-trash-alt"></i>
                      </button>
                    `
                    : ''
                }

              </td>

            </tr>
          `;

        }).join('');
      }
    }

    // =========================
    // TRẠNG THÁI CA HÔM NAY
    // =========================

    const todayStr =
      new Date().toISOString().split('T')[0];

    const todayRecords =
      records.filter(r => r.ShiftDate === todayStr);

    const activeRecord =
      todayRecords.find(r => !r.CheckOutTime);

    const todayRecord =
      activeRecord || todayRecords[0];

    const statusBadgeEl =
      document.getElementById('staffTodayStatusBadge');

    const inTimeEl =
      document.getElementById('staffTodayInTime');

    const outTimeEl =
      document.getElementById('staffTodayOutTime');

    if (activeRecord) {

      if (inTimeEl) {
        inTimeEl.textContent =
          activeRecord.CheckInTime;
      }

      if (outTimeEl) {
        outTimeEl.textContent =
          'Chưa check-out';
      }

      if (statusBadgeEl) {
        statusBadgeEl.className =
          'badge badge-green';

        statusBadgeEl.innerHTML =
          `<i class="fa fa-check-circle"></i>
           Đang trong ca (${activeRecord.CheckInTime})`;
      }

    } else if (todayRecord) {

      if (inTimeEl) {
        inTimeEl.textContent =
          todayRecord.CheckInTime || '—';
      }

      if (outTimeEl) {
        outTimeEl.textContent =
          todayRecord.CheckOutTime || '—';
      }

      if (statusBadgeEl) {
        statusBadgeEl.className =
          'badge badge-green';

        statusBadgeEl.innerHTML =
          `<i class="fa fa-check-double"></i>
           Đã hoàn thành ca`;
      }

    } else {

      if (inTimeEl) {
        inTimeEl.textContent =
          'Chưa check-in';
      }

      if (outTimeEl) {
        outTimeEl.textContent = '—';
      }

      if (statusBadgeEl) {
        statusBadgeEl.className =
          'badge badge-yellow';

        statusBadgeEl.innerHTML =
          '<i class="fa fa-hourglass-start"></i> Chưa vào ca';
      }
    }

  } catch (error) {

    console.error(
      'loadStaffAttendanceData error:',
      error
    );

    showToast(
      'Không thể tải dữ liệu chấm công!',
      'error'
    );
  }
}

async function handleStaffRealtimeCheckIn() {
    try {
        const currentUser =
            (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser)
                ? GymAPI.getCurrentUser()
                : { UserID: 8, Fullname: 'Lâm Văn Cường' };

        // Kiểm tra xem nhân viên đã có ca đang mở chưa
        const attendanceResult =
            await GymAPI.getStaffAttendance(
                currentUser.UserID
            );

        const records = attendanceResult?.data || [];

        const activeShift =
            records.find(r => !r.CheckOutTime);

        if (activeShift) {
            showToast(
                `Bạn đang trong ca! Đã check-in lúc ${activeShift.CheckInTime}.`,
                'error'
            );
            return;
        }

        const now = new Date();

        const timeStr =
            now.toTimeString().split(' ')[0];

        const dateStr =
            now.toISOString().split('T')[0];

        let shiftName =
            'Ca Sáng (06:00 - 14:00)';

        const hour = now.getHours();

        if (hour >= 13 && hour < 18) {
            shiftName =
                'Ca Chiều (14:00 - 22:00)';
        } else if (hour >= 18) {
            shiftName =
                'Ca Tối (18:00 - 23:00)';
        }

        const result =
            await GymAPI.checkInStaff({
                UserID:
                    currentUser.UserID || 8,

                StaffName:
                    currentUser.Fullname ||
                    'Lâm Văn Cường',

                StaffCode:
                    'NV201',

                ShiftDate:
                    dateStr,

                ShiftName:
                    shiftName,

                CheckInTime:
                    timeStr,

                Status:
                    'OnTime',

                Note:
                    'Đúng giờ'
            });

        if (!result || !result.success) {
            showToast(
                result?.message ||
                'Check-in thất bại!',
                'error'
            );
            return;
        }

        showToast(`Check-in vào ca thành công lúc ${timeStr}!`, 'success');
        await loadStaffAttendanceData();
        await updateStaffCurrentShiftUI();
    } catch (error) {

        console.error(
            '[CHECK-IN ERROR]',
            error
        );

        showToast(
            'Không thể thực hiện check-in!',
            'error'
        );
    }
}
async function updateStaffCurrentShiftUI() {
    try {
        const currentUser =
            (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser)
                ? GymAPI.getCurrentUser()
                : null;

        if (!currentUser) return;

        const result =
            await GymAPI.getStaffAttendance(currentUser.UserID);

        const records = Array.isArray(result)
            ? result
            : (Array.isArray(result?.data) ? result.data : []);

        const today =
            new Date().toISOString().split('T')[0];

        // Tìm ca hôm nay đang mở
        const currentShift = records.find(r =>
            String(r.UserID) === String(currentUser.UserID) &&
            String(r.AttendanceDate || r.ShiftDate || '').startsWith(today) &&
            r.CheckInTime &&
            !r.CheckOutTime
        );

        // Card trạng thái ca
        const statusEl = Array.from(
            document.querySelectorAll('*')
        ).find(el =>
            el.textContent?.trim() === 'Chưa vào ca'
        );

        const checkInEl = Array.from(
            document.querySelectorAll('*')
        ).find(el =>
            el.textContent?.trim() === 'Chưa check-in'
        );

        // Nút
        const buttons =
            Array.from(document.querySelectorAll('button'));

        const checkInBtn = buttons.find(btn =>
            btn.textContent.includes('Check-in Vào Ca')
        );

        const checkOutBtn = buttons.find(btn =>
            btn.textContent.includes('Check-out Tan Ca')
        );

        if (currentShift) {

            // =========================
            // ĐANG TRONG CA
            // =========================

            if (statusEl) {
                statusEl.textContent = 'Đang trong ca';
            }

            if (checkInEl) {
                checkInEl.textContent =
                    currentShift.CheckInTime;
            }

            // Ẩn Check-in
            if (checkInBtn) {
                checkInBtn.style.display = 'none';
            }

            // HIỆN Check-out
            if (checkOutBtn) {
                checkOutBtn.style.display = 'inline-flex';
            }

        } else {

            // =========================
            // CHƯA VÀO CA
            // =========================

            if (statusEl) {
                statusEl.textContent = 'Chưa vào ca';
            }

            if (checkInEl) {
                checkInEl.textContent = 'Chưa check-in';
            }

            // Hiện Check-in
            if (checkInBtn) {
                checkInBtn.style.display = 'inline-flex';
            }

            // Ẩn Check-out
            if (checkOutBtn) {
                checkOutBtn.style.display = 'none';
            }
        }

    } catch (error) {
        console.error(
            '[UPDATE SHIFT UI ERROR]',
            error
        );
    }
}

    if (currentShift) {
        // Đã vào ca
        if (statusEl) {
            statusEl.textContent = 'Đang trong ca';
        }

        if (checkInEl) {
            checkInEl.textContent = currentShift.CheckInTime;
        }

        // Ẩn nút Check-in
        const checkInButtons = Array.from(document.querySelectorAll('button'));

        checkInButtons.forEach(btn => {
            if (btn.textContent.includes('Check-in Vào Ca')) {
                btn.style.display = 'none';
            }
        });

        // Hiện nút Check-out
        checkInButtons.forEach(btn => {
            if (btn.textContent.includes('Check-out Tan Ca')) {
                btn.style.display = '';
            }
        });

    } else {
        // Chưa vào ca
        if (statusEl) {
            statusEl.textContent = 'Chưa vào ca';
        }

        if (checkInEl) {
            checkInEl.textContent = 'Chưa check-in';
        }

        const buttons = Array.from(document.querySelectorAll('button'));

        buttons.forEach(btn => {
            if (btn.textContent.includes('Check-in Vào Ca')) {
                btn.style.display = '';
            }

            if (btn.textContent.includes('Check-out Tan Ca')) {
                btn.style.display = 'none';
            }
        });
    }

async function handleStaffRealtimeCheckOut() {
    try {
        const currentUser =
            (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser)
                ? GymAPI.getCurrentUser()
                : { UserID: 8, Fullname: 'Lâm Văn Cường' };

        const result = await GymAPI.getStaffAttendance(currentUser.UserID);

        if (!result || !result.success) {
            showToast(
                result?.message || 'Không thể lấy dữ liệu chấm công!',
                'error'
            );
            return;
        }

        const records = Array.isArray(result.data)
            ? result.data
            : [];

        // Tìm ca hôm nay chưa check-out
        const todayStr = new Date().toISOString().split('T')[0];

        let targetRecord = records.find(
            r =>
                r.UserID == currentUser.UserID &&
                r.AttendanceDate === todayStr &&
                !r.CheckOutTime
        );

        if (!targetRecord) {
            showToast(
                'Không tìm thấy ca đang mở để check-out!',
                'error'
            );
            return;
        }

        const checkoutResult =
            await GymAPI.checkOutStaff(
                targetRecord.EmployeeAttendanceID
            );

        if (checkoutResult.success) {
            showToast(
                'Check-out tan ca thành công!',
                'success'
            );

            await loadStaffAttendanceData();
            await updateStaffCurrentShiftUI();
        } else {
            showToast(
                checkoutResult.message ||
                'Check-out thất bại!',
                'error'
            );
        }

    } catch (error) {
        console.error(
            '[STAFF ATTENDANCE] Check-out lỗi:',
            error
        );

        showToast(
            'Có lỗi xảy ra khi check-out!',
            'error'
        );
    }
}


async function handleStaffLeaveSubmit(e) {
    e.preventDefault();

    try {
        const type = document.getElementById('leaveType')?.value || '';
        const date = document.getElementById('leaveDate')?.value || '';
        const shift = document.getElementById('leaveShift')?.value || '';
        const reason =
            document.getElementById('leaveReason')?.value.trim() || '';

        if (!date || !reason) {
            showToast(
                'Vui lòng điền đầy đủ ngày áp dụng và lý do!',
                'error'
            );
            return;
        }

        const currentUser =
            (typeof GymAPI !== 'undefined' &&
             typeof GymAPI.getCurrentUser === 'function')
                ? GymAPI.getCurrentUser()
                : null;

        const request = {
            RequestID: Date.now(),
            UserID: currentUser?.UserID || null,
            Username: currentUser?.Username || '',
            StaffName:
                currentUser?.Fullname ||
                currentUser?.FullName ||
                currentUser?.Username ||
                'Nhân viên',
            Type: type,
            ApplyDate: date,
            Shift: shift,
            Reason: reason,
            Status: 'Pending',
            CreatedAt: new Date().toISOString()
        };

        const requests = JSON.parse(
            localStorage.getItem('staffLeaveRequests') || '[]'
        );

        requests.push(request);

        localStorage.setItem(
            'staffLeaveRequests',
            JSON.stringify(requests)
        );

        // Reset form
        const form = document.getElementById('staffLeaveForm');
        if (form) {
            form.reset();
        }

        closeModal('staffLeaveModal');

        showToast(
            '✓ Đã gửi đơn thành công! Đơn đang chờ quản lý xét duyệt.',
            'success'
        );

        console.log('[LEAVE REQUEST]', request);

    } catch (error) {
        console.error('[LEAVE REQUEST ERROR]', error);

        showToast(
            'Có lỗi khi gửi đơn xin nghỉ!',
            'error'
        );
    }
}
function calculateWorkHours(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;

    const inParts =
        String(checkIn).split(':').map(Number);

    const outParts =
        String(checkOut).split(':').map(Number);

    const inSeconds =
        inParts[0] * 3600 +
        inParts[1] * 60 +
        (inParts[2] || 0);

    const outSeconds =
        outParts[0] * 3600 +
        outParts[1] * 60 +
        (outParts[2] || 0);

    return Math.max(
        0,
        (outSeconds - inSeconds) / 3600
    );
}

async function exportStaffAttendanceExcel() {
    try {
        const currentUser =
            (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser)
                ? GymAPI.getCurrentUser()
                : null;

        if (!currentUser) {
            showToast(
                'Không xác định được tài khoản nhân viên!',
                'error'
            );
            return;
        }

        const monthSelect =
            document.getElementById('staffAttMonthSelect');

        const month =
            monthSelect?.value || 'all';

        const result =
            await GymAPI.getStaffAttendance(
                currentUser.UserID
            );

        // Chuẩn hóa response
        const records =
            Array.isArray(result)
                ? result
                : (
                    Array.isArray(result?.data)
                        ? result.data
                        : []
                );

        if (records.length === 0) {
            showToast(
                'Không có dữ liệu chấm công để xuất!',
                'error'
            );
            return;
        }

        // Lọc theo tháng nếu chọn tháng cụ thể
        const filteredRecords =
            month === 'all'
                ? records
                : records.filter(r => {
                    const date =
                        String(
                            r.ShiftDate ||
                            r.AttendanceDate ||
                            ''
                        ).substring(0, 7);

                    return date === month;
                });

        if (filteredRecords.length === 0) {
            showToast(
                'Không có dữ liệu chấm công trong tháng này!',
                'error'
            );
            return;
        }

        const escapeXml = value =>
            String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');

        const monthTitle =
            month === 'all'
                ? 'TẤT CẢ CA TRỰC'
                : `THÁNG ${month.split('-')[1]}/${month.split('-')[0]}`;

        const rows = filteredRecords.map((r, index) => {

            const attendanceId =
                r.AttendanceStaffID ??
                r.EmployeeAttendanceID ??
                r.AttendanceID ??
                r.ID ??
                '';

            const staffCode =
                r.StaffCode ||
                currentUser.Username ||
                '';

            const staffName =
                r.StaffName ||
                currentUser.Fullname ||
                currentUser.FullName ||
                currentUser.Username ||
                '';

            const shiftName =
                r.ShiftName ||
                'Ca Sáng (06:00 - 14:00)';

            const workHours =
                r.WorkHours != null
                    ? Number(r.WorkHours)
                    : (
                        r.CheckInTime &&
                        r.CheckOutTime
                            ? calculateWorkHours(
                                r.CheckInTime,
                                r.CheckOutTime
                            )
                            : 0
                    );

            const status =
                r.Status === 'Late'
                    ? 'Đi muộn'
                    : r.Status === 'EarlyLeave'
                        ? 'Về sớm'
                        : r.CheckOutTime
                            ? 'Đã hoàn thành'
                            : 'Đang trong ca';

            return `
                <Row ss:Height="22">
                    <Cell ss:StyleID="sRow">
                        <Data ss:Type="String">
                            ${escapeXml(attendanceId)}
                        </Data>
                    </Cell>

                    <Cell ss:StyleID="sRow">
                        <Data ss:Type="String">
                            ${escapeXml(staffCode)}
                        </Data>
                    </Cell>

                    <Cell ss:StyleID="sRow">
                        <Data ss:Type="String">
                            ${escapeXml(staffName)}
                        </Data>
                    </Cell>

                    <Cell ss:StyleID="sRow">
                        <Data ss:Type="String">
                            ${escapeXml(shiftName)}
                        </Data>
                    </Cell>

                    <Cell ss:StyleID="sRow">
                        <Data ss:Type="String">
                            ${escapeXml(
                                r.ShiftDate ||
                                r.AttendanceDate ||
                                ''
                            )}
                        </Data>
                    </Cell>

                    <Cell ss:StyleID="sRow">
                        <Data ss:Type="String">
                            ${escapeXml(
                                r.CheckInTime || ''
                            )}
                        </Data>
                    </Cell>

                    <Cell ss:StyleID="sRow">
                        <Data ss:Type="String">
                            ${escapeXml(
                                r.CheckOutTime || 'Chưa ra'
                            )}
                        </Data>
                    </Cell>

                    <Cell ss:StyleID="sRow">
                        <Data ss:Type="Number">
                            ${Number(workHours || 0).toFixed(2)}
                        </Data>
                    </Cell>

                    <Cell ss:StyleID="sRow">
                        <Data ss:Type="String">
                            ${escapeXml(status)}
                        </Data>
                    </Cell>
                </Row>
            `;
        }).join('');

        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>

<Workbook
    xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">

    <Styles>

        <Style ss:ID="Default">
            <Font ss:FontName="Segoe UI" ss:Size="11"/>
        </Style>

        <Style ss:ID="sTitle">
            <Alignment
                ss:Horizontal="Center"
                ss:Vertical="Center"/>

            <Font
                ss:FontName="Segoe UI"
                ss:Size="16"
                ss:Bold="1"/>

            <Interior
                ss:Color="#1E1624"
                ss:Pattern="Solid"/>
        </Style>

        <Style ss:ID="sHeader">
            <Alignment
                ss:Horizontal="Center"
                ss:Vertical="Center"/>

            <Font
                ss:FontName="Segoe UI"
                ss:Size="11"
                ss:Bold="1"/>

            <Interior
                ss:Color="#FF334B"
                ss:Pattern="Solid"/>
        </Style>

        <Style ss:ID="sRow">
            <Alignment
                ss:Vertical="Center"/>
        </Style>

    </Styles>

    <Worksheet ss:Name="Bang_Cham_Cong">

        <Table>

            <Column ss:Width="80"/>
            <Column ss:Width="100"/>
            <Column ss:Width="160"/>
            <Column ss:Width="160"/>
            <Column ss:Width="110"/>
            <Column ss:Width="100"/>
            <Column ss:Width="100"/>
            <Column ss:Width="80"/>
            <Column ss:Width="120"/>

            <Row ss:Height="35">
                <Cell
                    ss:MergeAcross="8"
                    ss:StyleID="sTitle">

                    <Data ss:Type="String">
                        ${monthTitle}
                    </Data>

                </Cell>
            </Row>

            <Row ss:Height="25">

                <Cell ss:StyleID="sHeader">
                    <Data ss:Type="String">Mã Công</Data>
                </Cell>

                <Cell ss:StyleID="sHeader">
                    <Data ss:Type="String">Mã NV</Data>
                </Cell>

                <Cell ss:StyleID="sHeader">
                    <Data ss:Type="String">Họ và Tên</Data>
                </Cell>

                <Cell ss:StyleID="sHeader">
                    <Data ss:Type="String">Ca Phân Công</Data>
                </Cell>

                <Cell ss:StyleID="sHeader">
                    <Data ss:Type="String">Ngày Làm</Data>
                </Cell>

                <Cell ss:StyleID="sHeader">
                    <Data ss:Type="String">Giờ Vào</Data>
                </Cell>

                <Cell ss:StyleID="sHeader">
                    <Data ss:Type="String">Giờ Ra</Data>
                </Cell>

                <Cell ss:StyleID="sHeader">
                    <Data ss:Type="String">Số Giờ</Data>
                </Cell>

                <Cell ss:StyleID="sHeader">
                    <Data ss:Type="String">Trạng Thái</Data>
                </Cell>

            </Row>

            ${rows}

        </Table>

    </Worksheet>

</Workbook>`;

        const blob = new Blob(
            [xmlContent],
            {
                type:
                    'application/vnd.ms-excel;charset=utf-8;'
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement('a');

        link.href = url;

        link.download =
            `Bang_Cham_Cong_Nhan_Vien_${month}.xls`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        showToast(
            '✓ Xuất bảng chấm công Excel thành công!',
            'success'
        );

    } catch (error) {

        console.error(
            '[EXPORT EXCEL ERROR]',
            error
        );

        showToast(
            'Không thể xuất Excel!',
            'error'
        );
    }
}

async function handleDeleteStaffAttendance(attendanceId) {
  await GymAPI.deleteStaffAttendance(attendanceId);
  showToast('Đã xóa ca chấm công thành công!', 'info');
  await loadStaffAttendanceData();
}

async function handleResetStaffAttendance() {
    try {
        const confirmReset = confirm(
            'Bạn có chắc muốn đặt lại dữ liệu chấm công thử nghiệm không?'
        );

        if (!confirmReset) return;

        // Xóa dữ liệu chấm công local cũ nếu có
        localStorage.removeItem('staff_attendance');
        localStorage.removeItem('staffAttendance');

        // Reload lại dữ liệu từ backend
        await loadStaffAttendanceData();

        showToast(
            '✓ Đã dọn dẹp và đặt lại dữ liệu chấm công!',
            'success'
        );

    } catch (error) {
        console.error('[RESET ATTENDANCE ERROR]', error);

        showToast(
            'Không thể đặt lại dữ liệu chấm công!',
            'error'
        );
    }
}

//window.switchAdminTab = switchAdminTab;
//window.openAddPackageModal = openAddPackageModal;
//window.openEditPackageModal = openEditPackageModal;
//window.handleSavePackage = handleSavePackage;
//window.printInvoice = printInvoice;
//window.openAddPaymentModal = openAddPaymentModal;
//window.handleSavePayment = handleSavePayment;
window.switchAdminTab = switchAdminTab;

window.openAddPackageModal = openAddPackageModal;
window.openEditPackageModal = openEditPackageModal;
window.handleSavePackage = handleSavePackage;
window.handleDeletePackage = handleDeletePackage;

window.printInvoice = printInvoice;

window.openAddPaymentModal = openAddPaymentModal;
window.handleSavePayment = handleSavePayment;
window.openEditPaymentModal = openEditPaymentModal;
window.handleEditPayment = handleEditPayment;
window.handleDeletePayment = handleDeletePayment;

window.filterInventory = filterInventory;
window.openAddInventoryModal = openAddInventoryModal;
window.openEditInventoryModal = openEditInventoryModal;
window.handleSaveInventory = handleSaveInventory;
window.openStaffCheckInModal = openStaffCheckInModal;
window.openAddUserModal = openAddUserModal;
window.openEditUserModal = openEditUserModal;
window.handleSaveUser = handleSaveUser;
window.toggleUserStatus = toggleUserStatus;
window.loadMySalary = loadMySalary;
window.loadReportsData = loadReportsData;
window.exportReportToExcel = exportReportToExcel;
window.loadStaffAttendanceData = loadStaffAttendanceData;
window.handleStaffRealtimeCheckIn = handleStaffRealtimeCheckIn;
window.handleStaffRealtimeCheckOut = handleStaffRealtimeCheckOut;
window.handleStaffLeaveSubmit = handleStaffLeaveSubmit;
window.exportStaffAttendanceExcel = exportStaffAttendanceExcel;
window.handleDeleteStaffAttendance = handleDeleteStaffAttendance;
window.handleResetStaffAttendance = handleResetStaffAttendance;
window.switchAdminTab = switchAdminTab;
window.initAdminTabsFromHash = initAdminTabsFromHash;
window.loadMemberAttendance = loadMemberAttendance;
window.handleMemberAttendanceCheckOut = handleMemberAttendanceCheckOut;
window.handleDeleteMemberAttendance = handleDeleteMemberAttendance;
window.handleMemberCheckIn = handleMemberCheckIn;
window.openMemberCheckInModal = openMemberCheckInModal;
window.submitMemberCheckIn = submitMemberCheckIn;
