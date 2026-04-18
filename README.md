# 🎓 College Smart Account - MERN Stack

A premium, state-of-the-art college management system designed for seamless fee tracking, scholarship management, and student administration. Built with a focus on modern aesthetics (Glassmorphism) and a clean **MERN Stack** architecture.

---

## 🚀 **Tech Stack**

*   **Frontend**: React (Vite), Axios, React Router, React Icons.
*   **Backend**: Node.js, Express (ES Modules).
*   **Database**: MongoDB Atlas (Mongoose ODM).
*   **Aesthetics**: Vanilla CSS with CSS Modules, Premium Light Theme, Glassmorphism.

---

## 📂 **Project Structure**

The project follows a highly modular "Separation of Concerns" architecture:

```text
├── Frontend/      # React application (Vite-powered)
├── Backend/       # Express server, API Routes, and Controllers (ESM)
└── Database/      # MongoDB Models and Schemas (Mongoose)
```

### **1. 🌐 Frontend**
*   **Pages**: Separate dashboards for Admins and Students.
*   **Components**: Reusable UI elements like Navbar, Footer, and Performance Monitors.
*   **Theming**: Global design tokens for a premium light-themed experience.

### **2. ⚙️ Backend**
*   **API/Routes**: Organized endpoints for Students, Admins, Fees, and Scholarships.
*   **API/Controllers**: Modular business logic separated from routing.
*   **ESM**: Fully converted to ES Modules for modern `import/export` syntax.

### **3. 🗄️ Database**
*   **Models**: Strict Mongoose schemas with validation and virtual fields for frontend compatibility.

---

## ✨ **Key Features**

### **👨‍💼 Admin Features**
*   **Dashboard**: Real-time stats on total students, pending fees, and applications.
*   **Student Management**: Full CRUD (Create, Read, Update, Delete) for student records.
*   **Fee Management**: Generate receipts and track payment histories.
*   **Scholarships**: Manage and approve scholarship programs.

### **🎓 Student Features**
*   **Personal Dashboard**: View fee status, pending dues, and scholarship updates.
*   **Fee Payments**: Review transaction history and download official receipts.
*   **Scholarship Portal**: Apply for available aid and track application status.

---

## 🛠️ **Installation & Setup**

### **1. Environment Config**
Create a `.env` file in the **Backend/** directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
```

### **2. Install Dependencies**
```bash
# Install root dependencies
npm install

# Install Frontend dependencies
cd Frontend && npm install

# Install Backend dependencies
cd ../Backend && npm install
```

### **3. Seed Database**
Populate your MongoDB with demo data:
```bash
cd Backend
npm run seed
```

### **4. Start the Application**
From the root directory:
```bash
npm run dev
```

---

## 🔐 **Authentication Credentials**

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `Password123` |
| **Student** | `john.doe@student.edu` | `Password123` |

---

## 🎨 **Design Philosophy**
*   **Premium Light Theme**: Soft gradients and high-contrast typography.
*   **Glassmorphism**: Translucent card backgrounds for a modern "Apple-like" feel.
*   **Responsive**: Fully optimized for desktops and mobile viewports.

---

## 📜 **License**
MIT License. Created for educational and administrative efficiency.
