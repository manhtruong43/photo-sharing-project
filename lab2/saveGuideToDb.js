const mongoose = require('mongoose');

const dbUrl = 'mongodb://blogtest1:qR5TyA8oj9ZF7xsw@ac-yxezx0n-shard-00-00.tkzyyui.mongodb.net:27017/cs142project7?authSource=admin&replicaSet=atlas-ebpyi7-shard-0&ssl=true&appName=Cluster0';

const guideContent = `Để đi thi và hoàn thành bài thi thực hành code dự án này một cách thành công nhất từ **dự án khung (starter project) trống**, bạn cần có một chiến thuật làm bài rõ ràng, kiểm soát tốt thời gian và nắm vững cấu trúc code lõi. 

Dưới đây là **Cẩm nang Ôn thi & Thực hành chi tiết từ A-Z** giúp bạn tự tin đạt điểm tối đa:

---

# 🎯 CHIẾN THUẬT LÀM BÀI TRONG PHÒNG THI

1. **Chuẩn bị môi trường nhanh chóng (5 phút đầu)**:
   * **Fork & Clone** bài thi về máy ảo của phòng máy hoặc import vào CodeSandbox/VS Code.
   * Chạy lệnh \`npm install\` ở cả 2 thư mục \`lab2\` (Backend) và \`photo-sharing-v1\` (Frontend) ngay lập tức để tải thư viện.
2. **Quy tắc code "Backend trước, Frontend sau"**:
   * Không code frontend nếu API backend chưa chạy được. Hãy dùng Postman hoặc Extension REST Client để test nhanh API.
3. **Triển khai theo thứ tự ưu tiên (Làm đến đâu chắc đến đó)**:
   * **Phần 1**: Cấu hình Model User (Mongoose) -> API Đăng ký -> Giao diện Đăng ký.
   * **Phần 2**: API Đăng nhập -> Lưu Session -> Giao diện Đăng nhập -> Đổi thanh công cụ khi có Session.
   * **Phần 3**: Bảo vệ API (Auth Middleware) -> Bảo vệ Frontend (Redirect nếu chưa đăng nhập).
   * **Phần 4**: API Đăng xuất -> Giao diện Đăng xuất.
   * **Phần 5**: Tính năng Thêm bình luận (Comment).
   * **Phần 6**: Tính năng Tải ảnh lên (Upload Photo).

---

# 📝 BẢN GHI NHỚ CODE LÕI (CHEAT SHEET) CHO TỪNG PHẦN

Bạn hãy ghi nhớ hoặc nắm chắc các đoạn mã nguồn ngắn gọn dưới đây để tự viết lại nhanh chóng trong lúc thi:

### 1. Cấu hình Model (MongoDB/Mongoose)
Mở tệp \`schema/user.js\`, thêm 2 dòng khai báo thuộc tính:
\`\`\`javascript
// schema/user.js
var userSchema = new mongoose.Schema({
    // ... các trường có sẵn ...
    login_name: String,
    password: String,
});
\`\`\`

---

### 2. Thiết lập Session & Bảo vệ API (Auth Middleware)
Mở tệp \`webServer.js\` thiết lập ngay sau phần import thư viện:
\`\`\`javascript
// webServer.js (Phần đầu file)
var session = require('express-session');
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false
}));

// Auth Middleware: Chặn các request chưa đăng nhập
app.use(function(request, response, next) {
    const publicPaths = ['/admin/login', '/admin/logout', '/user'];
    if (publicPaths.includes(request.path) || request.path === '/') {
        return next(); // Cho phép đi tiếp
    }
    // Nếu chưa đăng nhập session, trả về 401
    if (!request.session || !request.session.user_id) {
        return response.status(401).send('Unauthorized');
    }
    next();
});
\`\`\`

---

### 3. Bộ ba API Xác thực (Đăng ký, Đăng nhập, Đăng xuất)
Đặt các API này trong \`webServer.js\`:

* **API Đăng ký (\`POST /user\`)**:
\`\`\`javascript
app.post('/user', function(request, response) {
    const { login_name, password, first_name, last_name } = request.body;
    if (!login_name || !password || !first_name || !last_name) {
        return response.status(400).send('Required fields are missing.');
    }
    // Kiểm tra tên tài khoản đã tồn tại chưa
    User.findOne({ login_name: login_name }, function(err, user) {
        if (err) return response.status(400).send(err.message);
        if (user) return response.status(400).send('Username already exists.');
        
        // Tạo user mới
        User.create(request.body, function(err, newUser) {
            if (err) return response.status(400).send(err.message);
            return response.status(200).send('Success');
        });
    });
});
\`\`\`

* **API Đăng nhập (\`POST /admin/login\`)**:
\`\`\`javascript
app.post('/admin/login', function(request, response) {
    const { login_name, password } = request.body;
    User.findOne({ login_name: login_name, password: password }, function(err, user) {
        if (err || !user) {
            return response.status(400).send('Invalid credentials.');
        }
        // Lưu thông tin người dùng vào Session
        request.session.user_id = user._id;
        request.session.first_name = user.first_name;
        request.session.last_name = user.last_name;
        
        return response.status(200).send(user);
    });
});
\`\`\`

* **API Đăng xuất (\`POST /admin/logout\`)**:
\`\`\`javascript
app.post('/admin/logout', function(request, response) {
    if (!request.session.user_id) {
        return response.status(400).send('Not logged in.');
    }
    request.session.destroy(function(err) {
        if (err) return response.status(400).send('Logout error.');
        return response.status(200).send('Success');
    });
});
\`\`\`

* **API Lấy trạng thái session hiện tại (\`GET /loginUser\`)**:
\`\`\`javascript
app.get('/loginUser', function(request, response) {
    if (request.session && request.session.user_id) {
        return response.status(200).send({
            _id: request.session.user_id,
            first_name: request.session.first_name,
            last_name: request.session.last_name
        });
    }
    return response.status(401).send('Unauthorized');
});
\`\`\`

---

### 4. Triển khai Giao diện Xác thực ở Frontend

* **Đăng ký (Client-side validation)**:
  Trong Component đăng ký, hãy thực hiện kiểm tra mật khẩu khớp nhau trước khi gọi API:
  \`\`\`javascript
  if (password !== confirm_password) {
      setRegError("Passwords do not match.");
      return;
  }
  \`\`\`

* **Bảo vệ định tuyến trong \`App.js\`**:
  Nếu chưa đăng nhập (\`loggedInUser === null\`), bắt buộc ẩn toàn bộ ứng dụng và chỉ hiển thị màn hình đăng nhập:
  \`\`\`javascript
  if (!loggedInUser) {
      return (
          <Router>
              <TopBar loggedInUser={null} />
              <LoginRegister setLoggedInUser={setLoggedInUser} />
          </Router>
      );
  }
  \`\`\`

---

### 5. API và Giao diện Thêm Bình luận (Comments)

* **Backend (\`POST /commentsOfPhoto/:photo_id\`)**:
\`\`\`javascript
app.post('/commentsOfPhoto/:photo_id', function(request, response) {
    const commentText = request.body.comment;
    if (!commentText || commentText.trim().length === 0) {
        return response.status(400).send('Comment empty');
    }
    Photo.findOne({ _id: request.params.photo_id }, function(err, photo) {
        if (err || !photo) return response.status(400).send('Photo not found');
        
        // Đẩy comment mới vào mảng comments của Photo
        const newComment = {
            comment: commentText,
            user_id: request.session.user_id,
            date_time: new Date()
        };
        photo.comments.push(newComment);
        photo.save(function(err) {
            if (err) return response.status(400).send(err.message);
            return response.status(200).send('Success');
        });
    });
});
\`\`\`

* **Frontend (React State Update)**:
  Sau khi gọi API thành công bằng Fetch API, bạn gọi lại hàm tải dữ liệu ảnh (ví dụ: \`loadPhotos()\`) để React cập nhật danh sách ảnh mới nhất và render lại giao diện tức thì.

---

### 6. API và Giao diện Tải ảnh lên (File Upload)

* **Backend (\`POST /photos/new\`)**:
\`\`\`javascript
const multer = require('multer');
const processFormBody = multer({ storage: multer.memoryStorage() }).single('uploadedphoto');
const fs = require('fs');

app.post('/photos/new', function(request, response) {
    processFormBody(request, response, function(err) {
        if (err || !request.file) {
            return response.status(400).send('No file uploaded.');
        }
        
        // Tạo tên tệp độc nhất
        const filename = 'U' + Date.now() + request.file.originalname;
        
        // Ghi tệp vật lý vào thư mục ./images/
        fs.writeFile("./images/" + filename, request.file.buffer, function(err) {
            if (err) return response.status(400).send('Write file error');
            
            // Tạo đối tượng Photo mới trong database
            Photo.create({
                user_id: request.session.user_id,
                file_name: filename,
                date_time: new Date(),
                comments: []
            }, function(err, newPhoto) {
                if (err) return response.status(400).send(err.message);
                return response.status(200).send(newPhoto);
            });
        });
    });
});
\`\`\`

* **Frontend (FormData)**:
  Tải tệp tin bắt buộc phải dùng đối tượng \`FormData\`:
  \`\`\`javascript
  const formData = new FormData();
  formData.append("uploadedphoto", fileInput); // 'uploadedphoto' phải khớp với name cấu hình ở backend
  
  fetch("/photos/new", {
      method: "POST",
      body: formData
  })
  .then(res => res.json())
  .then(() => {
      // Hiển thị thông báo thành công và reload lại danh sách ảnh
  });
  \`\`\`

---

# 🛠 MẸO SỬA LỖI NHANH TRONG PHÒNG THI (TROUBLESHOOTING)

1. **Lỗi "Failed to load users" hoặc "Unauthorized" sau khi đăng nhập thành công**:
   * *Nguyên nhân*: Lỗi Cookie phiên đăng nhập trên trình duyệt ở phòng máy (đặc biệt khi thầy chấm bài qua iframe của CodeSandbox).
   * *Cách khắc phục*: 
     1. Khai báo \`app.enable('trust proxy');\` ở đầu file \`webServer.js\`.
     2. Mở trình duyệt preview ở chế độ **Tab mới (New Window)** để trình duyệt nhận cookie phiên làm việc trực tiếp (First-party Cookie).
2. **Lỗi ảnh không hiển thị (chỉ hiện khung trống hoặc chữ):**
   * *Nguyên nhân*: Đường dẫn ảnh bị sai hoặc thư mục \`./images\` không tồn tại/không có quyền ghi.
   * *Cách khắc phục*: 
     * Đảm bảo đường dẫn của ảnh ở frontend luôn dùng relative path: \`src="/images/tên_ảnh"\`.
     * Kiểm tra xem thư mục \`images\` có nằm trực tiếp trong thư mục backend (\`lab2\`) chưa.
3. **Lỗi "Something is already running on port 3000...":**
   * *Cách xử lý*: Khi chạy React (\`npm start\`), nếu hệ thống hỏi chạy cổng khác không, luôn nhấn **\`y\`** (đồng ý) để React chạy trên cổng \`3001\` (tránh xung đột với cổng \`3000\` của backend NodeJS).

Chúc bạn ôn tập tốt và đạt kết quả cao nhất trong kỳ thi!`;

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully!');
    const db = mongoose.connection.db;
    return db.collection('guides').insertOne({
      title: 'Exam Guide & Cheat Sheet A-Z',
      content: guideContent,
      created_at: new Date()
    });
  })
  .then((result) => {
    console.log('Successfully saved guide text to MongoDB Atlas guides collection!');
    console.log('Inserted Document ID:', result.insertedId);
    return mongoose.disconnect();
  })
  .catch((err) => {
    console.error('Error saving guide to database:', err);
  });
