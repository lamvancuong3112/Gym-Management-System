/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)
 * TẦNG SERVICE API & GIAO TIẾP DỮ LIỆU (api.js)
 * ==============================================================================
 * Mô tả: File này đóng vai trò là tầng trung gian giao tiếp dữ liệu giữa Frontend và Backend.
 * - Hiện tại: Sử dụng MockDB (lưu trữ tại LocalStorage) để demo đầy đủ tính năng CRUD.
 * - Tương lai: Khi nhóm Backend (TV3, TV4) hoàn thành API PHP, chỉ cần đổi `USE_BACKEND_API: true`
 *   là toàn bộ hệ thống sẽ tự động gọi API PHP thật từ MySQL mà KHÔNG CẦN sửa lại giao diện.
 */

const API_CONFIG = {
  USE_BACKEND_API: true,
  BASE_URL: '../../backend/routes'
};

const GymAPI = {
  // ============================================================================
  // 1. NHÓM CHỨC NĂNG XÁC THỰC & TÀI KHOẢN (USERS & AUTHENTICATION)
  // ============================================================================

  /**
   * Đăng nhập hệ thống
   * @param {string} username - Tên đăng nhập
   * @param {string} password - Mật khẩu
   * @returns {Promise<{success: boolean, user?: object, message?: string}>}
   */
  async login(username, password) {

  // ==============================
  // DÙNG MOCK DATABASE
  // ==============================
  if (!API_CONFIG.USE_BACKEND_API) {
    const db = MockDB.getDB();

    const user = db.users.find(
      u =>
        u.Username.toLowerCase() === username.toLowerCase() &&
        u.Status === 'Active'
    );

    if (user) {
      localStorage.setItem(
        'GYM_CURRENT_USER',
        JSON.stringify(user)
      );

      return {
        success: true,
        user: user
      };
    }

    return {
      success: false,
      message: 'Sai tên đăng nhập hoặc tài khoản bị khóa!'
    };
  }

  // ==============================
  // GỌI BACKEND PHP
  // ==============================
  try {

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/auth.php`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'login',
          username: username,
          password: password
        })
      }
    );

    // Kiểm tra HTTP
    if (!response.ok) {
      throw new Error(
        `Backend HTTP Error: ${response.status} ${response.statusText}`
      );
    }

    // Backend phải trả JSON
    const result = await response.json();

    console.log('Login Backend Response:', result);

    if (result.success && result.user) {

      const user = result.user;

      // Chuẩn hóa Role từ Backend
      if (user.Role) {
        user.Role =
          user.Role.charAt(0).toUpperCase() +
          user.Role.slice(1).toLowerCase();
      } else {
        user.Role = 'Member';
      }

      // Nếu Backend có Fullname thì giữ nguyên
      // Nếu chưa có thì dùng Username tạm thời
      user.Fullname = user.Fullname || user.Username;

      // Tự tạo RoleTitle nếu Backend chưa trả
      const roleTitles = {
        Admin: 'Quản lý phòng tập',
        Manager: 'Quản lý phòng tập',
        Staff: 'Nhân viên',
        Trainer: 'Huấn luyện viên',
        Member: 'Hội viên'
      };

      user.RoleTitle =
        user.RoleTitle ||
        roleTitles[user.Role] ||
        'Người dùng';

      // Lưu tài khoản hiện tại
      localStorage.setItem(
        'GYM_CURRENT_USER',
        JSON.stringify(user)
      );

      // Cập nhật lại user cho auth.js sử dụng
      result.user = user;
    }

    // QUAN TRỌNG:
    // return result phải nằm TRONG try,
    // nơi biến result vẫn còn tồn tại.
    return result;

  } catch (error) {

    console.error('Login API Error:', error);

    return {
      success: false,
      message: 'Không thể kết nối đến Backend!'
    };
  }
},


  /**
   * Lấy thông tin tài khoản đang đăng nhập hiện tại
   * @returns {object} Thông tin người dùng
   */
  getCurrentUser() {
    const data = localStorage.getItem('GYM_CURRENT_USER');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    // Mặc định ban đầu: Quản lý Văn Điền (Role: Admin)
    const defaultUser = { UserID: 1, Username: 'admin', Fullname: 'Văn Điền', Role: 'Admin', RoleTitle: 'Quản lý phòng tập' };
    localStorage.setItem('GYM_CURRENT_USER', JSON.stringify(defaultUser));
    return defaultUser;
  },

  /**
   * Thiết lập người dùng hiện tại (Hỗ trợ chuyển đổi nhanh Role để kiểm thử giao diện)
   * @param {object} user 
   */
  setCurrentUser(user) {
    localStorage.setItem('GYM_CURRENT_USER', JSON.stringify(user));
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  logout() {
    localStorage.removeItem('GYM_CURRENT_USER');
    window.location.href = 'login.html';
  },

  /**
   * Lấy toàn bộ danh sách tài khoản hệ thống
   * @returns {Promise<Array>} Danh sách users
   */
  async getUsers() {
  const response = await fetch('../../backend/routes/user.php', {
    method: 'GET',
    credentials: 'include'
  });

  return await response.json();
},

async addUser(user) {
  const response = await fetch('../../backend/routes/user.php', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: user.username,
      password: user.password,
      role: user.role
    })
  });

  return await response.json();
},

async updateUser(user) {
  const response = await fetch('../../backend/routes/user.php', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  });

  return await response.json();
},

async deleteUser(userID) {
  const response = await fetch(
    `../../backend/routes/user.php?id=${userID}`,
    {
      method: 'DELETE',
      credentials: 'include'
    }
  );

  return await response.json();
},

async updateUser(user) {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/user.php`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userID: user.UserID,
          username: user.Username,
          role: String(user.Role).toLowerCase(),
          status: String(user.Status).toLowerCase()
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return result;
    }

    return result;
  } catch (error) {
    console.error('Update User API Error:', error);
    return {
      success: false,
      message: 'Không thể kết nối API'
    };
  }
},
  async addUser(user) {
    const response = await fetch('../../backend/routes/user.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });

    return await response.json();
},

async deleteUser(userID) {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/user.php?id=${userID}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return result;
    }

    return result;
  } catch (error) {
    console.error('Delete User API Error:', error);
    return {
      success: false,
      message: 'Không thể kết nối API'
    };
  }
},

  // ============================================================================
  // 2. NHÓM CHỨC NĂNG QUẢN LÝ HỘI VIÊN (MEMBERS)
  // ============================================================================

  /**
   * Lấy danh sách hội viên (kèm tìm kiếm theo từ khóa)
   * @param {string} query - Từ khóa tìm kiếm (Tên, Mã HV, SĐT)
   * @returns {Promise<Array>} Danh sách hội viên
   */
  /**
   * Lấy danh sách hội viên từ Backend / MySQL
   * ADMIN + STAFF
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách hội viên
   */
  async getMembers(query = '') {

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/member.php`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Get Members Error:', result);
        return [];
      }

      let members = result.data || [];

      // Giữ lại chức năng tìm kiếm cũ ở Frontend
      if (query) {
        const q = query.toLowerCase();

        members = members.filter(m =>
          (m.Fullname && m.Fullname.toLowerCase().includes(q)) ||
          (m.Code && m.Code.toLowerCase().includes(q)) ||
          (m.Phone && m.Phone.includes(q))
        );
      }

      return members;

    } catch (error) {

      console.error('Get Members API Error:', error);

      return [];
    }
  },


  /**
   * Lấy thông tin chi tiết hội viên theo ID
   */
  async getMemberById(id) {

    try {

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/member.php?id=${Number(id)}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Get Member By ID Error:', result);
        return null;
      }

      return result.data || null;

    } catch (error) {

      console.error('Get Member By ID API Error:', error);

      return null;
    }
  },


  /**
   * Thêm hội viên mới
   * ADMIN + STAFF
   */
  /**
 * ============================================================================
 * THÊM HỘI VIÊN + GÓI TẬP + THANH TOÁN
 * Backend sẽ lưu vào:
 * 1. members
 * 2. member_package
 * 3. payments
 * ============================================================================
 */
async addMember(memberData) {

  try {

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/member.php`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        credentials: 'include',

        body: JSON.stringify({

          // ============================
          // THÔNG TIN HỘI VIÊN
          // ============================

          code: memberData.Code,

          fullname: memberData.Fullname,
          gender: memberData.Gender,
          birthDate: memberData.BirthDate,
          phone: memberData.Phone,
          email: memberData.Email,
          address: memberData.Address,
          joinDate: memberData.JoinDate,


          // ============================
          // THÔNG TIN GÓI TẬP
          // ============================

          packageID: Number(memberData.PackageID),

          startDate: memberData.JoinDate,
          endDate: memberData.EndDate,


          // ============================
          // THÔNG TIN THANH TOÁN
          // ============================

          amount: Number(memberData.Price || 0),

          paymentMethod:
            memberData.PaymentMethod || 'VietQR',

          paymentStatus:
            memberData.PaymentStatus ||
            (
              memberData.Status === 'Active'
                ? 'Completed'
                : 'Pending'
            )
        })
      }
    );


    // ============================================================
    // Kiểm tra HTTP response
    // ============================================================

    if (!response.ok) {

      let errorResult = {};

      try {
        errorResult = await response.json();
      } catch (e) {}

      console.error(
        'Add Member HTTP Error:',
        response.status,
        errorResult
      );

      return {
        success: false,
        message:
          errorResult.message ||
          `Backend Error: ${response.status}`
      };
    }


    // ============================================================
    // Đọc JSON từ Backend
    // ============================================================

    const result = await response.json();

    console.log(
      'Add Member Backend Response:',
      result
    );


    // ============================================================
    // Backend báo lỗi
    // ============================================================

    if (!result.success) {

      return {
        success: false,
        message:
          result.message ||
          'Thêm hội viên thất bại'
      };
    }


    // ============================================================
    // Thành công
    // ============================================================

    return {
      success: true,

      message:
        result.message ||
        'Thêm hội viên thành công',

      data: result.data || null
    };


  } catch (error) {

    console.error(
      'Add Member API Error:',
      error
    );

    return {
      success: false,
      message: 'Không thể kết nối đến Backend!'
    };
  }
},


  /**
   * Cập nhật hội viên
   * CHỈ ADMIN
   */
  async updateMember(member) {

    try {

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/member.php`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            memberID: Number(member.MemberID),
            fullname: member.Fullname,
            gender: member.Gender,
            birthDate: member.BirthDate,
            phone: member.Phone,
            email: member.Email,
            address: member.Address,
            joinDate: member.JoinDate,

            packageID: Number(member.PackageID),
            startDate: member.StartDate,
            endDate: member.EndDate,
            status: member.Status
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Update Member Error:', result);

        return {
          success: false,
          message: result.message || 'Cập nhật hội viên thất bại'
        };
      }

      return {
        success: true,
        message: result.message || 'Cập nhật hội viên thành công'
      };

    } catch (error) {

      console.error('Update Member API Error:', error);

      return {
        success: false,
        message: 'Không thể kết nối đến Backend!'
      };
    }
  },


  /**
   * Xóa hội viên
   * CHỈ ADMIN
   */
  async deleteMember(id) {

    try {

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/member.php?id=${Number(id)}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Delete Member Error:', result);

        return {
          success: false,
          message: result.message || 'Xóa hội viên thất bại'
        };
      }

      return {
        success: true,
        message: result.message || 'Xóa hội viên thành công'
      };

    } catch (error) {

      console.error('Delete Member API Error:', error);

      return {
        success: false,
        message: 'Không thể kết nối đến Backend!'
      };
    }
  },
  /**
   * Lấy danh sách các gói tập Gym hiện có
   */
  async getPackages() {
      const response = await fetch('../../backend/routes/package.php', {
          method: 'GET',
          credentials: 'include'
      });

      const result = await response.json();

      if (!result.success) {
          throw new Error(result.message || 'Không thể lấy danh sách gói tập');
      }

      return result.data;
  },

  /**
   * Thêm gói tập mới
   */
  async addPackage(pkg) {
      const response = await fetch('../../backend/routes/package.php', {
          method: 'POST',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(pkg)
      });

      return await response.json();
  },

  /**
   * Cập nhật gói tập
   */
  async updatePackage(pkg) {
      const response = await fetch(
          `${API_CONFIG.BASE_URL}/package.php?id=${pkg.PackageID}`,
          {
              method: 'PUT',
              credentials: 'include',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(pkg)
          }
      );

      return await response.json();
  },
  async deletePackage(pkgId) {
      const response = await fetch(
          `${API_CONFIG.BASE_URL}/package.php?id=${Number(pkgId)}`,
          {
              method: 'DELETE',
              credentials: 'include'
          }
      );

      return await response.json();
  },
  // ============================================================================
  // 4. NHÓM CHỨC NĂNG ĐIỂM DANH (ATTENDANCE)
  // ============================================================================

  /**
   * Lấy lịch sử điểm danh ra/vào phòng tập
   */
  async getAttendance() {
    const db = MockDB.getDB();
    return db.attendance;
  },

  /**
   * Check-in cho hội viên vào tập
   * @param {number} memberId - Mã hội viên
   * @param {string} type - Hình thức tập (Gym & Fitness, Yoga, Cardio, Boxing)
   */
  async checkIn(memberId, type = 'Gym & Fitness') {
    const db = MockDB.getDB();
    const member = db.members.find(m => m.MemberID === Number(memberId));
    if (!member) return { success: false, message: 'Hội viên không tồn tại' };

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    const dateStr = now.toISOString().split('T')[0];

    const newAttendance = {
      AttendanceID: db.attendance.length + 1,
      MemberID: member.MemberID,
      MemberName: member.Fullname,
      MemberCode: member.Code || `HV-${member.MemberID}`,
      CheckInTime: timeStr,
      CheckOutTime: null,
      AttendanceDate: dateStr,
      Type: type
    };

    db.attendance.unshift(newAttendance);
    MockDB.saveDB(db);
    return { success: true, data: newAttendance };
  },

  /**
   * Check-out cho hội viên khi ra về
   * @param {number} attendanceId - Mã bản ghi điểm danh
   */
  async checkOut(attendanceId) {
    const db = MockDB.getDB();
    const record = db.attendance.find(a => a.AttendanceID === Number(attendanceId));
    if (record) {
      const now = new Date();
      record.CheckOutTime = now.toTimeString().split(' ')[0].substring(0, 5);
      MockDB.saveDB(db);
      return { success: true, data: record };
    }
    return { success: false, message: 'Không tìm thấy bản ghi điểm danh' };
  },

  /**
   * Cập nhật thông tin bản ghi chấm công (giờ vào, giờ ra, ngày)
   */
  async updateAttendance(attendanceId, updatedData) {
    const db = MockDB.getDB();
    const record = db.attendance.find(a => a.AttendanceID === Number(attendanceId));
    if (record) {
      Object.assign(record, updatedData);
      MockDB.saveDB(db);
      return { success: true, data: record };
    }
    return { success: false, message: 'Không tìm thấy bản ghi điểm danh' };
  },


  // ============================================================================
  // 5. NHÓM CHỨC NĂNG ĐẶT LỊCH HẸN & BUỔI KÈM (BOOKINGS)
  // ============================================================================

  /**
   * Lấy toàn bộ danh sách lịch hẹn PT
   */
  async getBookings() {
    const db = MockDB.getDB();
    return db.bookings;
  },

  /**
   * Tạo lịch hẹn mới giữa hội viên và huấn luyện viên
   */
  async addBooking(bookingData) {
    const db = MockDB.getDB();
    const newBooking = {
      BookingID: db.bookings.length + 1,
      Status: 'Confirmed',
      AttendanceStatus: 'Chờ tập',
      ...bookingData
    };
    db.bookings.unshift(newBooking);
    MockDB.saveDB(db);
    return { success: true, data: newBooking };
  },

  /**
   * Cập nhật trạng thái lịch hẹn (Confirmed, Completed, Cancelled)
   */
  async updateBookingStatus(id, status, attendanceStatus) {
    const db = MockDB.getDB();
    const booking = db.bookings.find(b => b.BookingID === Number(id));
    if (booking) {
      if (status) booking.Status = status;
      if (attendanceStatus) booking.AttendanceStatus = attendanceStatus;
      MockDB.saveDB(db);
      return { success: true, data: booking };
    }
    return { success: false, message: 'Không tìm thấy lịch hẹn' };
  },

  // ============================================================================
  // 6. NHÓM CHỨC NĂNG HUẤN LUYỆN VIÊN (TRAINERS)
  // ============================================================================

  /**
   * Lấy danh sách Huấn luyện viên
   */
  async getTrainers() {
      const response = await fetch('../../backend/routes/trainer.php', {
          method: 'GET',
          credentials: 'include'
      });

      const result = await response.json();

      if (!result.success) {
          throw new Error(result.message || 'Không thể lấy danh sách HLV');
      }

      return result.data;
  },

  // ============================================================================
  // 7. NHÓM CHỨC NĂNG HÓA ĐƠN & THANH TOÁN (PAYMENTS)
  // ============================================================================

  /**
   * Lấy lịch sử giao dịch và hóa đơn thanh toán
   */
  async getPayments() {
      const response = await fetch(
          `${API_CONFIG.BASE_URL}/payment.php`,
          {
              method: 'GET',
              credentials: 'include'
          }
      );

      return await response.json();
  },

  /**
   * Tạo phiếu thu tiền / hóa đơn mới
   */
  async addTrainer(trainer) {
    const response = await fetch('../../backend/routes/trainer.php', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(trainer)
    });

    return await response.json();
  },
  async updateTrainer(id, trainer) {
    const response = await fetch(
      `../../backend/routes/trainer.php?id=${id}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          TrainerID: id,
          ...trainer
        })
      }
    );
    return await response.json();
  },
  async deleteTrainer(id) {
    const response = await fetch(
      `../../backend/routes/trainer.php?id=${id}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    );

    return await response.json();
  },
  async addPayment(paymentData) {
    const response = await fetch(
        `${API_CONFIG.BASE_URL}/payment.php`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        }
    );

    return await response.json();
  },
  async updatePayment(paymentData) {
    const response = await fetch(
        `${API_CONFIG.BASE_URL}/payment.php`,
        {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        }
    );

    return await response.json();
},

async deletePayment(id) {
    const response = await fetch(
        `${API_CONFIG.BASE_URL}/payment.php?id=${id}`,
        {
            method: 'DELETE',
            credentials: 'include'
        }
    );

    return await response.json();
},

  // ============================================================================
  // 8. NHÓM CHỨC NĂNG MENU DỊCH VỤ & KHO SẢN PHẨM (INVENTORY)
  // ============================================================================

  /**
   * Lấy danh sách sản phẩm / dịch vụ trong kho
   */
  async getInventory() {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/product.php`,
      {
        method: 'GET',
        credentials: 'include'
      }
    );

    return await response.json();
  },


  /**
   * Thêm sản phẩm mới vào kho
   * Admin
   */
  async addInventoryItem(item) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/product.php`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      }
    );

    return await response.json();
  },


  /**
   * Cập nhật thông tin sản phẩm
   * Admin
   */
  async updateInventoryItem(item) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/product.php`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      }
    );

    return await response.json();
  },


  /**
   * Xóa sản phẩm khỏi kho
   * Admin
   */
  async deleteInventoryItem(id) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/product.php?id=${id}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    );

    return await response.json();
  },


  /**
   * Nhập thêm số lượng tồn kho
   * Staff + Admin
   */
  async incrementInventoryStock(id, addQuantity) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/product.php`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ProductID: Number(id),
          addQuantity: Number(addQuantity)
        })
      }
    );

    return await response.json();
  },

  // ============================================================================
  // 9. NHÓM CHỨC NĂNG BẢNG LƯƠNG & CHẤM CÔNG (SALARIES)
  // ============================================================================
  /**
   * Lấy danh sách bảng lương
   * Admin + Staff + Trainer
   */
  async getSalaries() {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/salary.php`,
      {
        method: 'GET',
        credentials: 'include'
      }
    );

    return await response.json();
  },


  /**
   * Lấy bảng lương theo ID
   * Admin + Staff + Trainer
   */
  async getSalaryById(id) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/salary.php?id=${id}`,
      {
        method: 'GET',
        credentials: 'include'
      }
    );

    return await response.json();
  },


  /**
   * Thêm bảng lương
   * Admin
   */
  async addSalary(data) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/salary.php`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    return await response.json();
  },


  /**
   * Cập nhật bảng lương
   * Admin
   */
  async updateSalary(data) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/salary.php`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    return await response.json();
  },


  /**
   * Xóa bảng lương
   * Admin
   */
  async deleteSalary(id) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/salary.php?id=${id}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    );

    return await response.json();
  },
  // ============================================================================
  // 10. NHÓM CHỨC NĂNG CHỈ SỐ INBODY & GIÁO ÁN (PROGRESS & WORKOUT PLANS)
  // ============================================================================

  /**
   * Lấy dữ liệu theo dõi chỉ số InBody
   */
  async getProgress(memberId = null) {
    const db = MockDB.getDB();
    if (memberId) {
      return db.progress.filter(p => p.MemberID === Number(memberId));
    }
    return db.progress;
  },

  /**
   * Ghi nhận chỉ số InBody mới
   */
  async addProgress(progressData) {
    const db = MockDB.getDB();
    const newProg = {
      ProgressID: db.progress.length + 1,
      RecordDate: new Date().toISOString().split('T')[0],
      ...progressData
    };
    db.progress.push(newProg);
    MockDB.saveDB(db);
    return { success: true, data: newProg };
  },

  /**
   * Lấy danh sách giáo án tập luyện
   */
  async getWorkoutPlans(memberId = null) {
    const db = MockDB.getDB();
    const plans = (db && db.workout_plan && db.workout_plan.length > 0) ? db.workout_plan : DEFAULT_DATABASE.workout_plan;
    if (memberId) {
      return plans.filter(w => w.MemberID === Number(memberId));
    }
    return plans;
  },

  /**
   * Lấy danh sách nhận xét và đánh giá sao của HLV
   */
  async getFeedbacks(trainerId = null) {
    const db = MockDB.getDB();
    const feedbacks = (db && db.feedbacks && db.feedbacks.length > 0) ? db.feedbacks : DEFAULT_DATABASE.feedbacks;
    if (trainerId) {
      return feedbacks.filter(f => f.TrainerID === Number(trainerId));
    }
    return feedbacks;
  },

  /**
   * Thêm nhận xét / đánh giá mới từ hội viên
   */
  async addFeedback(feedbackData) {
    const db = MockDB.getDB();
    if (!db.feedbacks) db.feedbacks = [...DEFAULT_DATABASE.feedbacks];
    const newId = db.feedbacks.length > 0 ? Math.max(...db.feedbacks.map(f => f.FeedbackID || 0)) + 1 : 1;
    const newFeedback = {
      FeedbackID: newId,
      TrainerID: Number(feedbackData.TrainerID) || 1,
      TrainerName: feedbackData.TrainerName || 'Nguyễn Minh Tuấn',
      MemberName: feedbackData.MemberName || 'Hội viên ẩn danh',
      Rating: Number(feedbackData.Rating) || 5,
      Comment: feedbackData.Comment || '',
      FeedbackDate: feedbackData.FeedbackDate || new Date().toISOString().split('T')[0]
    };
    db.feedbacks.unshift(newFeedback);
    MockDB.saveDB(db);
    return { success: true, data: newFeedback };
  },

  // ============================================================================
  // 10. NHÓM CHỨC NĂNG CHẤM CÔNG NHÂN VIÊN & HLV (STAFF ATTENDANCE)
  // ============================================================================
  /**
   * Lấy lịch sử chấm công nhân viên / HLV
   */
  async getStaffAttendance() {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/employee_attendance.php`,
      {
        method: 'GET',
        credentials: 'include'
      }
    );

    return await response.json();
  },


  /**
   * Check-in
   */
  async checkInStaff(data = {}) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/employee_attendance.php`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    return await response.json();
  },


  /**
   * Check-out
   */
  async checkOutStaff(attendanceId) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/employee_attendance.php?id=${attendanceId}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      }
    );

    return await response.json();
  },


  /**
   * Xóa ca chấm công - Admin
   */
  async deleteStaffAttendance(attendanceId) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/employee_attendance.php?id=${attendanceId}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    );

    return await response.json();
  },
};
// Đưa đối tượng GymAPI ra phạm vi toàn cục (Global window)
window.GymAPI = GymAPI;